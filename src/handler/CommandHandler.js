"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

const fs   = require("fs");
const path = require("path");
const ct   = require("../utils/container");
const EO   = require("../db/ExtraOwner");

const CATEGORIES = ["antinuke", "moderation"];

class CommandHandler {
  constructor(client, config) {
    this.client     = client;
    this.config     = config;
    this.commands   = new Map(); // "category:name" -> command module
    this._loadAll();
  }

  _loadAll() {
    const base = path.join(__dirname, "../commands");
    for (const cat of CATEGORIES) {
      const dir = path.join(base, cat);
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
        try {
          const mod = require(path.join(dir, file));
          this.commands.set(`${cat}:${mod.name}`, { ...mod, category: cat });
          console.log(`  ✓ Loaded [${cat}] ${mod.name}`);
        } catch (err) {
          console.error(`  ✗ Failed [${cat}] ${file}:`, err.message);
        }
      }
    }
  }

  async handle(msg) {
    if (msg.author.bot) return;
    const prefix = this.config.prefix;
    if (!msg.content.startsWith(prefix)) return;

    const args  = msg.content.slice(prefix.length).trim().split(/\s+/);
    const cat   = args.shift()?.toLowerCase(); // e.g. "antinuke" or "mod"
    const name  = args.shift()?.toLowerCase(); // e.g. "setup"

    if (!cat) return;

    // Map shortcuts
    const catMap = { an: "antinuke", antinuke: "antinuke", mod: "moderation", moderation: "moderation" };
    const resolvedCat = catMap[cat];
    if (!resolvedCat) return;

    if (!name) {
      await ct.reply(msg, ct.info(
        `📋 ${resolvedCat.toUpperCase()} Commands`,
        [...this.commands.entries()]
          .filter(([k]) => k.startsWith(`${resolvedCat}:`))
          .map(([, v]) => `\`${this.config.prefix}${resolvedCat === "moderation" ? "mod" : "antinuke"} ${v.name}\` — ${v.description}`)
          .join("\n")
      ));
      return;
    }

    const cmd = this.commands.get(`${resolvedCat}:${name}`);
    if (!cmd) {
      await ct.reply(msg, ct.error("❌ Unknown Command", `\`${name}\` command not found. Use \`${prefix}${cat}\` to list commands.`));
      return;
    }

    // Permission checks
    if (!msg.guild) return;
    const isGuildOwner   = msg.author.id === msg.guild.ownerId;
    const isBotOwner     = msg.author.id === this.config.ownerId;
    const isExtraOwner   = await EO.findOne({ guildId: msg.guild.id, userId: msg.author.id }).then(Boolean);
    const hasPermission  = isGuildOwner || isBotOwner || isExtraOwner;

    if (cmd.guildOwnerOnly && !isGuildOwner && !isBotOwner) {
      await ct.reply(msg, ct.error("❌ Forbidden", "Sirf **server owner** ye command use kar sakta hai!"));
      return;
    }
    if (cmd.ownerOnly && !hasPermission) {
      await ct.reply(msg, ct.error("❌ Forbidden", "Sirf **server owner ya extra owners** ye command use kar sakte hain!"));
      return;
    }
    if (cmd.modOnly && !hasPermission && !msg.member?.permissions.has("ModerateMembers")) {
      await ct.reply(msg, ct.error("❌ No Permission", "Tumhare paas ye command use karne ki permission nahi hai."));
      return;
    }

    try {
      await cmd.execute(this.client, msg, args, this.config);
    } catch (err) {
      console.error(`[CMD ERROR] ${resolvedCat}:${name}`, err);
      await ct.reply(msg, ct.error("❌ Error", `Command execute karne mein error: \`${err.message}\``));
    }
  }
}

module.exports = CommandHandler;
