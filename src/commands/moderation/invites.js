"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "invites",
  description: "Server ke sabhi invites dekho ya delete karo",
  usage:       "!mod invites <list|clear>",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Manage Server** permission nahi hai!"));
    }

    const sub = args[0]?.toLowerCase();

    const invites = await msg.guild.invites.fetch().catch(() => null);
    if (!invites) return ct.reply(msg, ct.error("❌ Error", "Invites fetch karne mein error!"));

    if (sub === "clear") {
      let deleted = 0;
      for (const [, inv] of invites) {
        await inv.delete("[AntiNuke] Invite purge").catch(() => {});
        deleted++;
      }
      return ct.reply(msg, ct.success(
        "🗑️ Invites Cleared",
        `Sabhi **${deleted}** invites delete kar diye!`,
        [{ name: "Moderator", value: msg.author.tag }]
      ));
    }

    // LIST (default)
    if (!invites.size) {
      return ct.reply(msg, ct.info("📨 Invites", "Koi active invite nahi hai!"));
    }

    const list = [...invites.values()].slice(0, 20).map(inv =>
      `**${inv.code}** — by ${inv.inviter?.tag ?? "Unknown"} | Uses: ${inv.uses}/${inv.maxUses || "∞"} | Expires: ${inv.expiresAt ? `<t:${Math.floor(inv.expiresTimestamp/1000)}:R>` : "Never"}`
    ).join("\n");

    return ct.reply(msg, ct.info(
      `📨 Server Invites (${invites.size})`,
      list,
      invites.size > 20 ? [{ name: "Note", value: `Only first 20 shown (total: ${invites.size})` }] : []
    ));
  },
};
