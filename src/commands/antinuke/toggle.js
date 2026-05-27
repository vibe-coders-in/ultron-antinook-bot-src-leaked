"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const Guild = require("../../db/Guild");
const ct    = require("../../utils/container");

module.exports = {
  name:        "toggle",
  description: "AntiNuke on ya off karo",
  usage:       "!antinuke toggle <on|off>",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const input = args[0]?.toLowerCase();
    if (!["on","off","enable","disable","true","false"].includes(input)) {
      return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke toggle <on|off>`"));
    }

    const enabled = ["on","enable","true"].includes(input);
    const doc     = await Guild.getOrCreate(msg.guild.id);
    doc.antinukeEnabled = enabled;
    await doc.save();

    return ct.reply(msg, enabled
      ? ct.success("✅ AntiNuke Enabled",  "Sabhi protection active ho gayi!")
      : ct.error  ("❌ AntiNuke Disabled", "AntiNuke protection band kar di — dhyan rakhna!")
    );
  },
};
