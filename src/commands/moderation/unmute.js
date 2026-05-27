"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "unmute",
  description: "User ka timeout (mute) hatao",
  usage:       "!mod unmute @user [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Moderate Members** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod unmute @user [reason]`"));

    if (!target.isCommunicationDisabled()) {
      return ct.reply(msg, ct.warn("⚠️ Not Muted", `**${target.user.tag}** abhi muted nahi hai!`));
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.timeout(null, `${reason} | Unmuted by: ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "🔊 User Unmuted",
        `**${target.user.tag}** ka mute hata diya!`,
        [
          { name: "User",      value: `${target.user.tag} (\`${target.id}\`)` },
          { name: "Moderator", value: msg.author.tag },
          { name: "Reason",    value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Unmute karne mein error: ${err.message}`));
    }
  },
};
