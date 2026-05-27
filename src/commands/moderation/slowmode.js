"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "slowmode",
  description: "Channel ka slowmode set karo",
  usage:       "!mod slowmode <seconds|off> [#channel]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Manage Channels** permission nahi hai!"));
    }

    const input   = args[0]?.toLowerCase();
    const channel = msg.mentions.channels.first() ?? msg.channel;

    if (!input) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod slowmode <0-21600|off> [#channel]`\nExample: `!mod slowmode 5` ya `!mod slowmode off`"));

    const seconds = input === "off" ? 0 : parseInt(input);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return ct.reply(msg, ct.warn("⚠️ Invalid", "0 se 21600 seconds ke beech value do (ya `off`)"));
    }

    try {
      await channel.setRateLimitPerUser(seconds, `Slowmode by ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "⏱️ Slowmode Updated",
        seconds === 0
          ? `<#${channel.id}> ka slowmode off kar diya!`
          : `<#${channel.id}> ka slowmode **${seconds}s** set kar diya!`,
        [{ name: "Moderator", value: msg.author.tag }]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Slowmode set karne mein error: ${err.message}`));
    }
  },
};
