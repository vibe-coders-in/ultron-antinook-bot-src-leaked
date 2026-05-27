"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct  = require("../../utils/container");
const EO  = require("../../db/ExtraOwner");

module.exports = {
  name:        "massban",
  description: "Multiple users ko ek saath ban karo (IDs space se alag karo)",
  usage:       "!mod massban <id1> <id2> ... [reason: text]",
  ownerOnly:   true,

  async execute(client, msg, args) {
    // Only owner/extra-owner can mass-ban
    const isOwner = msg.author.id === msg.guild.ownerId;
    const isEO    = await EO.findOne({ guildId: msg.guild.id, userId: msg.author.id });
    if (!isOwner && !isEO) {
      return ct.reply(msg, ct.error("❌ Forbidden", "Mass ban sirf server owner ya extra owners kar sakte hain!"));
    }

    // Parse: IDs until "reason:" keyword
    const reasonIdx = args.findIndex(a => a.toLowerCase().startsWith("reason:"));
    const ids       = (reasonIdx === -1 ? args : args.slice(0, reasonIdx)).filter(a => /^\d{17,20}$/.test(a));
    const reason    = reasonIdx !== -1 ? args.slice(reasonIdx).join(" ").replace(/^reason:\s*/i, "") : "Mass ban";

    if (!ids.length) {
      return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod massban <id1> <id2> ... [reason: text]`\nExample: `!mod massban 111 222 333 reason: spam bots`"));
    }

    const results = { success: [], failed: [] };
    for (const id of ids) {
      try {
        await msg.guild.members.ban(id, { reason: `[MassBan] ${reason} | By: ${msg.author.tag}`, deleteMessageSeconds: 86400 });
        results.success.push(id);
      } catch {
        results.failed.push(id);
      }
    }

    return ct.reply(msg, ct.error(
      "🔨 Mass Ban Complete",
      `**${results.success.length}** users ban kiye, **${results.failed.length}** failed.`,
      [
        { name: "✅ Banned",  value: results.success.length ? results.success.map(id => `\`${id}\``).join(", ") : "None" },
        { name: "❌ Failed",  value: results.failed.length ? results.failed.map(id => `\`${id}\``).join(", ") : "None" },
        { name: "Reason",     value: reason },
        { name: "By",         value: msg.author.tag },
      ]
    ));
  },
};
