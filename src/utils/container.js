"use strict";

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

// ── Color palette ────────────────────────────────────────────────────────────
const C = {
  success: 0x00FF88,
  error:   0xFF4455,
  warn:    0xFFA500,
  info:    0x5865F2,
  purple:  0xAB47BC,
  white:   0xFFFFFF,
  dark:    0x2B2D31,
};

// ── Core builder ─────────────────────────────────────────────────────────────

/**
 * Build a ContainerBuilder with color, title, body, and optional fields.
 *
 * @param {keyof C | number} color
 * @param {string} title   - shown as ## heading
 * @param {string} body    - markdown body text
 * @param {{ name:string, value:string }[]} [fields]
 * @returns {ContainerBuilder}
 */
function build(color, title, body, fields = []) {
  const accent = typeof color === "string" ? C[color] ?? C.info : color;
  const c = new ContainerBuilder().setAccentColor(accent);

  if (title) {
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${title}`)
    );
  }

  if (body) {
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(body)
    );
  }

  if (fields.length) {
    c.addSeparatorComponents(
      new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Small)
        .setDivider(true)
    );
    for (const f of fields) {
      c.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${f.name}**\n${f.value}`)
      );
    }
  }

  return c;
}

// ── Shortcuts ─────────────────────────────────────────────────────────────────

const success = (title, body, fields)  => build("success", title, body, fields);
const error   = (title, body, fields)  => build("error",   title, body, fields);
const warn    = (title, body, fields)  => build("warn",    title, body, fields);
const info    = (title, body, fields)  => build("info",    title, body, fields);
const purple  = (title, body, fields)  => build("purple",  title, body, fields);

// ── Send helpers ─────────────────────────────────────────────────────────────
// allowedMentions: { parse: [] } is present on EVERY single send/reply below.

const FLAGS = MessageFlags.IsComponentsV2;

/**
 * Reply to a message with a ContainerBuilder.
 * allowedMentions: { parse: [] } — no role/everyone/here pings.
 */
async function reply(msg, container, extra = {}) {
  return msg.reply({
    components:      [container],
    flags:           FLAGS,
    allowedMentions: { parse: [] },
    ...extra,
  }).catch(() => null);
}

/**
 * Send a ContainerBuilder to a channel.
 * allowedMentions: { parse: [] } — no role/everyone/here pings.
 */
async function send(channel, container, extra = {}) {
  return channel.send({
    components:      [container],
    flags:           FLAGS,
    allowedMentions: { parse: [] },
    ...extra,
  }).catch(() => null);
}

/**
 * Edit an existing message with a ContainerBuilder.
 * allowedMentions: { parse: [] } — no role/everyone/here pings.
 */
async function edit(message, container, extra = {}) {
  return message.edit({
    components:      [container],
    flags:           FLAGS,
    allowedMentions: { parse: [] },
    ...extra,
  }).catch(() => null);
}

module.exports = { build, success, error, warn, info, purple, reply, send, edit, FLAGS, C };
