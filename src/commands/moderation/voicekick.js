"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "voicekick",
  description: "User ko voice channel se disconnect karo",
  usage:       "!mod voicekick @user [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Move Members** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod voicekick @user [reason]`"));

    if (!target.voice.channel) {
      return ct.reply(msg, ct.warn("⚠️ Not in Voice", `**${target.user.tag}** kisi voice channel mein nahi hai!`));
    }

    const reason    = args.slice(1).join(" ") || "No reason provided";
    const oldChannel = target.voice.channel.name;

    try {
      await target.voice.disconnect(`${reason} | By: ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "🎤 Voice Kicked",
        `**${target.user.tag}** ko voice channel se disconnect kar diya!`,
        [
          { name: "Was in",    value: oldChannel },
          { name: "Moderator", value: msg.author.tag },
          { name: "Reason",    value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Voice kick karne mein error: ${err.message}`));
    }
  },
};
