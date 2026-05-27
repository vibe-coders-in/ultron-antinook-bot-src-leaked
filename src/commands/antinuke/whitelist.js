"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const Guild = require("../../db/Guild");
const WL    = require("../../db/Whitelist");
const ct    = require("../../utils/container");

module.exports = {
  name:        "whitelist",
  description: "Whitelist manage karo (add/remove/list/limit)",
  usage:       "!antinuke whitelist <add|remove|list|limit> [@user|number]",
  ownerOnly:   true,

  async execute(client, msg, args) {
    const sub = args[0]?.toLowerCase();
    const doc = await Guild.getOrCreate(msg.guild.id);

    // ── LIST ─────────────────────────────────────────────────────────────
    if (sub === "list") {
      const entries = await WL.find({ guildId: msg.guild.id });
      if (!entries.length) {
        return ct.reply(msg, ct.info("📋 Whitelist", "Abhi whitelist empty hai!"));
      }
      const list = entries.map((e, i) => `**${i+1}.** <@${e.userId}> (\`${e.userId}\`) — Added by <@${e.addedBy}>`).join("\n");
      return ct.reply(msg, ct.info(
        "📋 Whitelist",
        list,
        [{ name: "WL Action Limit", value: `${doc.wlMaxActions} actions per ${doc.wlTimeWindow/1000}s (even for WL users)` }]
      ));
    }

    // ── LIMIT (owner sets max actions even WL users can do) ───────────────
    if (sub === "limit") {
      const actions = parseInt(args[1]);
      const window  = args[2] ? parseInt(args[2]) * 1000 : null; // optional seconds -> ms

      if (isNaN(actions) || actions < 1) {
        return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke whitelist limit <max-actions> [time-seconds]`\nExample: `!antinuke whitelist limit 5 10`"));
      }

      // Only server owner can set this limit
      if (msg.author.id !== msg.guild.ownerId && msg.author.id !== msg.client?.config?.ownerId) {
        return ct.reply(msg, ct.error("❌ Forbidden", "Whitelist limit sirf **server ka original owner** set kar sakta hai!"));
      }

      doc.wlMaxActions = actions;
      if (window) doc.wlTimeWindow = window;
      await doc.save();

      return ct.reply(msg, ct.success(
        "✅ WL Limit Updated",
        `Whitelist wale users ab sirf **${actions} actions** kar sakte hain **${doc.wlTimeWindow/1000}s** mein.\nIs se zyada karenge toh bhi punish honge!`
      ));
    }

    // ── ADD ───────────────────────────────────────────────────────────────
    if (sub === "add") {
      const target = msg.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
      if (!target) {
        return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke whitelist add @user`"));
      }
      if (target.id === msg.guild.ownerId) {
        return ct.reply(msg, ct.info("ℹ️ Already Ignored", "Server owner pehle se hi fully protected hai!"));
      }

      try {
        await WL.create({ guildId: msg.guild.id, userId: target.id, addedBy: msg.author.id });
        return ct.reply(msg, ct.success(
          "✅ Whitelisted",
          `**${target.tag}** ko whitelist kar diya gaya!\n⚠️ Yeh ban bhi hote hain agar limit (**${doc.wlMaxActions} actions/${doc.wlTimeWindow/1000}s**) cross karein!`
        ));
      } catch {
        return ct.reply(msg, ct.warn("⚠️ Already Whitelisted", `**${target.tag}** pehle se whitelist mein hai!`));
      }
    }

    // ── REMOVE ────────────────────────────────────────────────────────────
    if (sub === "remove") {
      const target = msg.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
      if (!target) {
        return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke whitelist remove @user`"));
      }

      const deleted = await WL.deleteOne({ guildId: msg.guild.id, userId: target.id });
      if (!deleted.deletedCount) {
        return ct.reply(msg, ct.warn("⚠️ Not Found", `**${target.tag}** whitelist mein nahi tha!`));
      }
      return ct.reply(msg, ct.success("✅ Removed", `**${target.tag}** ko whitelist se hata diya!`));
    }

    return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke whitelist <add|remove|list|limit>`"));
  },
};
