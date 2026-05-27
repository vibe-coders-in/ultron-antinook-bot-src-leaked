"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "undeafen",
  description: "Voice channel mein user ka deafen hatao",
  usage:       "!mod undeafen @user",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.DeafenMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Deafen Members** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod undeafen @user`"));

    if (!target.voice.channel) {
      return ct.reply(msg, ct.warn("⚠️ Not in Voice", `**${target.user.tag}** kisi voice channel mein nahi hai!`));
    }

    try {
      await target.voice.setDeaf(false, `Undeafened by ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "🔔 User Undeafened",
        `**${target.user.tag}** ka deafen hata diya!`,
        [{ name: "Moderator", value: msg.author.tag }]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Undeafen karne mein error: ${err.message}`));
    }
  },
};
