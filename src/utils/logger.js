"use strict";

const ct = require("../utils/container");
const { MessageFlags } = require("discord.js");

/**
 * Send a structured log to the guild's log channel.
 * allowedMentions: { parse: [] } — no pings leak.
 *
 * @param {import("discord.js").Guild} guild
 * @param {string} logChannelId
 * @param {"success"|"error"|"warn"|"info"} type
 * @param {string} title
 * @param {string} body
 * @param {{ name:string, value:string }[]} [fields]
 */
async function log(guild, logChannelId, type, title, body, fields = []) {
  if (!logChannelId) return;
  const channel = guild.channels.cache.get(logChannelId);
  if (!channel?.isTextBased()) return;

  const container = ct[type]?.(title, body, fields) ?? ct.info(title, body, fields);

  await channel.send({
    components:      [container],
    flags:           MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
  }).catch(() => null);
}

module.exports = { log };
