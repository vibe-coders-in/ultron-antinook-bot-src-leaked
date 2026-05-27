"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "deafen",
  description: "Voice channel mein user ko deafen karo",
  usage:       "!mod deafen @user [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.DeafenMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Deafen Members** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod deafen @user [reason]`"));

    if (!target.voice.channel) {
      return ct.reply(msg, ct.warn("⚠️ Not in Voice", `**${target.user.tag}** kisi voice channel mein nahi hai!`));
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.voice.setDeaf(true, `${reason} | By: ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "🔕 User Deafened",
        `**${target.user.tag}** ko voice mein deafen kar diya!`,
        [
          { name: "Voice Channel", value: target.voice.channel.name },
          { name: "Moderator",     value: msg.author.tag },
          { name: "Reason",        value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Deafen karne mein error: ${err.message}`));
    }
  },
};
