(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  function weightedItemCount(day, maxItems, random) {
    const cap = Math.max(1, Math.min(maxItems, day >= 8 ? 4 : day >= 4 ? 3 : day >= 2 ? 2 : 1));
    const roll = random();
    if (cap >= 4 && roll > .84) return 4;
    if (cap >= 3 && roll > .60) return 3;
    if (cap >= 2 && roll > .30) return 2;
    return 1;
  }

  function safePool(availableFoods, day) {
    const unlocked = CVVH.Config.getUnlockedFoods(day);
    const unlockedIds = new Set(unlocked.map(function (item) { return item.id; }));
    const provided = (availableFoods || []).filter(function (item) { return item && unlockedIds.has(item.id); });
    return provided.length ? provided : unlocked;
  }

  function generate(day, availableFoods, maxItems, random, forceTutorial) {
    const rng = random || Math.random;
    if (forceTutorial) return { items:["ca-vien"], sauce:"tuong-ot", drink:"none" };

    const pool = safePool(availableFoods, day);
    if (!pool.length) return { items:["ca-vien"], sauce:"tuong-ot", drink:"none" };

    const count = weightedItemCount(day, maxItems, rng);
    const items = [];
    for (let index = 0; index < count; index += 1) {
      items.push(pool[Math.floor(rng() * pool.length)].id);
    }

    const sauces = CVVH.Config.getUnlockedSauces(day);
    const sauce = sauces[Math.floor(rng() * sauces.length)] || sauces[0];
    const drinks = CVVH.Config.getUnlockedDrinks(day);
    const drinkPool = drinks.filter(function (drink) { return drink.id !== "none"; });
    const wantsDrink = drinkPool.length && rng() < Math.min(.66, .22 + day * .035);
    const drink = wantsDrink ? drinkPool[Math.floor(rng() * drinkPool.length)] : CVVH.Config.drinkById("none");
    return { items:items, sauce:sauce ? sauce.id : "tuong-ot", drink:drink ? drink.id : "none" };
  }

  function validate(order, day) {
    if (!order || !Array.isArray(order.items) || !order.items.length) return false;
    if (!order.items.every(function (id) { return CVVH.Config.isFoodUnlocked(id, day); })) return false;
    if (!CVVH.Config.isSauceUnlocked(order.sauce, day)) return false;
    if (!CVVH.Config.isDrinkUnlocked(order.drink || "none", day)) return false;
    return true;
  }

  function sanitize(order, day, availableFoods, maxItems, random) {
    if (validate(order, day)) return order;
    console.warn("[ORDER VALIDATION] Repaired an order containing unavailable products.");
    return generate(day, availableFoods, maxItems, random || Math.random, false);
  }

  function counts(items) {
    return items.reduce(function (map, id) { map[id] = (map[id] || 0) + 1; return map; }, {});
  }

  function matches(order, trayItems, selectedSauce, selectedDrink) {
    if (!order || selectedSauce !== order.sauce || (selectedDrink || "none") !== (order.drink || "none") || order.items.length !== trayItems.length) return false;
    const expected = counts(order.items);
    const actual = counts(trayItems);
    return Object.keys(expected).every(function (id) { return expected[id] === actual[id]; });
  }

  CVVH.Orders = { generate:generate, validate:validate, sanitize:sanitize, counts:counts, matches:matches };
})();
