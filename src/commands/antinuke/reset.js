"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const tracker = require("../../core/Tracker");
const ct      = require("../../utils/container");

module.exports = {
  name:        "reset",
  description: "Kisi user ki tracker data reset karo (actions count 0 ho jayega)",
  usage:       "!antinuke reset @user",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const target = msg.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke reset @user`"));

    tracker.resetUser(msg.guild.id, target.id);

    return ct.reply(msg, ct.success(
      "✅ Tracker Reset",
      `**${target.tag}** ki sabhi action tracking data reset ho gayi!\nAb se clean slate se shuru hoga.`
    ));
  },
};
