(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};
  const C = CVVH.Config;

  function blankStats() {
    return {
      totalCustomersServed: 0,
      totalCustomersLost: 0,
      totalRevenue: 0,
      totalProfit: 0,
      totalTips: 0,
      totalBurntFood: 0,
      totalIncorrectOrders: 0,
      highestCombo: 0,
      bestDailyProfit: 0,
      highestDayReached: 1
    };
  }

  function defaultUpgrades() {
    return C.UPGRADES.reduce(function (result, upgrade) {
      result[upgrade.id] = 0;
      return result;
    }, {});
  }

  function createDefaultSave() {
    return {
      version: C.VERSION,
      saveVersion: C.VERSION,
      money: C.BALANCE.startingMoney,
      currentDay: 1,
      reputation: C.BALANCE.startingReputation,
      upgrades: defaultUpgrades(),
      unlockedFoods: C.FOODS.filter(function (food) { return food.unlockDay <= 1; }).map(function (food) { return food.id; }),
      tutorialCompleted: false,
      soundEnabled: true,
      bestScore: 0,
      hasPlayed: false,
      relationships: {},
      unlockedCharacters: CVVH.CharacterSystem.INITIAL_UNLOCKS.slice(),
      characterVisits: {},
      recentOrders: {},
      characterBook: {},
      story: { introSeen: false, seenScenes: [], chaptersCompleted: [], mysteryProgress: 0, dialogueSeen: {}, flags: {}, activeThreads: {}, lastVisitors: [] },
      stats: blankStats()
    };
  }

  function finiteNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function sanitize(raw) {
    const base = createDefaultSave();
    if (!raw || typeof raw !== "object") return base;
    base.money = finiteNumber(raw.money, base.money, -999999999, 999999999999);
    base.currentDay = Math.floor(finiteNumber(raw.currentDay, 1, 1, 999));
    base.reputation = finiteNumber(raw.reputation, base.reputation, 0, 100);
    base.tutorialCompleted = raw.tutorialCompleted === true;
    base.soundEnabled = raw.soundEnabled !== false;
    base.bestScore = Math.floor(finiteNumber(raw.bestScore, 0, 0, 999999999));
    base.hasPlayed = raw.hasPlayed === true;
    if (raw.relationships && typeof raw.relationships === "object") {
      Object.keys(raw.relationships).forEach(function (id) {
        if (/^[a-z0-9-]+$/.test(id)) base.relationships[id] = Math.floor(finiteNumber(raw.relationships[id], 0, 0, 999));
      });
    }
    const characterIds = new Set(CVVH.Characters.all.map(function (character) { return character.id; }));
    if (Array.isArray(raw.unlockedCharacters)) {
      base.unlockedCharacters = raw.unlockedCharacters.filter(function (id) { return characterIds.has(id); });
    } else if (Number(raw.version || raw.saveVersion || 1) < 2) {
      base.unlockedCharacters = CVVH.CharacterSystem.seedForProgress(base.currentDay, base.reputation);
    }
    if (raw.characterVisits && typeof raw.characterVisits === "object") {
      Object.keys(raw.characterVisits).forEach(function (id) {
        if (characterIds.has(id)) base.characterVisits[id] = Math.floor(finiteNumber(raw.characterVisits[id], 0, 0, 99999));
      });
    }
    if (raw.recentOrders && typeof raw.recentOrders === "object") {
      Object.keys(raw.recentOrders).forEach(function (id) {
        if (characterIds.has(id) && Array.isArray(raw.recentOrders[id])) base.recentOrders[id] = raw.recentOrders[id].filter(function (value) { return typeof value === "string"; }).slice(-5);
      });
    }
    if (raw.characterBook && typeof raw.characterBook === "object") {
      Object.keys(raw.characterBook).forEach(function (id) {
        if (!characterIds.has(id) || !raw.characterBook[id] || typeof raw.characterBook[id] !== "object") return;
        const item = raw.characterBook[id];
        base.characterBook[id] = {
          unlockedAtDay:Math.floor(finiteNumber(item.unlockedAtDay, 1, 1, 999)),
          visits:Math.floor(finiteNumber(item.visits, base.characterVisits[id] || 0, 0, 99999)),
          correctOrders:Math.floor(finiteNumber(item.correctOrders, 0, 0, 99999)),
          wrongOrders:Math.floor(finiteNumber(item.wrongOrders, 0, 0, 99999)),
          fastOrders:Math.floor(finiteNumber(item.fastOrders, 0, 0, 99999)),
          updated:item.updated === true
        };
      });
    }
    if (raw.story && typeof raw.story === "object") {
      base.story.introSeen = raw.story.introSeen === true;
      ["seenScenes", "chaptersCompleted"].forEach(function (key) {
        if (Array.isArray(raw.story[key])) base.story[key] = raw.story[key].filter(function (value) { return typeof value === "string"; }).slice(0, 500);
      });
      base.story.mysteryProgress = Math.floor(finiteNumber(raw.story.mysteryProgress, 0, 0, 99));
      if (raw.story.dialogueSeen && typeof raw.story.dialogueSeen === "object") base.story.dialogueSeen = raw.story.dialogueSeen;
      if (raw.story.flags && typeof raw.story.flags === "object") {
        Object.keys(raw.story.flags).slice(0, 300).forEach(function (key) {
          const value = raw.story.flags[key];
          if (typeof value === "boolean" || typeof value === "string" || Number.isFinite(Number(value))) base.story.flags[key] = value;
        });
      }
      if (raw.story.activeThreads && typeof raw.story.activeThreads === "object") {
        Object.keys(raw.story.activeThreads).slice(0, 100).forEach(function (key) {
          const value = raw.story.activeThreads[key];
          if (typeof value === "boolean" || typeof value === "string" || Number.isFinite(Number(value))) base.story.activeThreads[key] = value;
        });
      }
      if (Array.isArray(raw.story.lastVisitors)) base.story.lastVisitors = raw.story.lastVisitors.filter(function (id) { return characterIds.has(id); }).slice(-5);
    }

    if (raw.upgrades && typeof raw.upgrades === "object") {
      C.UPGRADES.forEach(function (upgrade) {
        base.upgrades[upgrade.id] = Math.floor(finiteNumber(raw.upgrades[upgrade.id], 0, 0, upgrade.maxLevel));
      });
    }

    const unlockedNow = new Set(C.getUnlockedFoods(base.currentDay).map(function (food) { return food.id; }));
    base.unlockedFoods = Array.from(unlockedNow);

    if (raw.stats && typeof raw.stats === "object") {
      Object.keys(base.stats).forEach(function (key) {
        base.stats[key] = Math.floor(finiteNumber(raw.stats[key], base.stats[key], key === "totalProfit" ? -999999999 : 0, 999999999999));
      });
    }
    CVVH.CharacterSystem.ensure(base);
    base.version = C.VERSION;
    base.saveVersion = C.VERSION;
    return base;
  }

  function load() {
    let hasExisting = false;
    try {
      const stored = localStorage.getItem(C.SAVE_KEY);
      if (!stored) return { save: createDefaultSave(), hasExisting: false };
      hasExisting = true;
      return { save: sanitize(JSON.parse(stored)), hasExisting: hasExisting };
    } catch (error) {
      console.warn("Save data was invalid and has been safely reset.");
      return { save: createDefaultSave(), hasExisting: false };
    }
  }

  function persist(save) {
    try {
      localStorage.setItem(C.SAVE_KEY, JSON.stringify(sanitize(save)));
      return true;
    } catch (error) {
      return false;
    }
  }

  function reset() {
    try { localStorage.removeItem(C.SAVE_KEY); } catch (error) { /* Storage can be unavailable in privacy modes. */ }
    return createDefaultSave();
  }

  CVVH.Storage = { createDefaultSave: createDefaultSave, load: load, save: persist, reset: reset, sanitize: sanitize };
})();
