"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const ct = require("../../utils/container");

module.exports = {
  name:        "mute",
  description: "User ko timeout (mute) karo",
  usage:       "!mod mute @user <duration> [reason]  |  duration: 10m, 1h, 1d, max 28d",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Moderate Members** permission nahi hai!"));
    }

    const target   = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    const durStr   = args[msg.mentions.users.size ? 1 : 1] ?? "";
    const duration = ms(durStr);

    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod mute @user <10m|1h|1d> [reason]`"));
    if (!duration || duration < 5000 || duration > 2419200000) {
      return ct.reply(msg, ct.warn("⚠️ Invalid Duration", "Valid duration do — min **5s**, max **28d**\nExample: `10m`, `1h`, `2d`"));
    }

    const reason = args.slice(msg.mentions.users.size ? 2 : 2).join(" ") || "No reason provided";

    if (!target.moderatable) {
      return ct.reply(msg, ct.error("❌ Cannot Mute", `**${target.user.tag}** ko mute nahi kar sakta!`));
    }

    try {
      await target.timeout(duration, `${reason} | Moderator: ${msg.author.tag}`);
      return ct.reply(msg, ct.success(
        "🔇 User Muted",
        `**${target.user.tag}** ko **${durStr}** ke liye mute kar diya!`,
        [
          { name: "User",      value: `${target.user.tag} (\`${target.id}\`)` },
          { name: "Duration",  value: durStr },
          { name: "Expires",   value: `<t:${Math.floor((Date.now() + duration) / 1000)}:R>` },
          { name: "Moderator", value: msg.author.tag },
          { name: "Reason",    value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Mute karne mein error: ${err.message}`));
    }
  },
};
