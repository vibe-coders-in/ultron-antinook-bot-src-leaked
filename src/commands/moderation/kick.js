"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "kick",
  description: "User ko server se kick karo",
  usage:       "!mod kick @user [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Kick Members** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod kick @user [reason]`"));

    const reason = args.slice(1).join(" ") || "No reason provided";

    if (!target.kickable) {
      return ct.reply(msg, ct.error("❌ Cannot Kick", `**${target.user.tag}** ko kick nahi kar sakta!`));
    }
    if (target.id === msg.author.id) {
      return ct.reply(msg, ct.error("❌ Error", "Khud ko kick nahi kar sakte!"));
    }

    try {
      await target.kick(`${reason} | Moderator: ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "👢 User Kicked",
        `**${target.user.tag}** ko kick kar diya gaya!`,
        [
          { name: "User",      value: `${target.user.tag} (\`${target.id}\`)` },
          { name: "Moderator", value: msg.author.tag },
          { name: "Reason",    value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Kick karne mein error: ${err.message}`));
    }
  },
};
