"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "unlock",
  description: "Channel ko unlock karo — @everyone wapas message bhej sakta hai",
  usage:       "!mod unlock [#channel]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Manage Channels** permission nahi hai!"));
    }

    const channel = msg.mentions.channels.first() ?? msg.channel;

    try {
      await channel.permissionOverwrites.edit(
        msg.guild.id,
        { SendMessages: null }, // Reset to inherit
        { reason: `[Unlock] ${msg.author.tag}` }
      );

      return ct.reply(msg, ct.success(
        "🔓 Channel Unlocked",
        `<#${channel.id}> unlock ho gaya — @everyone ab yahan message bhej sakta hai!`,
        [{ name: "Moderator", value: msg.author.tag }]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Unlock karne mein error: ${err.message}`));
    }
  },
};
