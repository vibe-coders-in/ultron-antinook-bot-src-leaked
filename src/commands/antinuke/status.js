"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const Guild = require("../../db/Guild");
const WL    = require("../../db/Whitelist");
const EO    = require("../../db/ExtraOwner");
const ct    = require("../../utils/container");

module.exports = {
  name:        "status",
  description: "AntiNuke ki current status dekho",
  usage:       "!antinuke status",
  ownerOnly:   true,

  async execute(client, msg) {
    const doc = await Guild.findOne({ guildId: msg.guild.id });
    if (!doc) {
      return ct.reply(msg, ct.warn("⚠️ Not Setup", "Pehle `!antinuke setup` run karo!"));
    }

    const wlCount = await WL.countDocuments({ guildId: msg.guild.id });
    const eoCount = await EO.countDocuments({ guildId: msg.guild.id });
    const guardRole = doc.guardRoleId ? `<@&${doc.guardRoleId}>` : "❌ Not created";

    const thresholds = Object.entries(doc.thresholds).map(([k, v]) =>
      `${v.enabled ? "✅" : "❌"} **${k}**: ${v.limit} actions / ${v.timeWindow / 1000}s`
    ).join("\n");

    return ct.reply(msg, ct.info(
      "🛡️ AntiNuke Status",
      `Server: **${msg.guild.name}**`,
      [
        { name: "Protection",    value: doc.antinukeEnabled ? "✅ **ACTIVE**" : "❌ **DISABLED**" },
        { name: "Punishment",    value: `🔨 **${doc.punishment.toUpperCase()}**` },
        { name: "Guard Role",    value: guardRole },
        { name: "Log Channel",   value: doc.logChannelId ? `<#${doc.logChannelId}>` : "❌ Not set" },
        { name: "Whitelist",     value: `${wlCount} users | WL Limit: ${doc.wlMaxActions} actions / ${doc.wlTimeWindow / 1000}s` },
        { name: "Extra Owners",  value: `${eoCount}/2` },
        { name: "Anti-Raid",     value: doc.antiRaid?.enabled ? `✅ (${doc.antiRaid.joinThreshold} joins/${doc.antiRaid.joinTimeWindow/1000}s → ${doc.antiRaid.action})` : "❌ Off" },
        { name: "Thresholds",    value: thresholds },
      ]
    ));
  },
};
