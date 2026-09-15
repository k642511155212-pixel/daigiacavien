(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  function weightedItemCount(day, maxItems, random) {
    const cap = Math.max(1, Math.min(maxItems, day >= 6 ? 4 : day >= 3 ? 3 : day >= 2 ? 2 : 1));
    const roll = random();
    if (cap >= 4 && roll > .82) return 4;
    if (cap >= 3 && roll > .58) return 3;
    if (cap >= 2 && roll > .27) return 2;
    return 1;
  }

  function generate(day, availableFoods, maxItems, random, forceTutorial) {
    const rng = random || Math.random;
    if (forceTutorial) return { items: ["ca-vien"], sauce: "tuong-ot" };
    const count = weightedItemCount(day, maxItems, rng);
    const pool = availableFoods.length ? availableFoods : CVVH.Config.FOODS.slice(0, 3);
    const items = [];
    for (let index = 0; index < count; index += 1) {
      const food = pool[Math.floor(rng() * pool.length)];
      items.push(food.id);
    }
    const sauces = CVVH.Config.SAUCES.filter(function (sauce) { return sauce.unlockDay <= day; });
    const sauce = sauces[Math.floor(rng() * sauces.length)];
    return { items: items, sauce: sauce.id };
  }

  function counts(items) {
    return items.reduce(function (map, id) { map[id] = (map[id] || 0) + 1; return map; }, {});
  }

  function matches(order, trayItems, selectedSauce) {
    if (!order || selectedSauce !== order.sauce || order.items.length !== trayItems.length) return false;
    const expected = counts(order.items);
    const actual = counts(trayItems);
    return Object.keys(expected).every(function (id) { return expected[id] === actual[id]; });
  }

  CVVH.Orders = { generate: generate, counts: counts, matches: matches };
})();
