(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  function money(value) {
    const rounded = Math.round(Number(value) || 0);
    return new Intl.NumberFormat("vi-VN").format(rounded) + "đ";
  }

  function upgradeCost(config, currentLevel) {
    return Math.round(config.baseCost * Math.pow(config.scale, currentLevel) / 1000) * 1000;
  }

  function comboMultiplier(combo) {
    if (combo >= 10) return 4;
    if (combo >= 5) return 3;
    if (combo >= 3) return 2;
    return 1;
  }

  function calculateOrder(order, patienceRatio, combo, modifiers) {
    const baseRevenue = order.items.reduce(function (sum, foodId) {
      const food = CVVH.Config.foodById(foodId);
      return sum + (food ? food.price : 0);
    }, 0);
    const premiumRevenue = Math.round(baseRevenue * (1 + modifiers.orderValueBonus + (order.secretBonus || 0)));
    const multiplier = comboMultiplier(combo);
    const patienceTip = patienceRatio > .72 ? 0.14 : patienceRatio > .42 ? 0.07 : 0.02;
    const tip = Math.round(premiumRevenue * patienceTip * multiplier * (1 + modifiers.tipBonus) / 500) * 500;
    return { revenue: premiumRevenue, tip: Math.max(0, tip), multiplier: multiplier };
  }

  CVVH.Economy = { money: money, upgradeCost: upgradeCost, comboMultiplier: comboMultiplier, calculateOrder: calculateOrder };
})();
