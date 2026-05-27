"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const Warning = require("../../db/Warning");
const ct      = require("../../utils/container");

module.exports = {
  name:        "clearwarns",
  description: "User ki sabhi warnings clear karo",
  usage:       "!mod clearwarns @user",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas yeh command use karne ki permission nahi hai!"));
    }

    const target = msg.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod clearwarns @user`"));

    const result = await Warning.deleteMany({ guildId: msg.guild.id, userId: target.id });
    if (!result.deletedCount) {
      return ct.reply(msg, ct.info("ℹ️ No Warnings", `**${target.tag}** ke koi warnings nahi the!`));
    }

    return ct.reply(msg, ct.success(
      "✅ Warnings Cleared",
      `**${target.tag}** ki sabhi **${result.deletedCount}** warnings delete kar di!`,
      [{ name: "Moderator", value: msg.author.tag }]
    ));
  },
};
