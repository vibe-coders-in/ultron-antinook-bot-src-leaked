"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const Guild = require("../../db/Guild");
const ct    = require("../../utils/container");

module.exports = {
  name:        "setup",
  description: "AntiNuke setup karo — guard role banao aur protection enable karo",
  usage:       "!antinuke setup [#log-channel]",
  ownerOnly:   true,

  async execute(client, msg, args) {
    await ct.reply(msg, ct.info("⚙️ Setting Up...", "AntiNuke guard role ban raha hoon..."));

    const guild = msg.guild;
    const doc   = await Guild.getOrCreate(guild.id);

    // ── 1. Log channel ──────────────────────────────────────────────────
    const mentioned = msg.mentions.channels.first();
    if (mentioned) doc.logChannelId = mentioned.id;

    // ── 2. Create / reuse AntiNuke Guard role ───────────────────────────
    let guardRole = doc.guardRoleId ? guild.roles.cache.get(doc.guardRoleId) : null;

    if (!guardRole) {
      try {
        guardRole = await guild.roles.create({
          name:        "🛡️ AntiNuke Guard",
          color:       0xFF0000,
          permissions: BigInt(0), // Zero permissions — cannot do anything
          reason:      "[AntiNuke] Auto-created guard role",
          hoist:       false,
          mentionable: false,
        });
        doc.guardRoleId = guardRole.id;
      } catch (err) {
        await ct.reply(msg, ct.error("❌ Role Creation Failed", `Guard role nahi ban saka: ${err.message}`));
        return;
      }
    }

    // ── 3. Position: 3rd from top (below @everyone anchor at bottom, place below bot) ─
    try {
      const botRole  = guild.members.me.roles.highest;
      const target   = Math.max(botRole.position - 2, 1); // 3rd position from bot role
      await guild.roles.setPosition(guardRole, target, { reason: "[AntiNuke] Guard role positioning" });
    } catch {}

    // ── 4. Enable protection ────────────────────────────────────────────
    doc.antinukeEnabled = true;
    doc.setupDone       = true;
    await doc.save();

    // ── 5. Ensure bot can manage roles properly ─────────────────────────
    const missing = [];
    const botPerms = guild.members.me.permissions;
    if (!botPerms.has(PermissionFlagsBits.BanMembers))     missing.push("Ban Members");
    if (!botPerms.has(PermissionFlagsBits.KickMembers))    missing.push("Kick Members");
    if (!botPerms.has(PermissionFlagsBits.ManageRoles))    missing.push("Manage Roles");
    if (!botPerms.has(PermissionFlagsBits.ViewAuditLog))   missing.push("View Audit Log");

    const fields = [
      { name: "🛡️ Guard Role",   value: `<@&${guardRole.id}> (Position: ${guardRole.position})` },
      { name: "📋 Log Channel",  value: doc.logChannelId ? `<#${doc.logChannelId}>` : "❌ Not set — use `!antinuke setup #channel`" },
      { name: "🔨 Punishment",   value: doc.punishment.toUpperCase() },
      { name: "⚠️ Note",        value: "Guard role pe hone se whitelist **nahi milti** — yeh sirf bot ka authority marker hai" },
    ];

    if (missing.length) {
      fields.push({ name: "⚠️ Missing Permissions", value: missing.map(p => `• ${p}`).join("\n") });
    }

    await ct.reply(msg, ct.success(
      "✅ AntiNuke Setup Complete",
      `Server **${guild.name}** pe full protection active ho gayi!\n\n**Events Protected:**\nChannel Delete/Create • Role Delete/Create • Mass Ban/Kick • Webhook Create • Bot Add • Guild Update • Anti-Raid • Perm Escalation • Role Escalation`,
      fields
    ));
  },
};
