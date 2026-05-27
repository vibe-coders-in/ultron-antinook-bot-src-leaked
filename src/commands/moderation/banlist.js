"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const { PermissionFlagsBits } = require("discord.js");
const ct = require("../../utils/container");

module.exports = {
  name:        "banlist",
  description: "Server ke banned users ki list dekho",
  usage:       "!mod banlist [page]",
  modOnly:     true,

  async execute(client, msg, args) {
    if (!msg.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas **Ban Members** permission nahi hai!"));
    }

    const bans = await msg.guild.bans.fetch();
    if (!bans.size) {
      return ct.reply(msg, ct.info("📋 Ban List", "Is server mein koi banned user nahi hai!"));
    }

    const page     = Math.max(1, parseInt(args[0]) || 1);
    const perPage  = 15;
    const pages    = Math.ceil(bans.size / perPage);
    const slice    = [...bans.values()].slice((page - 1) * perPage, page * perPage);

    const list = slice.map((b, i) =>
      `**${(page-1)*perPage + i + 1}.** ${b.user.tag} (\`${b.user.id}\`) — ${b.reason ?? "No reason"}`
    ).join("\n");

    return ct.reply(msg, ct.error(
      `🔨 Ban List — ${msg.guild.name}`,
      list,
      [
        { name: "Total Bans", value: `${bans.size}` },
        { name: "Page",       value: `${page}/${pages}` },
      ]
    ));
  },
};
