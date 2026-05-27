"use strict";

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "lock",
  description: "Channel ko lock karo — @everyone messages nahi bhej sakta",
  usage:       "!mod lock [#channel] [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Manage Channels** permission nahi hai!"));
    }

    const channel = msg.mentions.channels.first() ?? msg.channel;
    const reason  = args.filter(a => !a.startsWith("<#")).join(" ") || "No reason provided";

    try {
      await channel.permissionOverwrites.edit(
        msg.guild.id, // @everyone role ID = guild ID
        { SendMessages: false },
        { reason: `[Lock] ${msg.author.tag}: ${reason}` }
      );

      return ct.reply(msg, ct.error(
        "🔒 Channel Locked",
        `<#${channel.id}> ko lock kar diya — @everyone ab yahan message nahi bhej sakta!`,
        [
          { name: "Moderator", value: msg.author.tag },
          { name: "Reason",    value: reason },
        ]
      ), { allowedMentions: { parse: [] } });
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Lock karne mein error: ${err.message}`));
    }
  },
};
