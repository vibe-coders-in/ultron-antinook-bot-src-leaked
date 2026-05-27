"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const ct = require("../../utils/container");

module.exports = {
  name:        "userinfo",
  description: "User ki detailed info dekho",
  usage:       "!mod userinfo [@user]",
  modOnly:     true,

  async execute(client, msg, args) {
    const target = msg.mentions.members.first() ??
                   (args[0] ? await msg.guild.members.fetch(args[0]).catch(() => null) : null) ??
                   msg.member;

    const user   = target.user;
    const joined = target.joinedTimestamp;
    const roles  = target.roles.cache.filter(r => r.id !== msg.guild.id).sort((a,b) => b.position - a.position);

    const flags = [];
    const uf    = user.flags?.toArray() ?? [];
    if (uf.includes("Staff"))                    flags.push("Discord Staff");
    if (uf.includes("Partner"))                  flags.push("Partner");
    if (uf.includes("HypeSquad"))                flags.push("HypeSquad");
    if (uf.includes("BugHunterLevel1"))          flags.push("Bug Hunter");
    if (uf.includes("VerifiedBotDeveloper"))     flags.push("Verified Bot Dev");
    if (uf.includes("ActiveDeveloper"))          flags.push("Active Developer");
    if (target.premiumSinceTimestamp)            flags.push("Server Booster");
    if (user.bot)                                flags.push("Bot");

    return ct.reply(msg, ct.info(
      `👤 ${user.tag}`,
      `ID: \`${user.id}\``,
      [
        { name: "Account Created", value: `<t:${Math.floor(user.createdTimestamp/1000)}:F> (<t:${Math.floor(user.createdTimestamp/1000)}:R>)` },
        { name: "Joined Server",   value: joined ? `<t:${Math.floor(joined/1000)}:F> (<t:${Math.floor(joined/1000)}:R>)` : "Unknown" },
        { name: "Nickname",        value: target.nickname ?? "None" },
        { name: `Roles (${roles.size})`, value: roles.size ? roles.map(r => `<@&${r.id}>`).slice(0,10).join(", ") + (roles.size > 10 ? ` +${roles.size-10} more` : "") : "None" },
        { name: "Badges",          value: flags.length ? flags.join(", ") : "None" },
        { name: "Muted",           value: target.isCommunicationDisabled() ? `Until <t:${Math.floor(target.communicationDisabledUntilTimestamp/1000)}:R>` : "No" },
      ]
    ));
  },
};
