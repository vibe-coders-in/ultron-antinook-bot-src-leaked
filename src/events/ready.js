"use strict";

module.exports = {
  once: true,
  execute(client) {
    console.log(`\n✅  Logged in as ${client.user.tag}`);
    console.log(`🛡️  AntiNuke protection ACTIVE`);
    console.log(`📦  Serving ${client.guilds.cache.size} guild(s)\n`);
    client.user.setPresence({
      activities: [{ name: "🛡️ Protecting Server", type: 3 }],
      status: "online",
    });
  }
};
