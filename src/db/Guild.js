const { Schema, model } = require("mongoose");

const ThresholdSchema = new Schema({
  limit:      { type: Number, default: 3 },
  timeWindow: { type: Number, default: 5000 },
  enabled:    { type: Boolean, default: true },
}, { _id: false });

const GuildSchema = new Schema({
  guildId:        { type: String, required: true, unique: true, index: true },
  logChannelId:   { type: String, default: null },
  setupDone:      { type: Boolean, default: false },
  guardRoleId:    { type: String, default: null },    // Role created by !antinuke setup
  antinukeEnabled:{ type: Boolean, default: false },
  punishment:     { type: String, enum: ["ban","kick","strip"], default: "ban" },

  // Whitelist config
  wlMaxActions:   { type: Number, default: 5 },       // Max actions even WL users can do
  wlTimeWindow:   { type: Number, default: 10000 },   // Time window for WL users (ms)

  // Per-event thresholds
  thresholds: {
    channelDelete: { type: ThresholdSchema, default: () => ({ limit:3, timeWindow:5000 }) },
    channelCreate: { type: ThresholdSchema, default: () => ({ limit:5, timeWindow:5000 }) },
    channelUpdate: { type: ThresholdSchema, default: () => ({ limit:5, timeWindow:5000 }) },
    roleDelete:    { type: ThresholdSchema, default: () => ({ limit:3, timeWindow:5000 }) },
    roleCreate:    { type: ThresholdSchema, default: () => ({ limit:5, timeWindow:5000 }) },
    roleUpdate:    { type: ThresholdSchema, default: () => ({ limit:3, timeWindow:5000 }) },
    ban:           { type: ThresholdSchema, default: () => ({ limit:3, timeWindow:5000 }) },
    kick:          { type: ThresholdSchema, default: () => ({ limit:5, timeWindow:5000 }) },
    webhookCreate: { type: ThresholdSchema, default: () => ({ limit:2, timeWindow:5000 }) },
    botAdd:        { type: ThresholdSchema, default: () => ({ limit:1, timeWindow:5000 }) },
    guildUpdate:   { type: ThresholdSchema, default: () => ({ limit:2, timeWindow:5000 }) },
    memberUpdate:  { type: ThresholdSchema, default: () => ({ limit:3, timeWindow:5000 }) },
  },

  // Anti-Raid config
  antiRaid: {
    enabled:       { type: Boolean, default: true },
    joinThreshold: { type: Number, default: 10 },
    joinTimeWindow:{ type: Number, default: 8000 },
    action:        { type: String, enum: ["kick","ban"], default: "kick" },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

GuildSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

// Cache for fast lookups (avoids repeated DB calls)
GuildSchema.statics.getOrCreate = async function(guildId) {
  let doc = await this.findOne({ guildId });
  if (!doc) doc = await this.create({ guildId });
  return doc;
};

module.exports = model("Guild", GuildSchema);
