"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const Guild = require("../../db/Guild");
const ct    = require("../../utils/container");

const EVENTS = [
  "channelDelete","channelCreate","channelUpdate",
  "roleDelete","roleCreate","roleUpdate",
  "ban","kick","webhookCreate","botAdd","guildUpdate","memberUpdate"
];

module.exports = {
  name:        "threshold",
  description: "Har event ki action limit aur time window set karo",
  usage:       "!antinuke threshold <event> <limit> <seconds> [on|off]",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const event   = args[0]?.toLowerCase();
    const limit   = parseInt(args[1]);
    const seconds = parseInt(args[2]);
    const toggle  = args[3]?.toLowerCase();

    // List all events
    if (!event || event === "list") {
      const doc = await Guild.getOrCreate(msg.guild.id);
      const list = EVENTS.map(e => {
        const th = doc.thresholds[e];
        return `${th?.enabled ? "✅" : "❌"} **${e}** — ${th?.limit ?? 3} actions / ${(th?.timeWindow ?? 5000)/1000}s`;
      }).join("\n");
      return ct.reply(msg, ct.info("📊 Thresholds", list, [
        { name: "Usage", value: "`!antinuke threshold <event> <limit> <seconds> [on|off]`\nExample: `!antinuke threshold ban 2 5 on`" }
      ]));
    }

    if (!EVENTS.includes(event)) {
      return ct.reply(msg, ct.error("❌ Unknown Event", `Valid events:\n\`${EVENTS.join(", ")}\``));
    }

    const doc = await Guild.getOrCreate(msg.guild.id);
    if (!doc.thresholds[event]) doc.thresholds[event] = { limit: 3, timeWindow: 5000, enabled: true };

    if (!isNaN(limit)   && limit >= 1)   doc.thresholds[event].limit      = limit;
    if (!isNaN(seconds) && seconds >= 1) doc.thresholds[event].timeWindow = seconds * 1000;
    if (toggle === "on")  doc.thresholds[event].enabled = true;
    if (toggle === "off") doc.thresholds[event].enabled = false;

    doc.markModified("thresholds");
    await doc.save();

    const th = doc.thresholds[event];
    return ct.reply(msg, ct.success(
      "✅ Threshold Updated",
      `**${event}** threshold update ho gaya!`,
      [
        { name: "Event",    value: event },
        { name: "Limit",    value: `${th.limit} actions` },
        { name: "Window",   value: `${th.timeWindow/1000} seconds` },
        { name: "Status",   value: th.enabled ? "✅ Enabled" : "❌ Disabled" },
      ]
    ));
  },
};
