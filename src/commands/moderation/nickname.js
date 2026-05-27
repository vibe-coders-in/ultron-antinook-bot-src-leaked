"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "nickname",
  description: "User ka nickname change ya reset karo",
  usage:       "!mod nickname @user [new nickname]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Manage Nicknames** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod nickname @user [new name]`\nNickname nahi doge toh reset ho jayega."));

    const nick    = args.slice(msg.mentions.users.size ? 1 : 1).join(" ") || null;
    const oldNick = target.nickname ?? target.user.username;

    if (!target.manageable) {
      return ct.reply(msg, ct.error("❌ Cannot Edit", `**${target.user.tag}** ka nickname change nahi kar sakta!`));
    }

    try {
      await target.setNickname(nick, `Nickname changed by ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "✏️ Nickname Updated",
        nick ? `**${target.user.tag}** ka nickname change ho gaya!` : `**${target.user.tag}** ka nickname reset ho gaya!`,
        [
          { name: "Old Nick",  value: oldNick },
          { name: "New Nick",  value: nick ?? target.user.username },
          { name: "Moderator", value: msg.author.tag },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Nickname change karne mein error: ${err.message}`));
    }
  },
};
