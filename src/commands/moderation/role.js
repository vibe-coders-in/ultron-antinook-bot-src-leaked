"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "role",
  description: "User ko role do ya hatao",
  usage:       "!mod role <add|remove> @user @role",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Manage Roles** permission nahi hai!"));
    }

    const sub    = args[0]?.toLowerCase();
    const target = msg.mentions.members.first();
    const role   = msg.mentions.roles.first() ||
                   (args[2] ? msg.guild.roles.cache.get(args[2]) ?? msg.guild.roles.cache.find(r => r.name.toLowerCase() === args.slice(2).join(" ").toLowerCase()) : null);

    if (!["add","remove"].includes(sub) || !target || !role) {
      return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod role <add|remove> @user @role`\nExample: `!mod role add @user @Member`"));
    }

    const botHighest = msg.guild.members.me.roles.highest.position;
    if (role.position >= botHighest) {
      return ct.reply(msg, ct.error("❌ Cannot Edit", `**${role.name}** meri role se zyada high hai!`));
    }
    if (role.managed) {
      return ct.reply(msg, ct.error("❌ Bot Role", `**${role.name}** ek managed (bot) role hai — change nahi ho sakta!`));
    }

    try {
      if (sub === "add") {
        if (target.roles.cache.has(role.id)) {
          return ct.reply(msg, ct.warn("⚠️ Already Has Role", `**${target.user.tag}** ke paas pehle se **${role.name}** role hai!`));
        }
        await target.roles.add(role, `Role add by ${msg.author.tag}`);
        return ct.reply(msg, ct.success(
          "✅ Role Added",
          `**${target.user.tag}** ko **${role.name}** role de diya!`,
          [{ name: "Moderator", value: msg.author.tag }]
        ));
      } else {
        if (!target.roles.cache.has(role.id)) {
          return ct.reply(msg, ct.warn("⚠️ No Role", `**${target.user.tag}** ke paas **${role.name}** role nahi tha!`));
        }
        await target.roles.remove(role, `Role removed by ${msg.author.tag}`);
        return ct.reply(msg, ct.success(
          "✅ Role Removed",
          `**${target.user.tag}** se **${role.name}** role hata diya!`,
          [{ name: "Moderator", value: msg.author.tag }]
        ));
      }
    } catch (err) {
      return ct.reply(msg, ct.error("❌ Failed", `Role action mein error: ${err.message}`));
    }
  },
};
