"use strict";

// allowedMentions: { parse: [] } — prevents @everyone/@here/role pings on every reply/send from this file
const AM = { allowedMentions: { parse: [] } };

/**
 * Ultra-fast in-memory action tracker.
 * Structure: Map(guildId -> Map(userId -> Map(action -> [timestamps])))
 * Cleanup runs every 30s to prevent memory leaks.
 */
class Tracker {
  constructor() {
    // Main tracker: guild -> user -> action -> timestamps[]
    this._data = new Map();
    // Punishment lock: Set of "guildId:userId" to avoid double-punishing
    this._punishLock = new Set();
    // Anti-raid join tracker: guildId -> timestamps[]
    this._joinTracker = new Map();

    setInterval(() => this._cleanup(), 30_000).unref();
  }

  // ── Action Tracking ─────────────────────────────────────────────────────

  /**
   * Record an action and check if threshold is exceeded.
   * @returns {boolean} true if threshold exceeded
   */
  track(guildId, userId, action, limit, timeWindow) {
    const now = Date.now();

    if (!this._data.has(guildId)) this._data.set(guildId, new Map());
    const guild = this._data.get(guildId);

    if (!guild.has(userId)) guild.set(userId, new Map());
    const user = guild.get(userId);

    if (!user.has(action)) user.set(action, []);
    const ts = user.get(action);

    ts.push(now);

    // Prune timestamps outside window
    const cutoff = now - timeWindow;
    const fresh = ts.filter(t => t > cutoff);
    user.set(action, fresh);

    return fresh.length >= limit;
  }

  /**
   * Track anti-raid joins. Returns true if join flood detected.
   */
  trackJoin(guildId, threshold, timeWindow) {
    const now = Date.now();
    if (!this._joinTracker.has(guildId)) this._joinTracker.set(guildId, []);
    const joins = this._joinTracker.get(guildId);
    joins.push(now);

    const fresh = joins.filter(t => now - t <= timeWindow);
    this._joinTracker.set(guildId, fresh);

    if (fresh.length >= threshold) {
      this._joinTracker.set(guildId, []);
      return true;
    }
    return false;
  }

  // ── Punishment Lock ──────────────────────────────────────────────────────

  /** Returns true if user is currently locked (already being punished) */
  isLocked(guildId, userId) {
    return this._punishLock.has(`${guildId}:${userId}`);
  }

  /** Lock a user temporarily to prevent double punishments */
  lock(guildId, userId, ms = 15_000) {
    const key = `${guildId}:${userId}`;
    this._punishLock.add(key);
    setTimeout(() => this._punishLock.delete(key), ms).unref();
  }

  /** Reset all action data for a user in a guild */
  resetUser(guildId, userId) {
    this._data.get(guildId)?.delete(userId);
  }

  /** Reset all data for a guild */
  resetGuild(guildId) {
    this._data.delete(guildId);
    this._joinTracker.delete(guildId);
  }

  // ── Cleanup ──────────────────────────────────────────────────────────────

  _cleanup() {
    const cutoff = Date.now() - 60_000;
    for (const [gid, users] of this._data) {
      for (const [uid, actions] of users) {
        for (const [act, ts] of actions) {
          const fresh = ts.filter(t => t > cutoff);
          if (fresh.length === 0) actions.delete(act);
          else actions.set(act, fresh);
        }
        if (actions.size === 0) users.delete(uid);
      }
      if (users.size === 0) this._data.delete(gid);
    }
    for (const [gid, ts] of this._joinTracker) {
      const fresh = ts.filter(t => Date.now() - t <= 60_000);
      if (fresh.length === 0) this._joinTracker.delete(gid);
      else this._joinTracker.set(gid, fresh);
    }
  }
}

module.exports = new Tracker(); // Singleton
