"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const EO = require("../../db/ExtraOwner");
const ct = require("../../utils/container");

const MAX_EXTRA_OWNERS = 2;

module.exports = {
  name:           "extraowner",
  description:    "Extra owner assign karo (max 2, sirf server owner de sakta hai)",
  usage:          "!antinuke extraowner <add|remove|list> [@user]",
  guildOwnerOnly: true,  // ONLY guild's actual owner, not even bot owner

  async execute(client, msg, args) {
    const sub = args[0]?.toLowerCase();

    // This command is STRICTLY for the guild's original owner
    if (msg.author.id !== msg.guild.ownerId) {
      return ct.reply(msg, ct.error(
        "❌ Strictly Forbidden",
        "Extra Owner sirf **is server ke original owner** ke dwara set kiya ja sakta hai.\nBot owner bhi yeh nahi kar sakta!"
      ));
    }

    // ── LIST ─────────────────────────────────────────────────────────────
    if (sub === "list") {
      const entries = await EO.find({ guildId: msg.guild.id });
      if (!entries.length) {
        return ct.reply(msg, ct.info("👑 Extra Owners", "Koi extra owner set nahi hai. (Max: 2)"));
      }
      const list = entries.map((e, i) => `**${i+1}.** <@${e.userId}> — Added: <t:${Math.floor(e.addedAt/1000)}:R>`).join("\n");
      return ct.reply(msg, ct.purple(
        "👑 Extra Owners",
        list,
        [{ name: "Info", value: "Extra owners bot ke sabhi checks se FULLY exempt hain. Unhe fully trust karo!" }]
      ));
    }

    // ── ADD ───────────────────────────────────────────────────────────────
    if (sub === "add") {
      const target = msg.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
      if (!target) {
        return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke extraowner add @user`"));
      }
      if (target.bot) {
        return ct.reply(msg, ct.error("❌ Error", "Bots ko extra owner nahi banaya ja sakta!"));
      }
      if (target.id === msg.guild.ownerId) {
        return ct.reply(msg, ct.info("ℹ️", "Server owner pehle se hi fully exempt hai!"));
      }

      const count = await EO.countDocuments({ guildId: msg.guild.id });
      if (count >= MAX_EXTRA_OWNERS) {
        return ct.reply(msg, ct.error(
          "❌ Limit Reached",
          `Maximum **${MAX_EXTRA_OWNERS}** extra owners allowed hain per server!\nPehle kisi ko remove karo.`
        ));
      }

      try {
        await EO.create({ guildId: msg.guild.id, userId: target.id, addedBy: msg.author.id });
        return ct.reply(msg, ct.success(
          "👑 Extra Owner Added",
          `**${target.tag}** ab **Extra Owner** hai!\n\nWoh ab bot ke **sabhi** checks se exempt hai — unhe fully trust karo.`,
          [{ name: "Slots Used", value: `${count + 1}/${MAX_EXTRA_OWNERS}` }]
        ));
      } catch {
        return ct.reply(msg, ct.warn("⚠️ Already Set", `**${target.tag}** pehle se extra owner hai!`));
      }
    }

    // ── REMOVE ────────────────────────────────────────────────────────────
    if (sub === "remove") {
      const target = msg.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);
      if (!target) {
        return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke extraowner remove @user`"));
      }

      const deleted = await EO.deleteOne({ guildId: msg.guild.id, userId: target.id });
      if (!deleted.deletedCount) {
        return ct.reply(msg, ct.warn("⚠️ Not Found", `**${target.tag}** extra owner nahi tha!`));
      }
      return ct.reply(msg, ct.success("✅ Removed", `**${target.tag}** ki extra owner status hata di!`));
    }

    return ct.reply(msg, ct.warn("⚠️ Usage", "`!antinuke extraowner <add|remove|list> [@user]`"));
  },
};
