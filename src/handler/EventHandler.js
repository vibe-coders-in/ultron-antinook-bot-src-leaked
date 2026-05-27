"use strict";

const fs = require("fs");
const path = require("path");

class EventHandler {
  constructor(client, config, commandHandler) {
    this.client = client;
    this.config = config;
    this.commandHandler = commandHandler;
    this._loadAll();
  }

  _loadAll() {
    const dir = path.join(__dirname, "../events");
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    for (const file of files) {
      try {
        const event = require(path.join(dir, file));
        const eventName = file.split(".")[0];
        
        if (event.once) {
          this.client.once(eventName, (...args) => event.execute(...args, this.client, this.config, this.commandHandler));
        } else {
          this.client.on(eventName, (...args) => event.execute(...args, this.client, this.config, this.commandHandler));
        }
        console.log(`  ✓ Loaded Event [${eventName}]`);
      } catch (err) {
        console.error(`  ✗ Failed Event [${file}]:`, err.message);
      }
    }
  }
}

module.exports = EventHandler;
