"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const Warning = require("../../db/Warning");
const ct      = require("../../utils/container");

module.exports = {
  name:        "warn",
  description: "User ko warning do",
  usage:       "!mod warn @user [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Moderate Members** permission nahi hai!"));
    }

    const target = msg.mentions.users.first() || (args[0] ? await client.users.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod warn @user [reason]`"));
    if (target.bot) return ct.reply(msg, ct.error("❌ Error", "Bots ko warn nahi kar sakte!"));

    const reason = args.slice(1).join(" ") || "No reason provided";

    const w = await Warning.create({
      guildId:     msg.guild.id,
      userId:      target.id,
      moderatorId: msg.author.id,
      reason,
    });

    const totalWarns = await Warning.countDocuments({ guildId: msg.guild.id, userId: target.id });

    return ct.reply(msg, ct.warn(
      "⚠️ Warning Issued",
      `**${target.tag}** ko warning #${totalWarns} di gayi!`,
      [
        { name: "User",        value: `${target.tag} (\`${target.id}\`)` },
        { name: "Warning #",   value: `${totalWarns}` },
        { name: "Moderator",   value: msg.author.tag },
        { name: "Reason",      value: reason },
        { name: "Warning ID",  value: `\`${w._id}\`` },
      ]
    ));
  },
};
