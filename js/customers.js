(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};
  let serial = 0;

  class Customer {
    constructor(variant, order, day, patienceScale, speech, relationshipPoints) {
      this.id = "customer-" + Date.now() + "-" + (++serial);
      this.name = variant.name;
      this.avatar = variant.avatar;
      this.variantId = variant.id;
      this.characterId = variant.id;
      this.character = variant;
      this.speech = speech;
      this.relationshipPoints = relationshipPoints || 0;
      this.relationshipStage = CVVH.Characters.stage(this.relationshipPoints);
      this.order = order;
      this.maxPatience = Math.max(14, 30 * variant.patienceMultiplier * patienceScale - Math.min(day - 1, 10) * .55);
      this.remainingPatience = this.maxPatience;
      this.status = "waiting";
      this.reward = order.items.reduce(function (sum, id) {
        const food = CVVH.Config.foodById(id);
        return sum + (food ? food.price : 0);
      }, 0);
    }

    update(deltaSeconds) {
      if (this.status !== "waiting" && this.status !== "angry") return false;
      this.remainingPatience = Math.max(0, this.remainingPatience - deltaSeconds);
      if (this.remainingPatience <= 0) { this.status = "leaving"; return true; }
      this.status = this.remainingPatience / this.maxPatience < .22 ? "angry" : "waiting";
      return false;
    }

    patienceRatio() { return Math.max(0, this.remainingPatience / this.maxPatience); }
  }

  function create(day, availableFoods, modifiers, maxItems, tutorialOrder, save, event) {
    let pool = CVVH.Characters.eligible(day, event.id);
    if (tutorialOrder) pool = pool.filter(function (character) { return character.id === "khanh"; });
    const variant = pool[Math.floor(Math.random() * pool.length)] || CVVH.Characters.all[0];
    let order = CVVH.Orders.generate(day, availableFoods, maxItems, Math.random, tutorialOrder);
    if (!tutorialOrder) {
      let desired = order.items.length;
      if (variant.portionSizeWeight === "high") desired = Math.max(desired, 3 + Math.floor(Math.random() * 3));
      if (variant.portionSizeWeight === "large") desired = Math.max(desired, 3 + Math.floor(Math.random() * 2));
      if (variant.portionSizeWeight === "group" && day >= 4 && Math.random() < .36 + event.groupChance) desired = Math.max(desired, 4 + Math.floor(Math.random() * 7));
      desired = Math.min(maxItems, desired);
      while (order.items.length < desired) order.items.push(availableFoods[Math.floor(Math.random() * availableFoods.length)].id);
      if (variant.preferredSauce && Math.random() < .42) order.sauce = variant.preferredSauce;
    }
    const relation = Number(save.relationships[variant.id]) || 0;
    if (variant.id === "anh-bon-ba-bay" && save.story.mysteryProgress === 0) {
      order = { items:["dau-hu","xuc-xich","pho-mai"].slice(0, maxItems), sauce:"sot-mix", secretBonus:.12 };
    } else if (relation >= 22 && Math.random() < .14 && order.items.length < maxItems) {
      order.items.push(availableFoods[Math.floor(Math.random() * availableFoods.length)].id);
      order.secretBonus = .12;
    }
    const context = relation === 0 ? "firstVisit" : relation >= 10 && Math.random() < .24 ? "highRelationship" : event.id === "rain" ? "rain" : event.id === "exams" ? "exams" : event.id === "graduation" ? "graduation" : "normal";
    const speech = CVVH.Characters.pickDialogue(variant, context, save);
    return new Customer(variant, order, day, (1 + modifiers.patienceBonus) * event.patienceScale, speech, relation);
  }

  CVVH.Customers = { Customer: Customer, create: create };
})();
