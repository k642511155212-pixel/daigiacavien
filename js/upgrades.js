(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  function modifiers(levels) {
    const value = function (id) { return Number(levels[id]) || 0; };
    return {
      fryerCapacity: 3 + value("fryerCapacity"),
      cookTimeScale: Math.max(.56, 1 - value("fasterFryer") * .08),
      readyTimeScale: 1 + value("betterFryer") * .18,
      trayCapacity: Math.min(CVVH.Config.BALANCE.maxTrayHardLimit, 4 + value("trayCapacity")),
      patienceBonus: value("customerComfort") * .10,
      tipBonus: value("betterStall") * .12,
      orderValueBonus: value("premiumSauce") * .05,
      spawnTimeScale: Math.max(.68, 1 - value("advertisement") * .06)
    };
  }

  function buy(save, upgradeId) {
    const upgrade = CVVH.Config.UPGRADES.find(function (item) { return item.id === upgradeId; });
    if (!upgrade) return { ok: false, reason: "missing" };
    const level = save.upgrades[upgradeId] || 0;
    if (level >= upgrade.maxLevel) return { ok: false, reason: "max", upgrade: upgrade };
    const cost = CVVH.Economy.upgradeCost(upgrade, level);
    if (save.money < cost) return { ok: false, reason: "money", cost: cost, upgrade: upgrade };
    save.money -= cost;
    save.upgrades[upgradeId] = level + 1;
    return { ok: true, cost: cost, level: level + 1, upgrade: upgrade };
  }

  CVVH.Upgrades = { modifiers: modifiers, buy: buy };
})();
