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
  name:        "event",
  description: "Specific AntiNuke event ko on/off karo",
  usage:       "!antinuke event <eventName> <on|off>",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const event  = args[0]?.toLowerCase();
    const toggle = args[1]?.toLowerCase();

    if (!event || !EVENTS.includes(event) || !["on","off"].includes(toggle)) {
      const doc    = await Guild.getOrCreate(msg.guild.id);
      const list   = EVENTS.map(e => {
        const th = doc.thresholds[e];
        return `${th?.enabled ? "✅" : "❌"} \`${e}\``;
      }).join("\n");
      return ct.reply(msg, ct.info(
        "📋 Events",
        `Current event status:\n\n${list}`,
        [{ name: "Usage", value: "`!antinuke event <event> <on|off>`\nExample: `!antinuke event ban on`" }]
      ));
    }

    const doc = await Guild.getOrCreate(msg.guild.id);
    if (!doc.thresholds[event]) doc.thresholds[event] = { limit: 3, timeWindow: 5000, enabled: true };
    doc.thresholds[event].enabled = toggle === "on";
    doc.markModified("thresholds");
    await doc.save();

    return ct.reply(msg, toggle === "on"
      ? ct.success("✅ Event Enabled",  `**${event}** protection ab active hai!`)
      : ct.warn   ("❌ Event Disabled", `**${event}** protection disable kar di — dhyan rakhna!`)
    );
  },
};
