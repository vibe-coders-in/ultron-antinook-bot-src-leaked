"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits, ChannelType } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "move",
  description: "User ko ek voice channel se doosre mein move karo",
  usage:       "!mod move @user #voice-channel",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Move Members** permission nahi hai!"));
    }

    const target  = msg.mentions.members.first();
    const channel = msg.mentions.channels.first() ||
                    (args[1] ? msg.guild.channels.cache.get(args[1]) : null);

    if (!target || !channel) {
      return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod move @user #voice-channel`\nExample: `!mod move @user #General-VC`"));
    }

    if (channel.type !== ChannelType.GuildVoice && channel.type !== ChannelType.GuildStageVoice) {
      return ct.reply(msg, ct.error("❌ Not a Voice Channel", "Ek voice channel mention karo!"));
    }

    if (!target.voice.channel) {
      return ct.reply(msg, ct.warn("⚠️ Not in Voice", `**${target.user.tag}** kisi voice channel mein nahi hai!`));
    }

    try {
      await target.voice.setChannel(channel, `Moved by ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "🎵 User Moved",
        `**${target.user.tag}** ko move kar diya!`,
        [
          { name: "From",      value: target.voice.channel?.name ?? "Unknown" },
          { name: "To",        value: channel.name },
          { name: "Moderator", value: msg.author.tag },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Move karne mein error: ${err.message}`));
    }
  },
};
