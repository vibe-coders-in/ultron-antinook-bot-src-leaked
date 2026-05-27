"use strict";

// ─────────────────────────────────────────────────────────────────────────────
//  Discord Anti-Nuke Security Bot  v3.0
//  allowedMentions: { parse: [] }  ← on every outgoing message (no pings)
// ─────────────────────────────────────────────────────────────────────────────

const {
  Client,
  GatewayIntentBits,
  Partials,
  MessageFlags,
} = require("discord.js");

const config         = require("./config.json");
const connectDB      = require("./src/db/connect");
const AntiNuke       = require("./src/core/AntiNuke");
const CommandHandler = require("./src/handler/CommandHandler");
const EventHandler   = require("./src/handler/EventHandler");

// ── Client ────────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],

  // Global default — no role / @everyone / @here pings on any message
  allowedMentions: { parse: [] },
});

// Attach config to client for access in commands
client.config = config;

// ── Startup ────────────────────────────────────────────────────────────────────
(async () => {
  // 1. Connect MongoDB
  await connectDB(config.mongoUri);

  // 2. Boot AntiNuke engine — registers all Discord event listeners
  const antiNuke = new AntiNuke(client, config.ownerId);
  antiNuke.register();

  // 3. Boot command handler — auto-loads all category commands
  const handler = new CommandHandler(client, config);

  // 4. Boot event handler — auto-loads all events
  new EventHandler(client, config, handler);

  // 5. Login
  await client.login(config.token);
})();

// ── Global error suppression (no crash on unhandled) ──────────────────────────
client.on("error", err => console.error("❌ Client error:", err.message));
process.on("unhandledRejection", err => console.error("❌ Unhandled rejection:", err?.message ?? err));
process.on("uncaughtException",  err => console.error("❌ Uncaught exception:", err?.message ?? err));
