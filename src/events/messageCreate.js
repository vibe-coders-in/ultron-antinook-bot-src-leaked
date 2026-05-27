"use strict";

const ct = require("../utils/container");

module.exports = {
  once: false,
  async execute(msg, client, config, commandHandler) {
    if (msg.author.bot) return;

    // Handle bot mention
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>( )?$`);
    if (msg.content.match(mentionRegex)) {
      return ct.reply(msg, ct.info(
        "👋 Hello!",
        `Mera prefix is server mein \`${config.prefix}\` hai.\nCommands list dekhne ke liye \`${config.prefix}antinuke\` ya \`${config.prefix}mod\` use karein.`
      ));
    }

    // Pass to command handler
    if (commandHandler) {
      await commandHandler.handle(msg);
    }
  }
};
