"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const Guild = require("../../db/Guild");
const ct    = require("../../utils/container");

module.exports = {
  name:        "antiraid",
  description: "Anti-raid protection configure karo",
  usage:       "!antinuke antiraid <on|off|setup> [joins] [seconds] [kick|ban]",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const sub = args[0]?.toLowerCase();
    const doc = await Guild.getOrCreate(msg.guild.id);

    if (sub === "on") {
      doc.antiRaid.enabled = true;
      await doc.save();
      return ct.reply(msg, ct.success("✅ Anti-Raid Enabled", `${doc.antiRaid.joinThreshold} joins in ${doc.antiRaid.joinTimeWindow/1000}s → ${doc.antiRaid.action}`));
    }

    if (sub === "off") {
      doc.antiRaid.enabled = false;
      await doc.save();
      return ct.reply(msg, ct.warn("❌ Anti-Raid Disabled", "Anti-raid protection band kar di!"));
    }

    if (sub === "setup") {
      const joins   = parseInt(args[1]);
      const seconds = parseInt(args[2]);
      const action  = args[3]?.toLowerCase();

      if (isNaN(joins) || isNaN(seconds) || joins < 2 || seconds < 1) {
        return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke antiraid setup <joins> <seconds> <kick|ban>`\nExample: `!antinuke antiraid setup 10 8 kick`"));
      }
      if (action && !["kick","ban"].includes(action)) {
        return ct.reply(msg, ct.error("❌ Error", "Action sirf `kick` ya `ban` ho sakta hai!"));
      }

      doc.antiRaid.joinThreshold  = joins;
      doc.antiRaid.joinTimeWindow = seconds * 1000;
      if (action) doc.antiRaid.action = action;
      doc.antiRaid.enabled = true;
      doc.markModified("antiRaid");
      await doc.save();

      return ct.reply(msg, ct.success(
        "✅ Anti-Raid Configured",
        "Anti-raid protection update ho gayi!",
        [
          { name: "Trigger",  value: `${doc.antiRaid.joinThreshold} joins in ${doc.antiRaid.joinTimeWindow/1000}s` },
          { name: "Action",   value: doc.antiRaid.action.toUpperCase() },
          { name: "Status",   value: "✅ Active" },
        ]
      ));
    }

    const ar = doc.antiRaid;
    return ct.reply(msg, ct.info(
      "🚨 Anti-Raid Status",
      `Current anti-raid configuration:`,
      [
        { name: "Status",  value: ar.enabled ? "✅ Active" : "❌ Off" },
        { name: "Trigger", value: `${ar.joinThreshold} joins / ${ar.joinTimeWindow/1000}s` },
        { name: "Action",  value: ar.action.toUpperCase() },
        { name: "Usage",   value: "`!antinuke antiraid <on|off|setup> [joins] [seconds] [kick|ban]`" },
      ]
    ));
  },
};
