<p align="center">
  <img src="https://img.shields.io/badge/LEAKED%20BY-VIBE%20CODERS%20%26%20CO--LEAKERS-FF1493?style=for-the-badge&logo=discord&logoColor=white" alt="Leaked By Vibe Coders & Co-Leakers" />
  <img src="https://img.shields.io/badge/ENGINE-CLAUDE%20AI-5865F2?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude AI Engine" />
  <img src="https://img.shields.io/badge/CODER-AI%20GPT%20CODERS-00FF7F?style=for-the-badge&logo=openai&logoColor=black" alt="AI GPT Coders" />
</p>

# 🛡️ AntiNuke Guard v2 — Official Source Leak

> [!IMPORTANT]
> **SOURCE CODE LEAK & EXPOSE INFORMATION**  
> This premium codebase has been successfully leaked by **Vibe Coders** along with co-leakers **Caixoz** and **Mik3y**. Together, they brought this original codebase to light for the community.

---

## 👑 The Leakers Team (Credits)
The core team responsible for this source code leak. Click their cards below to redirect directly to their Discord profiles:

<p align="center">
  <a href="https://discord.gg/uAwY7pfwfS" target="_blank">
    <img src="https://img.shields.io/badge/%E2%95%94%E2%95%90%E2%95%90%E3%80%8E%20%F0%9D%90%95%F0%9D%9D%86%F0%9D%9C%BD%F0%9D%9D%82%20%F0%9D%9C%AA%F0%9D%9D%8A%F0%9D%9D%8B%F0%9D%9D%8C%F0%9D%9D%8D%F0%9D%9D%8E%20%E3%80%8F%E2%95%90%E2%95%90%E2%95%9D-uAwY7pfwfS?style=for-the-badge&label=ORGANIZATION&labelColor=1a1a1a&color=FF1493" alt="Vibe Coders" />
  </a>
  <br />
  <a href="https://discord.com/users/861847026923995137" target="_blank">
    <img src="https://img.shields.io/badge/%E2%95%94%E2%95%90%E2%95%90%E3%80%8E%20%F0%9D%90%82%20%F0%9D%9D%82%20%F0%9D%9D%8A%20%F0%9D%9D%92%20%F0%9D%9D%90%20%F0%9D%9D%A1%20%E3%80%8F%E2%95%90%E2%95%90%E2%95%97-861847026923995137?style=for-the-badge&label=CO-LEAKER&labelColor=1a1a1a&color=7289da" alt="˹  𝙲 𝛂 𝛊 𝛞 𝛐 𝚣 /✗" />
  </a>
  <a href="https://discord.com/users/980000051562700820" target="_blank">
    <img src="https://img.shields.io/badge/%E2%95%94%E2%95%90%E2%95%90%E3%80%8E%20%F0%9D%90%8C%F0%9D%9D%86%F0%9D%9C%B5%F0%9D%9F%B5%F0%9F%A5%80%20%E3%80%8F%E2%95%90%E2%95%90%E2%95%97-980000051562700820?style=for-the-badge&label=CO-LEAKER&labelColor=1a1a1a&color=ff4757" alt="Mik3y🥀" />
  </a>
</p>

