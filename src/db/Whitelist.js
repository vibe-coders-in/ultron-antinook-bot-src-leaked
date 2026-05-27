const { Schema, model } = require("mongoose");

const WhitelistSchema = new Schema({
  guildId:   { type: String, required: true, index: true },
  userId:    { type: String, required: true },
  addedBy:   { type: String, required: true },
  addedAt:   { type: Date, default: Date.now },
});

WhitelistSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = model("Whitelist", WhitelistSchema);
