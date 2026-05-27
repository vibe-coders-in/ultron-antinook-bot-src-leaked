"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const Guild = require("../../db/Guild");
const ct    = require("../../utils/container");

module.exports = {
  name:        "punishment",
  description: "Punishment type set karo (ban/kick/strip)",
  usage:       "!antinuke punishment <ban|kick|strip>",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const type = args[0]?.toLowerCase();
    if (!["ban","kick","strip"].includes(type)) {
      return ct.reply(msg, ct.warn(
        "⚠️ Usage",
        "`!antinuke punishment <ban|kick|strip>`\n\n**ban** — nuker ko permanently ban karo\n**kick** — kick karo (rejoin kar sakta hai)\n**strip** — saari dangerous roles hata do + guard role do"
      ));
    }

    const doc = await Guild.getOrCreate(msg.guild.id);
    doc.punishment = type;
    await doc.save();

    const desc = {
      ban:   "Nuker ko server se permanently **BAN** kar diya jayega.",
      kick:  "Nuker ko server se **KICK** kar diya jayega. (Wapas aa sakta hai)",
      strip: "Nuker ki sabhi dangerous roles hat jayengi + AntiNuke Guard role milega.",
    };

    return ct.reply(msg, ct.success(
      "✅ Punishment Updated",
      `Punishment type: **${type.toUpperCase()}**\n\n${desc[type]}`
    ));
  },
};
