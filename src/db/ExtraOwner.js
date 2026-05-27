const { Schema, model } = require("mongoose");

const ExtraOwnerSchema = new Schema({
  guildId:  { type: String, required: true, index: true },
  userId:   { type: String, required: true },
  addedBy:  { type: String, required: true }, // Must be guild.ownerId
  addedAt:  { type: Date, default: Date.now },
});

ExtraOwnerSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports = model("ExtraOwner", ExtraOwnerSchema);
