"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "ban",
  description: "User ko server se ban karo",
  usage:       "!mod ban @user [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Ban Members** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod ban @user [reason]`"));

    const reason = args.slice(msg.mentions.users.size ? 1 : 1).join(" ") || "No reason provided";

    if (!target.bannable) {
      return ct.reply(msg, ct.error("❌ Cannot Ban", `**${target.user.tag}** ko ban nahi kar sakta — unki role zyada high hai!`));
    }
    if (target.id === msg.author.id) {
      return ct.reply(msg, ct.error("❌ Error", "Khud ko ban nahi kar sakte!"));
    }

    try {
      await target.ban({ reason: `${reason} | Moderator: ${msg.author.tag}`, deleteMessageSeconds: 86400 });
      return ct.reply(msg, ct.success(
        "🔨 User Banned",
        `**${target.user.tag}** ko ban kar diya gaya!`,
        [
          { name: "User",       value: `${target.user.tag} (\`${target.id}\`)` },
          { name: "Moderator",  value: msg.author.tag },
          { name: "Reason",     value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Ban karne mein error: ${err.message}`));
    }
  },
};
