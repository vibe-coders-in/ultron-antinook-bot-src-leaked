"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "clear",
  description: "Channel ke messages bulk delete karo",
  usage:       "!mod clear <1-100> [@user]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Manage Messages** permission nahi hai!"));
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return ct.reply(msg, ct.warn("⚠️ Usage", "`!mod clear <1-100> [@user]`\nExample: `!mod clear 50` ya `!mod clear 20 @user`"));
    }

    const filterUser = msg.mentions.users.first();

    try {
      await msg.delete().catch(() => {});

      let messages = await msg.channel.messages.fetch({ limit: 100 });

      // Filter by user if mentioned
      if (filterUser) {
        messages = messages.filter(m => m.author.id === filterUser.id);
      }

      // Can only bulk delete messages < 14 days old
      const twoWeeks = Date.now() - 1_209_600_000;
      messages = messages.filter(m => m.createdTimestamp > twoWeeks).first(amount);

      if (!messages.length) {
        return ct.send(msg.channel, ct.warn("⚠️ No Messages", "Delete karne ke liye koi valid messages nahi mile! (14 din se purane delete nahi hote)"));
      }

      const deleted = await msg.channel.bulkDelete(messages, true);

      const confirm = await ct.send(msg.channel, ct.success(
        "🗑️ Messages Deleted",
        `**${deleted.size}** messages delete kar diye!`,
        [
          { name: "Channel",    value: `<#${msg.channel.id}>` },
          { name: "Filter",     value: filterUser ? filterUser.tag : "All users" },
          { name: "Moderator",  value: msg.author.tag },
        ]
      ));

      setTimeout(() => confirm?.delete().catch(() => {}), 5000);
    } catch (err) {
      return ct.send(msg.channel, ct.error("❌ Failed", `Messages delete karne mein error: ${err.message}`));
    }
  },
};
