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
      this.orderRevealed = false;
      this.maxPatience = Math.max(14, 30 * variant.patienceMultiplier * patienceScale - Math.min(day - 1, 10) * .55);
      this.remainingPatience = this.maxPatience;
      this.status = "waiting";
      this.reward = order.items.reduce(function (sum, id) {
        const food = CVVH.Config.foodById(id);
        return sum + (food ? food.price : 0);
      }, 0) + ((CVVH.Config.drinkById(order.drink || "none") || {}).price || 0);
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

  function create(day, availableFoods, modifiers, maxItems, tutorialOrder, save, event, forcedVariant) {
    const variant = forcedVariant || (tutorialOrder ? CVVH.Characters.getById("khanh") : CVVH.CharacterSystem.chooseCharacter(save, day, event, Math.random));
    const order = CVVH.CharacterSystem.generateOrder(save, variant, day, availableFoods, maxItems, Math.random, tutorialOrder);
    const relation = Number(save.relationships[variant.id]) || 0;
    if (relation >= 22 && Math.random() < .14 && order.items.length < maxItems) {
      order.items.push(availableFoods[Math.floor(Math.random() * availableFoods.length)].id);
      order.secretBonus = .12;
    }
    const context = relation === 0 ? "firstVisit" : relation >= 10 && Math.random() < .24 ? "highRelationship" : event.id === "rain" ? "rain" : event.id === "exams" ? "exams" : event.id === "graduation" ? "graduation" : "normal";
    const speech = CVVH.Characters.pickDialogue(variant, context, save);
    CVVH.CharacterSystem.recordOrder(save, variant.id, order);
    CVVH.CharacterSystem.recordVisit(save, variant.id);
    return new Customer(variant, order, day, (1 + modifiers.patienceBonus) * event.patienceScale, speech, relation);
  }

  CVVH.Customers = { Customer: Customer, create: create };
})();
