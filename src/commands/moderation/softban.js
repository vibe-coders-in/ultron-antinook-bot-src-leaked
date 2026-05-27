"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "softban",
  description: "Softban — ban karke unban (messages delete, server mein reh sakta hai)",
  usage:       "!mod softban @user [reason]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Ban Members** permission nahi hai!"));
    }

    const target = msg.mentions.members.first() || (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null);
    if (!target) return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod softban @user [reason]`"));

    if (!target.bannable) {
      return ct.reply(msg, ct.error("❌ Cannot Ban", `**${target.user.tag}** ko ban nahi kar sakta!`));
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.ban({ reason: `[Softban] ${reason} | By: ${msg.author.tag}`, deleteMessageSeconds: 604800 });
      await msg.guild.members.unban(target.id, `Softban unban | By: ${msg.author.tag}`);

      return ct.reply(msg, ct.success(
        "🔄 User Softbanned",
        `**${target.user.tag}** ko softban kar diya! (7 din ke messages delete, server mein wapas aa sakta hai)`,
        [
          { name: "User",      value: `${target.user.tag} (\`${target.id}\`)` },
          { name: "Moderator", value: msg.author.tag },
          { name: "Reason",    value: reason },
        ]
      ));
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Softban karne mein error: ${err.message}`));
    }
  },
};
