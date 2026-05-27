"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { AuditLogEvent, PermissionFlagsBits } = require("discord.js");
const tracker  = require("./Tracker");
const Guild    = require("../db/Guild");
const WL       = require("../db/Whitelist");
const EO       = require("../db/ExtraOwner");
const logger   = require("../utils/logger");

// ── In-Memory Caches for Hyper-Fast Nuke Response ────────────────────────────
const guildConfigCache = new Map();
const userPermCache    = new Map();
const auditCache       = new Map();

async function getGuildDoc(guildId) {
  const cached = guildConfigCache.get(guildId);
  if (cached && (Date.now() - cached.timestamp < 30_000)) return cached.doc;
  const doc = await Guild.findOne({ guildId });
  guildConfigCache.set(guildId, { doc, timestamp: Date.now() });
  return doc;
}

async function getUserPerms(guildId, userId) {
  const key = `${guildId}:${userId}`;
  const cached = userPermCache.get(key);
  if (cached && (Date.now() - cached.timestamp < 30_000)) return cached;
  const eo = await EO.findOne({ guildId, userId });
  const wl = await WL.findOne({ guildId, userId });
  const perms = { isEO: !!eo, isWL: !!wl, wlDoc: wl, timestamp: Date.now() };
  userPermCache.set(key, perms);
  return perms;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fetch latest audit log executor (within 4s) - Cached for 2s
// ─────────────────────────────────────────────────────────────────────────────
async function getExecutor(guild, event, targetId = null) {
  const cacheKey = `${guild.id}:${event}`;
  const cached = auditCache.get(cacheKey);
  // Re-use executor if it's within 2 seconds (bypasses Discord Rate Limit during mass nuke)
  if (cached && (Date.now() - cached.timestamp < 2000)) return cached.executor;

  try {
    const logs = await guild.fetchAuditLogs({ type: event, limit: 1 });
    const e    = logs.entries.first();
    if (!e) return null;
    if (Date.now() - e.createdTimestamp > 4500) return null;
    if (targetId && e.target?.id && e.target.id !== targetId) return null;
    
    auditCache.set(cacheKey, { executor: e.executor, timestamp: Date.now() });
    return e.executor;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check if a user is a bot-config owner (extra owner or real owner)
// ─────────────────────────────────────────────────────────────────────────────
async function isFullyIgnored(guildId, userId, guildOwnerId, botOwnerId) {
  if (userId === botOwnerId)   return true;
  if (userId === guildOwnerId) return true;
  const perms = await getUserPerms(guildId, userId);
  return perms.isEO;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: punish a nuker
// ─────────────────────────────────────────────────────────────────────────────
async function punish(guild, executor, reason, guildDoc, logChannelId) {
  if (!executor) return;
  if (tracker.isLocked(guild.id, executor.id)) return;

  tracker.lock(guild.id, executor.id, 20_000);

  const punishment = guildDoc.punishment || "ban";
  let member;
  try { member = await guild.members.fetch(executor.id); } catch { member = null; }

  // Safety: don't punch above bot's position
  if (member) {
    const botMember = guild.members.me;
    if (member.roles.highest.position >= botMember.roles.highest.position) {
      await logger.log(guild, logChannelId, "warn",
        "⚠️ Punishment skipped",
        `Could not punish **${executor.tag}** — their role is higher than mine.`
      );
      return;
    }
  }

  try {
    if (punishment === "ban") {
      await guild.members.ban(executor.id, {
        reason:          `[AntiNuke] ${reason}`,
        deleteMessageSeconds: 86400,
      });
    } else if (punishment === "kick") {
      if (member) await member.kick(`[AntiNuke] ${reason}`);
    } else if (punishment === "strip") {
      if (member) {
        const dangerous = member.roles.cache.filter(r =>
          r.permissions.has(PermissionFlagsBits.Administrator)  ||
          r.permissions.has(PermissionFlagsBits.BanMembers)     ||
          r.permissions.has(PermissionFlagsBits.KickMembers)    ||
          r.permissions.has(PermissionFlagsBits.ManageChannels) ||
          r.permissions.has(PermissionFlagsBits.ManageGuild)    ||
          r.permissions.has(PermissionFlagsBits.ManageRoles)    ||
          r.permissions.has(PermissionFlagsBits.ManageWebhooks)
        );
        for (const [, role] of dangerous) {
          await member.roles.remove(role, `[AntiNuke] ${reason}`).catch(() => {});
        }
        // Add guard role if exists
        if (guildDoc.guardRoleId) {
          const guardRole = guild.roles.cache.get(guildDoc.guardRoleId);
          if (guardRole) await member.roles.add(guardRole).catch(() => {});
        }
      }
    }

    await logger.log(guild, logChannelId, "error",
      "🔨 Nuker Punished",
      `**User:** ${executor.tag} (\`${executor.id}\`)\n**Punishment:** ${punishment.toUpperCase()}\n**Reason:** ${reason}`,
      [{ name: "Server", value: guild.name }, { name: "Time", value: `<t:${Math.floor(Date.now()/1000)}:R>` }]
    );
  } catch (err) {
    await logger.log(guild, logChannelId, "warn",
      "❌ Punishment Failed",
      `Failed to punish **${executor.tag}**: ${err.message}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AntiNuke class — register all event handlers on a client
// ─────────────────────────────────────────────────────────────────────────────
class AntiNuke {
  constructor(client, botOwnerId) {
    this.client     = client;
    this.botOwnerId = botOwnerId;
    this._registered = false;
  }

  /** Call this once on bot start (or from !antinuke setup) */
  register() {
    if (this._registered) return;
    this._registered = true;

    const c = this.client;

    c.on("channelCreate",          ch           => this._handle(ch.guild,    AuditLogEvent.ChannelCreate,     null,        ch.id,     "channelCreate", `Mass Channel Create`));
    c.on("channelDelete",          ch           => this._handle(ch.guild,    AuditLogEvent.ChannelDelete,     null,        ch.id,     "channelDelete", `Mass Channel Delete`));
    c.on("channelUpdate",          (_o, n)      => this._handleChUpdate(_o, n));
    c.on("roleCreate",             r            => this._handle(r.guild,     AuditLogEvent.RoleCreate,        null,        r.id,      "roleCreate",    `Mass Role Create`));
    c.on("roleDelete",             r            => this._handle(r.guild,     AuditLogEvent.RoleDelete,        null,        r.id,      "roleDelete",    `Mass Role Delete`));
    c.on("roleUpdate",             (o, n)       => this._handleRoleUpdate(o, n));
    c.on("guildBanAdd",            ban          => this._handle(ban.guild,   AuditLogEvent.MemberBanAdd,      null,        ban.user.id,"ban",          `Mass Ban`));
    c.on("guildMemberRemove",      m            => this._handleKick(m));
    c.on("guildMemberAdd",         m            => this._handleJoin(m));
    c.on("guildMemberUpdate",      (o, n)       => this._handleMemberUpdate(o, n));
    c.on("guildUpdate",            (o, n)       => this._handleGuildUpdate(o, n));
    c.on("webhookUpdate",          ch           => this._handleWebhook(ch));
    c.on("guildIntegrationsUpdate",guild        => this._handleBotAdd(guild));

    console.log("✅  AntiNuke events registered");
  }

  // ── Generic handler ────────────────────────────────────────────────────────
  async _handle(guild, auditEvent, extra, targetId, trackKey, reason) {
    if (!guild) return;
    const doc = await getGuildDoc(guild.id);
    if (!doc?.antinukeEnabled) return;

    const th = doc.thresholds[trackKey];
    if (!th?.enabled) return;

    const executor = await getExecutor(guild, auditEvent, targetId);
    if (!executor) return;
    if (await isFullyIgnored(guild.id, executor.id, guild.ownerId, this.botOwnerId)) return;

    // Check if whitelisted
    const perms = await getUserPerms(guild.id, executor.id);
    const wl = perms.wlDoc;
    if (wl) {
      // Whitelisted users still have a limit (wlMaxActions)
      const exceeded = tracker.track(guild.id, executor.id, `wl_${trackKey}`, doc.wlMaxActions, doc.wlTimeWindow);
      if (!exceeded) return; // Under limit — allow
    }

    const exceeded = tracker.track(guild.id, executor.id, trackKey, th.limit, th.timeWindow);
    if (!exceeded) return;

    await punish(guild, executor, reason, doc, doc.logChannelId);
  }

  // ── Channel update: detect @everyone perm wipe ─────────────────────────────
  async _handleChUpdate(oldCh, newCh) {
    if (!newCh.guild) return;
    const doc = await getGuildDoc(newCh.guild.id);
    if (!doc?.antinukeEnabled) return;
    if (!doc.thresholds.channelUpdate?.enabled) return;

    const everyoneOld = oldCh.permissionOverwrites?.cache.get(newCh.guild.id);
    const everyoneNew = newCh.permissionOverwrites?.cache.get(newCh.guild.id);
    if (!everyoneOld || !everyoneNew) return;
    if (everyoneOld.deny.bitfield === everyoneNew.deny.bitfield) return;

    const executor = await getExecutor(newCh.guild, AuditLogEvent.ChannelOverwriteUpdate, newCh.id);
    if (!executor) return;
    if (await isFullyIgnored(newCh.guild.id, executor.id, newCh.guild.ownerId, this.botOwnerId)) return;

    const perms = await getUserPerms(newCh.guild.id, executor.id);
    const wl = perms.wlDoc;
    const th = doc.thresholds.channelUpdate;

    if (wl) {
      const exceeded = tracker.track(newCh.guild.id, executor.id, "wl_channelUpdate", doc.wlMaxActions, doc.wlTimeWindow);
      if (!exceeded) {
        await logger.log(newCh.guild, doc.logChannelId, "warn", "⚠️ Channel Perm Wipe (WL)", `**${executor.tag}** modified @everyone perms in <#${newCh.id}>`);
        return;
      }
    }

    const exceeded = tracker.track(newCh.guild.id, executor.id, "channelUpdate", th.limit, th.timeWindow);
    if (exceeded) {
      await punish(newCh.guild, executor, "Mass Channel Permission Modification", doc, doc.logChannelId);
    } else {
      await logger.log(newCh.guild, doc.logChannelId, "warn", "⚠️ Perm Wipe Detected", `**${executor.tag}** changed @everyone perms in <#${newCh.id}>`);
    }
  }

  // ── Role update: dangerous perm escalation ─────────────────────────────────
  async _handleRoleUpdate(oldRole, newRole) {
    if (!newRole.guild) return;
    const doc = await getGuildDoc(newRole.guild.id);
    if (!doc?.antinukeEnabled) return;
    if (!doc.thresholds.roleUpdate?.enabled) return;

    const DANGER = [
      PermissionFlagsBits.Administrator,
      PermissionFlagsBits.BanMembers,
      PermissionFlagsBits.KickMembers,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageWebhooks,
    ];

    const gained = DANGER.filter(p => !oldRole.permissions.has(p) && newRole.permissions.has(p));
    if (!gained.length) return;

    const executor = await getExecutor(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);
    if (!executor) return;
    if (await isFullyIgnored(newRole.guild.id, executor.id, newRole.guild.ownerId, this.botOwnerId)) return;

    // Auto-revert regardless of threshold
    try {
      await newRole.setPermissions(oldRole.permissions.bitfield, "[AntiNuke] Dangerous perm reverted");
    } catch {}

    const perms = await getUserPerms(newRole.guild.id, executor.id);
    const wl = perms.wlDoc;
    const th = doc.thresholds.roleUpdate;

    if (wl) {
      const ex = tracker.track(newRole.guild.id, executor.id, "wl_roleUpdate", doc.wlMaxActions, doc.wlTimeWindow);
      if (!ex) {
        await logger.log(newRole.guild, doc.logChannelId, "warn", "⚠️ Perm Escalation (WL)", `**${executor.tag}** tried to escalate **${newRole.name}** — reverted.`);
        return;
      }
    }

    const exceeded = tracker.track(newRole.guild.id, executor.id, "roleUpdate", th.limit, th.timeWindow);
    if (exceeded) {
      await punish(newRole.guild, executor, "Dangerous Role Permission Escalation", doc, doc.logChannelId);
    } else {
      await logger.log(newRole.guild, doc.logChannelId, "warn", "⚠️ Role Perm Reverted", `**${executor.tag}** tried to add dangerous perms to **${newRole.name}** — auto-reverted.`);
    }
  }

  // ── Member kick detection ──────────────────────────────────────────────────
  async _handleKick(member) {
    if (!member.guild) return;
    const doc = await getGuildDoc(member.guild.id);
    if (!doc?.antinukeEnabled) return;
    if (!doc.thresholds.kick?.enabled) return;

    const executor = await getExecutor(member.guild, AuditLogEvent.MemberKick, member.id);
    if (!executor || executor.id === member.id) return;
    if (await isFullyIgnored(member.guild.id, executor.id, member.guild.ownerId, this.botOwnerId)) return;

    const perms = await getUserPerms(member.guild.id, executor.id);
    const wl = perms.wlDoc;
    const th = doc.thresholds.kick;

    if (wl) {
      const ex = tracker.track(member.guild.id, executor.id, "wl_kick", doc.wlMaxActions, doc.wlTimeWindow);
      if (!ex) return;
    }

    const exceeded = tracker.track(member.guild.id, executor.id, "kick", th.limit, th.timeWindow);
    if (exceeded) await punish(member.guild, executor, "Mass Kick", doc, doc.logChannelId);
  }

  // ── Anti-Raid: mass join detection ─────────────────────────────────────────
  async _handleJoin(member) {
    const doc = await getGuildDoc(member.guild.id);
    if (!doc?.antinukeEnabled || !doc.antiRaid?.enabled) return;

    const { joinThreshold, joinTimeWindow, action } = doc.antiRaid;
    const flooded = tracker.trackJoin(member.guild.id, joinThreshold, joinTimeWindow);

    if (flooded) {
      await logger.log(member.guild, doc.logChannelId, "error",
        "🚨 RAID DETECTED",
        `**${joinThreshold}** joins detected within **${joinTimeWindow / 1000}s**!\nAction: **${action.toUpperCase()}**`
      );
      try {
        if (action === "kick") {
          await member.kick("[AntiNuke] Anti-Raid protection").catch(() => {});
        } else if (action === "ban") {
          await member.guild.members.ban(member.id, { reason: "[AntiNuke] Anti-Raid protection" }).catch(() => {});
        }
      } catch {}
    }
  }

  // ── Member update: dangerous role addition ─────────────────────────────────
  async _handleMemberUpdate(oldMember, newMember) {
    if (!newMember.guild) return;
    const doc = await getGuildDoc(newMember.guild.id);
    if (!doc?.antinukeEnabled) return;
    if (!doc.thresholds.memberUpdate?.enabled) return;

    const added = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
    const dangerous = added.filter(r =>
      r.permissions.has(PermissionFlagsBits.Administrator) ||
      r.permissions.has(PermissionFlagsBits.BanMembers)    ||
      r.permissions.has(PermissionFlagsBits.ManageGuild)
    );
    if (!dangerous.size) return;

    const executor = await getExecutor(newMember.guild, AuditLogEvent.MemberRoleUpdate, newMember.id);
    if (!executor) return;
    if (await isFullyIgnored(newMember.guild.id, executor.id, newMember.guild.ownerId, this.botOwnerId)) return;

    // Auto-remove dangerous roles immediately
    for (const [, role] of dangerous) {
      await newMember.roles.remove(role, "[AntiNuke] Unauthorized role grant").catch(() => {});
    }

    const perms = await getUserPerms(newMember.guild.id, executor.id);
    const wl = perms.wlDoc;
    const th = doc.thresholds.memberUpdate;

    if (wl) {
      const ex = tracker.track(newMember.guild.id, executor.id, "wl_memberUpdate", doc.wlMaxActions, doc.wlTimeWindow);
      if (!ex) {
        await logger.log(newMember.guild, doc.logChannelId, "warn", "⚠️ Dangerous Role Grant (WL)", `**${executor.tag}** gave dangerous role(s) to **${newMember.user.tag}** — removed.`);
        return;
      }
    }

    const exceeded = tracker.track(newMember.guild.id, executor.id, "memberUpdate", th.limit, th.timeWindow);
    if (exceeded) {
      await punish(newMember.guild, executor, "Mass Dangerous Role Grant", doc, doc.logChannelId);
    } else {
      await logger.log(newMember.guild, doc.logChannelId, "warn", "⚠️ Role Grant Blocked", `**${executor.tag}** tried to give admin role to **${newMember.user.tag}** — auto-removed.`);
    }
  }

  // ── Guild update: name/settings change ────────────────────────────────────
  async _handleGuildUpdate(oldGuild, newGuild) {
    const doc = await getGuildDoc(newGuild.id);
    if (!doc?.antinukeEnabled) return;
    if (!doc.thresholds.guildUpdate?.enabled) return;

    const executor = await getExecutor(newGuild, AuditLogEvent.GuildUpdate);
    if (!executor) return;
    if (await isFullyIgnored(newGuild.id, executor.id, newGuild.ownerId, this.botOwnerId)) return;

    const changes = [];
    if (oldGuild.name              !== newGuild.name)              changes.push(`Name: **${oldGuild.name}** → **${newGuild.name}**`);
    if (oldGuild.vanityURLCode     !== newGuild.vanityURLCode)     changes.push(`Vanity URL changed`);
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) changes.push(`Verification level changed`);
    if (!changes.length) return;

    // Auto-revert name
    if (oldGuild.name !== newGuild.name) {
      await newGuild.setName(oldGuild.name, "[AntiNuke] Auto-reverted").catch(() => {});
    }

    const perms = await getUserPerms(newGuild.id, executor.id);
    const wl = perms.wlDoc;
    const th = doc.thresholds.guildUpdate;

    if (wl) {
      const ex = tracker.track(newGuild.id, executor.id, "wl_guildUpdate", doc.wlMaxActions, doc.wlTimeWindow);
      if (!ex) {
        await logger.log(newGuild, doc.logChannelId, "warn", "⚠️ Guild Update (WL)", `**${executor.tag}** modified guild — reverted.`);
        return;
      }
    }

    const exceeded = tracker.track(newGuild.id, executor.id, "guildUpdate", th.limit, th.timeWindow);
    if (exceeded) {
      await punish(newGuild, executor, "Mass Guild Settings Modification", doc, doc.logChannelId);
    } else {
      await logger.log(newGuild, doc.logChannelId, "warn", "⚠️ Guild Update Reverted", changes.join("\n"));
    }
  }

  // ── Webhook: auto-delete on creation ──────────────────────────────────────
  async _handleWebhook(channel) {
    if (!channel.guild) return;
    const doc = await getGuildDoc(channel.guild.id);
    if (!doc?.antinukeEnabled) return;
    if (!doc.thresholds.webhookCreate?.enabled) return;

    const executor = await getExecutor(channel.guild, AuditLogEvent.WebhookCreate);
    if (!executor) return;
    if (await isFullyIgnored(channel.guild.id, executor.id, channel.guild.ownerId, this.botOwnerId)) return;

    // Immediately delete the webhook
    try {
      const webhooks = await channel.fetchWebhooks();
      for (const [, wh] of webhooks) {
        if (Date.now() - wh.createdTimestamp < 5000) {
          await wh.delete("[AntiNuke] Unauthorized webhook").catch(() => {});
        }
      }
    } catch {}

    const perms = await getUserPerms(channel.guild.id, executor.id);
    const wl = perms.wlDoc;
    const th = doc.thresholds.webhookCreate;

    if (wl) {
      const ex = tracker.track(channel.guild.id, executor.id, "wl_webhookCreate", doc.wlMaxActions, doc.wlTimeWindow);
      if (!ex) {
        await logger.log(channel.guild, doc.logChannelId, "warn", "⚠️ Webhook Deleted (WL)", `**${executor.tag}** created a webhook in <#${channel.id}> — deleted.`);
        return;
      }
    }

    const exceeded = tracker.track(channel.guild.id, executor.id, "webhookCreate", th.limit, th.timeWindow);
    if (exceeded) {
      await punish(channel.guild, executor, "Mass Webhook Creation", doc, doc.logChannelId);
    } else {
      await logger.log(channel.guild, doc.logChannelId, "warn", "⚠️ Webhook Deleted", `**${executor.tag}** created an unauthorized webhook — deleted.`);
    }
  }

  // ── Bot add: unauthorized bot detection ────────────────────────────────────
  async _handleBotAdd(guild) {
    const doc = await getGuildDoc(guild.id);
    if (!doc?.antinukeEnabled) return;
    if (!doc.thresholds.botAdd?.enabled) return;

    try {
      const logs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 });
      const e    = logs.entries.first();
      if (!e || Date.now() - e.createdTimestamp > 4500) return;

      const executor = e.executor;
      if (!executor) return;
      if (await isFullyIgnored(guild.id, executor.id, guild.ownerId, this.botOwnerId)) return;

      const th = doc.thresholds.botAdd;
      const perms = await getUserPerms(guild.id, executor.id);
      const wl = perms.wlDoc;

      if (wl) {
        const ex = tracker.track(guild.id, executor.id, "wl_botAdd", doc.wlMaxActions, doc.wlTimeWindow);
        if (!ex) {
          await logger.log(guild, doc.logChannelId, "warn", "⚠️ Bot Added (WL)", `**${executor.tag}** added bot **${e.target?.tag}**.`);
          return;
        }
      }

      // Kick the added bot immediately
      const botMember = await guild.members.fetch(e.target.id).catch(() => null);
      if (botMember) await botMember.kick("[AntiNuke] Unauthorized bot").catch(() => {});

      const exceeded = tracker.track(guild.id, executor.id, "botAdd", th.limit, th.timeWindow);
      if (exceeded) {
        await punish(guild, executor, "Unauthorized Bot Addition", doc, doc.logChannelId);
      } else {
        await logger.log(guild, doc.logChannelId, "warn", "⚠️ Bot Removed", `**${executor.tag}** added **${e.target?.tag}** — removed.`);
      }
    } catch {}
  }
}

module.exports = AntiNuke;