### 🔗 Direct Profile Redirection Links:
* **Vibe Coders (Server)** — [Join Vibe Coders on Discord](https://discord.gg/uAwY7pfwfS)
* **˹  𝙲 𝛂 𝛊 𝛞 𝛐 𝚣 /✗** — [Discord Profile (ID: 861847026923995137)](https://discord.com/users/861847026923995137)
* **Mik3y🥀** — [Discord Profile (ID: 980000051562700820)](https://discord.com/users/980000051562700820)

---

## 🤖 Engineered with Claude AI & GPT Coders
> [!NOTE]  
> **This entire bot has been designed and written using Claude AI (Anthropic) by AI GPT Coders.**  
> Built with state-of-the-art security patterns, high-performance in-memory caching trackers, and asynchronous Discord API calls to guarantee instantaneous, bypass-proof protection.

---

## 📦 Project Structure

```
antinuke-v2/
├── index.js                          ← Entry point
├── config.json                       ← Bot config (token, mongo, etc.)
├── package.json
└── src/
    ├── db/
    │   ├── connect.js                ← MongoDB connection
    │   ├── Guild.js                  ← Server settings model
    │   ├── Whitelist.js              ← Whitelist model
    │   ├── ExtraOwner.js             ← Extra owners model (max 2)
    │   └── Warning.js                ← Moderation warnings model
    ├── core/
    │   ├── AntiNuke.js               ← Core protection engine
    │   └── Tracker.js                ← In-memory action tracker (RAM-speed)
    ├── handler/
    │   └── CommandHandler.js         ← Category-based command loader
    ├── utils/
    │   ├── container.js              ← ContainerBuilder (NOT EmbedBuilder)
    │   └── logger.js                 ← Log channel sender
    └── commands/
        ├── antinuke/
        │   ├── setup.js              ← !antinuke setup
        │   ├── status.js             ← !antinuke status
        │   ├── toggle.js             ← !antinuke toggle on/off
        │   ├── event.js              ← !antinuke event <name> on/off
        │   ├── threshold.js          ← !antinuke threshold <event> <n> <s>
        │   ├── punishment.js         ← !antinuke punishment ban/kick/strip
        │   ├── whitelist.js          ← !antinuke whitelist add/remove/list/limit
        │   ├── extraowner.js         ← !antinuke extraowner add/remove/list
        │   ├── antiraid.js           ← !antinuke antiraid on/off/setup
        │   ├── logchannel.js         ← !antinuke logchannel #channel
        │   └── reset.js              ← !antinuke reset @user
        └── moderation/
            ├── ban.js                ← !mod ban
            ├── unban.js              ← !mod unban
            ├── softban.js            ← !mod softban
            ├── massban.js            ← !mod massban
            ├── banlist.js            ← !mod banlist
            ├── kick.js               ← !mod kick
            ├── mute.js               ← !mod mute (timeout)
            ├── unmute.js             ← !mod unmute
            ├── warn.js               ← !mod warn
            ├── warnings.js           ← !mod warnings
            ├── clearwarns.js         ← !mod clearwarns
            ├── clear.js              ← !mod clear (bulk delete)
            ├── lock.js               ← !mod lock
            ├── unlock.js             ← !mod unlock
            ├── slowmode.js           ← !mod slowmode
            ├── role.js               ← !mod role add/remove
            ├── nickname.js           ← !mod nickname
            ├── deafen.js             ← !mod deafen
            ├── undeafen.js           ← !mod undeafen
            ├── voicekick.js          ← !mod voicekick
            ├── move.js               ← !mod move
            ├── invites.js            ← !mod invites list/clear
            ├── userinfo.js           ← !mod userinfo
            └── serverinfo.js         ← !mod serverinfo
```

---

## 🚀 Setup

### 1. Install
```bash
npm install
```

### 2. Fill config.json
```json
{
  "token":    "YOUR_BOT_TOKEN",
  "mongoUri": "mongodb+srv://user:pass@cluster.mongodb.net/antinuke",
  "prefix":   "!",
  "ownerId":  "YOUR_DISCORD_USER_ID"
}
```

### 3. Discord Developer Portal
- Enable: **Server Members Intent**, **Message Content Intent**, **Presence Intent**
- Bot permissions: **Administrator** (recommended) OR the individual perms listed below

### 4. Required Permissions
Ban/Kick Members, Manage Roles, Manage Channels, View Audit Log, Manage Messages, Moderate Members, Manage Guild, Move Members, Deafen Members, Manage Webhooks, Manage Nicknames

### 5. Run
```bash
node index.js
```

---

## 🛡️ Protection Details

### Events Protected
| Event | Action |
|---|---|
| Mass Channel Delete | Punish after threshold |
| Mass Channel Create | Punish after threshold |
| @everyone perm wipe | Auto-revert + log |
| Mass Role Delete | Punish after threshold |
| Mass Role Create | Punish after threshold |
| Dangerous perm escalation | Auto-revert immediately |
| Mass Ban | Punish after threshold |
| Mass Kick | Punish after threshold |
| Unauthorized Webhook | Auto-delete immediately |
| Unauthorized Bot Add | Kick bot + punish |
| Guild Update (name/settings) | Auto-revert + log |
| Dangerous role grant | Auto-remove immediately |
| Anti-Raid (mass joins) | Kick/ban flood joiners |

### Why It's Bypass-Proof
1. **RAM tracker** — in-memory action tracker, no DB delay on detection.
2. **Audit log executor** — identifies the actual attacker (not the target).
3. **Punishment lock** — prevents double-punishing same user.
4. **Auto-revert** — role perms + guild name restored before punishing.
5. **WL limits** — whitelisted users still have action caps.
6. **Guard role** — can't be used to escalate privileges.
7. **allowedMentions: { parse: [] }** — all responses, no accidental pings.

---

<p align="center">
  Leaked and archived with ❤️ by Vibe Coders, Caixoz & Mik3y
</p>
