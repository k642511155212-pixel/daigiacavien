(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  class FryerManager {
    constructor(capacity, modifiers, callbacks) {
      this.modifiers = modifiers;
      this.callbacks = callbacks || {};
      this.slots = Array.from({ length: capacity }, function (_, index) {
        return { index: index, state: "empty", foodId: null, elapsed: 0, progress: 0 };
      });
    }

    addFood(foodId) {
      const slot = this.slots.find(function (item) { return item.state === "empty"; });
      if (!slot) return null;
      slot.foodId = foodId;
      slot.state = "raw";
      slot.elapsed = 0;
      slot.progress = 0;
      if (this.callbacks.change) this.callbacks.change(slot, "added");
      return slot;
    }

    update(deltaMs) {
      const rawTime = CVVH.Config.BALANCE.rawStageMs;
      this.slots.forEach((slot) => {
        if (slot.state === "empty" || slot.state === "burnt") return;
        const food = CVVH.Config.foodById(slot.foodId);
        if (!food) { this.clear(slot.index); return; }
        slot.elapsed += deltaMs;
        const cookTime = food.cookTime * this.modifiers.cookTimeScale;
        const readyTime = food.burnTime * this.modifiers.readyTimeScale;
        if (slot.state === "raw") {
          slot.progress = Math.min(1, slot.elapsed / rawTime);
          if (slot.elapsed >= rawTime) { slot.state = "cooking"; slot.elapsed = 0; slot.progress = 0; }
        } else if (slot.state === "cooking") {
          slot.progress = Math.min(1, slot.elapsed / cookTime);
          if (slot.elapsed >= cookTime) {
            slot.state = "ready"; slot.elapsed = 0; slot.progress = 0;
            if (this.callbacks.ready) this.callbacks.ready(slot);
          }
        } else if (slot.state === "ready") {
          slot.progress = Math.min(1, slot.elapsed / readyTime);
          if (slot.elapsed >= readyTime) {
            slot.state = "burnt"; slot.elapsed = readyTime; slot.progress = 1;
            if (this.callbacks.burnt) this.callbacks.burnt(slot);
          }
        }
      });
    }

    collect(index) {
      const slot = this.slots[index];
      if (!slot || slot.state !== "ready") return null;
      const foodId = slot.foodId;
      this.clear(index);
      if (this.callbacks.change) this.callbacks.change(slot, "collected");
      return foodId;
    }

    discardBurnt(index) {
      const slot = this.slots[index];
      if (!slot || slot.state !== "burnt") return false;
      this.clear(index);
      if (this.callbacks.change) this.callbacks.change(slot, "discarded");
      return true;
    }

    clear(index) {
      const slot = this.slots[index];
      if (!slot) return;
      slot.state = "empty"; slot.foodId = null; slot.elapsed = 0; slot.progress = 0;
    }

    hasBurnt() { return this.slots.some(function (slot) { return slot.state === "burnt"; }); }
    isFull() { return this.slots.every(function (slot) { return slot.state !== "empty"; }); }
  }

  CVVH.Cooking = { FryerManager: FryerManager };
})();
