"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const Guild = require("../../db/Guild");
const ct    = require("../../utils/container");

module.exports = {
  name:        "logchannel",
  description: "Log channel set karo jahan sabhi AntiNuke alerts ayenge",
  usage:       "!antinuke logchannel <#channel>",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const channel = msg.mentions.channels.first();
    if (!channel?.isTextBased()) {
      return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke logchannel #channel`\nEk text channel mention karo!"));
    }

    const doc = await Guild.getOrCreate(msg.guild.id);
    doc.logChannelId = channel.id;
    await doc.save();

    return ct.reply(msg, ct.success(
      "✅ Log Channel Set",
      `Sabhi AntiNuke alerts ab <#${channel.id}> mein ayenge!`
    ));
  },
};
