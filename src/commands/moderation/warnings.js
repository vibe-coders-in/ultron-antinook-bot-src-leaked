"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const Warning = require("../../db/Warning");
const ct      = require("../../utils/container");

module.exports = {
  name:        "warnings",
  description: "User ki sabhi warnings dekho",
  usage:       "!mod warnings @user",
  modOnly:     true,

  async execute(client, msg, args) {
    const target = msg.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod warnings @user`"));

    const warns = await Warning.find({ guildId: msg.guild.id, userId: target.id }).sort({ createdAt: -1 }).limit(20);
    if (!warns.length) {
      return ct.reply(msg, ct.info("📋 Warnings", `**${target.tag}** ke koi warnings nahi hain!`));
    }

    const list = warns.map((w, i) =>
      `**#${i+1}** — ${w.reason}\n*by <@${w.moderatorId}> • <t:${Math.floor(w.createdAt/1000)}:R>*\nID: \`${w._id}\``
    ).join("\n\n");

    return ct.reply(msg, ct.warn(
      `⚠️ Warnings — ${target.tag}`,
      list,
      [{ name: "Total", value: `${warns.length} warnings` }]
    ));
  },
};
