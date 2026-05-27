"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const ct = require("../../utils/container");

module.exports = {
  name:        "serverinfo",
  description: "Server ki detailed info dekho",
  usage:       "!mod serverinfo",
  modOnly:     true,

  async execute(client, msg) {
    const g       = msg.guild;
    const members = await g.members.fetch();
    const bots    = members.filter(m => m.user.bot).size;
    const humans  = members.size - bots;
    const online  = members.filter(m => m.presence?.status !== "offline" && m.presence?.status !== undefined).size;

    const channels   = g.channels.cache;
    const textCh     = channels.filter(c => c.type === 0).size;
    const voiceCh    = channels.filter(c => c.type === 2).size;
    const categoryCh = channels.filter(c => c.type === 4).size;

    const verLevel = ["None","Low","Medium","High","Very High"][g.verificationLevel] ?? "Unknown";
    const boosts   = g.premiumSubscriptionCount ?? 0;
    const tier     = g.premiumTier;

    return ct.reply(msg, ct.purple(
      `🏠 ${g.name}`,
      `ID: \`${g.id}\``,
      [
        { name: "Owner",        value: `<@${g.ownerId}> (\`${g.ownerId}\`)` },
        { name: "Created",      value: `<t:${Math.floor(g.createdTimestamp/1000)}:F>` },
        { name: "Members",      value: `Total: ${g.memberCount} | Humans: ${humans} | Bots: ${bots} | Online: ${online}` },
        { name: "Channels",     value: `Text: ${textCh} | Voice: ${voiceCh} | Categories: ${categoryCh}` },
        { name: "Roles",        value: `${g.roles.cache.size}` },
        { name: "Emojis",       value: `${g.emojis.cache.size}` },
        { name: "Verification", value: verLevel },
        { name: "Boosts",       value: `${boosts} (Tier ${tier})` },
        { name: "Features",     value: g.features.length ? g.features.slice(0,5).map(f => f.replace(/_/g," ")).join(", ") : "None" },
      ]
    ));
  },
};
