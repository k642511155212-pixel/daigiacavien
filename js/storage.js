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
      story: { introSeen: false, seenScenes: [], chaptersCompleted: [], mysteryProgress: 0, dialogueSeen: {} },
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
    if (raw.story && typeof raw.story === "object") {
      base.story.introSeen = raw.story.introSeen === true;
      ["seenScenes", "chaptersCompleted"].forEach(function (key) {
        if (Array.isArray(raw.story[key])) base.story[key] = raw.story[key].filter(function (value) { return typeof value === "string"; }).slice(0, 500);
      });
      base.story.mysteryProgress = Math.floor(finiteNumber(raw.story.mysteryProgress, 0, 0, 99));
      if (raw.story.dialogueSeen && typeof raw.story.dialogueSeen === "object") base.story.dialogueSeen = raw.story.dialogueSeen;
    }

    if (raw.upgrades && typeof raw.upgrades === "object") {
      C.UPGRADES.forEach(function (upgrade) {
        base.upgrades[upgrade.id] = Math.floor(finiteNumber(raw.upgrades[upgrade.id], 0, 0, upgrade.maxLevel));
      });
    }

    const allowedFoodIds = new Set(C.FOODS.map(function (food) { return food.id; }));
    if (Array.isArray(raw.unlockedFoods)) {
      base.unlockedFoods = raw.unlockedFoods.filter(function (id) { return allowedFoodIds.has(id); });
    }
    C.FOODS.filter(function (food) { return food.unlockDay <= base.currentDay; }).forEach(function (food) {
      if (!base.unlockedFoods.includes(food.id)) base.unlockedFoods.push(food.id);
    });

    if (raw.stats && typeof raw.stats === "object") {
      Object.keys(base.stats).forEach(function (key) {
        base.stats[key] = Math.floor(finiteNumber(raw.stats[key], base.stats[key], key === "totalProfit" ? -999999999 : 0, 999999999999));
      });
    }
    base.version = C.VERSION;
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
