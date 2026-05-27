"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "unban",
  description: "User ko unban karo",
  usage:       "!mod unban <userId> [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Ban Members** permission nahi hai!"));
    }

    const userId = args[0];
    if (!userId) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod unban <userId> [reason]`\nExample: `!mod unban 123456789012345678`"));

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      const ban = await msg.guild.bans.fetch(userId).catch(() => null);
      if (!ban) return ct.reply(msg, ct.warn("⚠️ Not Banned", `User \`${userId}\` is server mein banned nahi hai!`));

      await msg.guild.members.unban(userId, `${reason} | Moderator: ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "✅ User Unbanned",
        `**${ban.user.tag}** ko unban kar diya!`,
        [
          { name: "User",      value: `${ban.user.tag} (\`${userId}\`)` },
          { name: "Moderator", value: msg.author.tag },
          { name: "Reason",    value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Unban karne mein error: ${err.message}`));
    }
  },
};
