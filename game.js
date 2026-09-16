(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  class Game {
    constructor(save, callbacks) {
      this.save = save;
      this.callbacks = callbacks || {};
      this.active = false;
      this.paused = false;
      this.conversationActive = false;
      this.ending = false;
      this.customers = [];
      this.tray = [];
      this.selectedSauce = null;
      this.selectedDrink = null;
      this.selectedCustomerId = null;
      this.raf = 0;
      this.lastTime = 0;
      this.renderAccumulator = 0;
      this.tutorial = new CVVH.TutorialManager((skipped) => this.completeTutorial(skipped));
      this.story = new CVVH.Story.StoryManager();
      this.bindControls();
    }

    bindControls() {
      CVVH.UI.byId("ingredients").addEventListener("click", (event) => {
        const button = event.target.closest("[data-food-id]"); if (button) this.addIngredient(button.dataset.foodId, button);
      });
      CVVH.UI.byId("fryer-slots").addEventListener("click", (event) => {
        const slot = event.target.closest("[data-slot-index]"); if (slot) this.useFryer(Number(slot.dataset.slotIndex), slot);
      });
      CVVH.UI.byId("sauces").addEventListener("click", (event) => {
        const button = event.target.closest("[data-sauce-id]"); if (button) this.chooseSauce(button.dataset.sauceId);
      });
      CVVH.UI.byId("drinks").addEventListener("click", (event) => {
        const button = event.target.closest("[data-drink-id]"); if (button) this.chooseDrink(button.dataset.drinkId);
      });
      CVVH.UI.byId("customers").addEventListener("click", (event) => {
        const card = event.target.closest("[data-customer-id]"); if (card) this.selectCustomer(card.dataset.customerId);
      });
      CVVH.UI.byId("serve-btn").addEventListener("click", () => this.serve());
      CVVH.UI.byId("clear-tray-btn").addEventListener("click", () => this.clearTray());
      CVVH.UI.byId("trash-btn").addEventListener("click", () => this.useTrash());
      CVVH.UI.byId("pause-btn").addEventListener("click", () => this.pause());
      CVVH.UI.byId("resume-btn").addEventListener("click", () => this.resume());
      CVVH.UI.byId("quit-btn").addEventListener("click", () => this.quitToMenu());
    }

    start(day) {
      this.stopLoop();
      this.day = Math.max(1, Number(day) || this.save.currentDay || 1);
      this.save.currentDay = this.day;
      this.save.hasPlayed = true;
      this.save.money = Math.max(12000, this.save.money);
      this.modifiers = CVVH.Upgrades.modifiers(this.save.upgrades);
      this.dayDuration = CVVH.Config.BALANCE.dayDuration + Math.min(15, Math.floor((this.day - 1) / 2) * 2);
      this.remainingTime = this.dayDuration;
      this.reputation = this.save.reputation;
      this.startReputation = this.reputation;
      this.customers = [];
      this.tray = [];
      this.selectedSauce = null;
      this.selectedDrink = null;
      this.selectedCustomerId = null;
      this.spawnElapsed = 0;
      this.spawnedCount = 0;
      this.resolvedCustomers = 0;
      this.dailyTarget = CVVH.Config.dailyCustomerTarget(this.day);
      this.khanhAlertShown = false;
      const lastKhanhDay = Number(this.save.story.flags.lastKhanhDay || 0);
      this.khanhInvasionPlanned = this.day >= 2 && (this.day === 2 || this.day - lastKhanhDay >= 2 || Math.random() < .62);
      this.khanhSlot = Math.min(this.dailyTarget - 1, 3 + (this.day % 3));
      this.pendingTutorial = !this.save.tutorialCompleted;
      this.summary = { served: 0, lost: 0, incorrect: 0, burnt: 0, revenue: 0, ingredientCosts: 0, tips: 0, penalties: 0, bestCombo: 0, score: 0, reputationChange: 0 };
      this.combo = 0;
      this.active = true; this.paused = false; this.conversationActive = false; this.ending = false;
      this.availableFoods = CVVH.Config.getUnlockedFoods(this.day);
      this.currentEvent = CVVH.Story.eventForDay(this.day);
      this.fryer = new CVVH.Cooking.FryerManager(this.modifiers.fryerCapacity, this.modifiers, {
        ready: (slot) => this.onFoodReady(slot),
        burnt: (slot) => this.onFoodBurnt(slot)
      });
      CVVH.Storage.save(this.save);
      CVVH.UI.showScreen("game-screen");
      CVVH.UI.byId("pause-overlay").hidden = true;
      CVVH.UI.byId("customer-dialogue").hidden = true;
      CVVH.UI.byId("unlock-modal").hidden = true;
      this.renderAll(true);
      const scene = CVVH.Story.sceneForDay(this.day, this.save);
      if (scene) {
        this.paused = true;
        this.renderAll(false);
        this.story.show(scene, (completedScene) => {
          CVVH.Story.markScene(this.save, completedScene);
          CVVH.Storage.save(this.save);
          this.paused = false; this.lastTime = performance.now(); this.renderAll(true);
          this.spawnCustomer(this.pendingTutorial);
        });
      } else this.spawnCustomer(this.pendingTutorial);
      this.lastTime = performance.now();
      this.raf = window.requestAnimationFrame((time) => this.loop(time));
    }

    stopLoop() {
      this.active = false;
      if (this.raf) window.cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    loop(timestamp) {
      if (!this.active) return;
      const deltaMs = Math.min(100, Math.max(0, timestamp - this.lastTime));
      this.lastTime = timestamp;
      if (!this.paused && !this.conversationActive) this.update(deltaMs);
      this.raf = window.requestAnimationFrame((time) => this.loop(time));
    }

    update(deltaMs) {
      const deltaSeconds = deltaMs / 1000;
      this.remainingTime = Math.max(0, this.remainingTime - deltaSeconds);
      this.fryer.update(deltaMs);

      this.customers.forEach((customer) => {
        if (customer.update(deltaSeconds)) this.loseCustomer(customer);
      });
      const now = performance.now();
      const before = this.customers.length;
      this.customers = this.customers.filter(function (customer) { return !customer.removeAt || customer.removeAt > now; });
      if (before !== this.customers.length && !this.customers.some((customer) => customer.id === this.selectedCustomerId)) this.selectedCustomerId = null;

      if (!this.customers.length && this.resolvedCustomers >= this.dailyTarget && !this.ending) {
        this.endDay();
        return;
      }

      if (!this.tutorial.active) {
        this.spawnElapsed += deltaMs;
        if (this.spawnedCount < this.dailyTarget && this.spawnElapsed >= this.spawnInterval() && this.customers.length < this.maxCustomers()) {
          this.spawnElapsed = 0; this.spawnCustomer(false);
        }
      }

      this.renderAccumulator += deltaMs;
      if (this.renderAccumulator >= 90) { this.renderAccumulator = 0; this.renderDynamic(); }
    }

    maxCustomers() { return 1; }
    spawnInterval() { return Math.max(1200, (this.customers.length ? 5200 : 1800) * this.modifiers.spawnTimeScale * this.currentEvent.spawnScale); }
    currentWallet() { return this.save.money + this.summary.revenue + this.summary.tips - this.summary.ingredientCosts - this.summary.penalties; }
    selectedCustomer() { return this.customers.find((customer) => customer.id === this.selectedCustomerId && !customer.removeAt) || null; }
    trayCapacity() { const customer = this.selectedCustomer(); return customer && customer.specialKhanh ? Math.max(this.modifiers.trayCapacity, 7) : this.modifiers.trayCapacity; }

    spawnCustomer(tutorialOrder, forcedVariant, alertHandled, specialKhanh) {
      if (!this.active || this.customers.length >= this.maxCustomers() || this.spawnedCount >= this.dailyTarget) return;
      const unlocked = CVVH.CharacterSystem.updateUnlocks(this.save, this.day, this.reputation);
      if (unlocked.length && !tutorialOrder) {
        CVVH.Storage.save(this.save);
        this.showUnlockQueue(unlocked, () => this.spawnCustomer(false));
        return;
      }
      if (!tutorialOrder && !alertHandled && this.khanhInvasionPlanned && !this.khanhAlertShown && this.spawnedCount >= this.khanhSlot) {
        this.khanhAlertShown = true;
        this.conversationActive = true;
        this.renderAll(false);
        CVVH.UI.showKhanhAlert(() => {
          if (!this.active) return;
          this.conversationActive = false;
          this.lastTime = performance.now();
          this.spawnCustomer(false, CVVH.Characters.getById("khanh"), true, true);
        });
        return;
      }
      const variant = forcedVariant || (tutorialOrder ? CVVH.Characters.getById("trang") : CVVH.CharacterSystem.chooseCharacter(
        this.save, this.day, this.currentEvent, Math.random,
        { exclude: this.khanhInvasionPlanned && !this.khanhAlertShown ? ["khanh"] : [] }
      ));
      const effectiveTrayCapacity = specialKhanh ? Math.max(this.modifiers.trayCapacity, Math.min(7, CVVH.Config.BALANCE.maxTrayHardLimit)) : this.modifiers.trayCapacity;
      const customer = CVVH.Customers.create(this.day, this.availableFoods, this.modifiers, effectiveTrayCapacity, tutorialOrder, this.save, this.currentEvent, variant, specialKhanh === true);
      this.customers.push(customer);
      this.spawnedCount += 1;
      this.selectedCustomerId = customer.id;
      CVVH.Audio.play("arrival");
      this.renderAll(true);
      this.startCustomerDialogue(customer, tutorialOrder);
    }

    showUnlockQueue(ids, done) {
      const queue = ids.slice();
      this.conversationActive = true;
      const next = () => {
        const id = queue.shift();
        if (!id) {
          this.conversationActive = false;
          this.lastTime = performance.now();
          if (typeof done === "function") done();
          return;
        }
        CVVH.UI.showUnlock(CVVH.CharacterSystem.unlockDetails(id), next);
      };
      next();
    }

    startCustomerDialogue(customer, tutorialOrder) {
      this.conversationActive = true;
      this.renderAll(false);
      const lines = CVVH.CharacterSystem.preOrderDialogue(this.save, customer.character, this.currentEvent);
      CVVH.Storage.save(this.save);
      CVVH.UI.playCustomerDialogue(lines, { phase:"Trước khi gọi món", finalLabel:"Xem đơn", allowSkip:true }, () => {
        if (!this.active || customer.removeAt) return;
        customer.orderRevealed = true;
        this.conversationActive = false;
        this.lastTime = performance.now();
        this.renderAll(true);
        CVVH.UI.toast("Đơn của " + customer.name + " đã được mở!", "info");
        if (tutorialOrder && this.pendingTutorial) this.tutorial.start();
      });
    }

    addIngredient(foodId, sourceElement) {
      if (!this.canInteract()) return;
      const food = this.availableFoods.find(function (item) { return item.id === foodId; });
      if (!food) { CVVH.UI.toast("Món này chưa được mở khóa.", "error"); return; }
      if (this.fryer.isFull()) { CVVH.UI.toast("Chảo đã kín chỗ! Hãy lấy món chín ra trước.", "error"); CVVH.Audio.play("error"); return; }
      if (this.currentWallet() < food.cost) { CVVH.UI.toast("Không đủ tiền nhập thêm nguyên liệu.", "error"); CVVH.Audio.play("error"); return; }
      const slot = this.fryer.addFood(foodId);
      if (!slot) return;
      this.summary.ingredientCosts += food.cost;
      CVVH.Audio.play("fry");
      CVVH.UI.floating("−" + CVVH.Economy.money(food.cost), sourceElement, true);
      this.renderAll(true);
      this.tutorial.notify("fry:" + foodId);
    }

    useFryer(index, sourceElement) {
      if (!this.canInteract()) return;
      const slot = this.fryer.slots[index]; if (!slot) return;
      if (slot.state === "ready") {
        if (this.tray.length >= this.trayCapacity()) { CVVH.UI.toast("Khay đã đầy. Hãy phục vụ hoặc dọn khay.", "error"); CVVH.Audio.play("error"); return; }
        const foodId = this.fryer.collect(index); if (!foodId) return;
        this.tray.push(foodId); CVVH.Audio.play("click"); CVVH.UI.floating("Đã lấy món!", sourceElement, false);
        this.renderAll(true); this.tutorial.notify("collect");
      } else if (slot.state === "burnt") {
        this.fryer.discardBurnt(index); CVVH.Audio.play("click"); CVVH.UI.toast("Đã bỏ món cháy.", "info"); this.renderAll(true);
      }
    }

    chooseSauce(sauceId) {
      if (!this.canInteract()) return;
      const available = CVVH.Config.isSauceUnlocked(sauceId, this.day);
      if (!available) return;
      this.selectedSauce = this.selectedSauce === sauceId ? null : sauceId;
      CVVH.Audio.play("click"); this.renderAll(true);
      if (this.selectedSauce) this.tutorial.notify("sauce:" + sauceId);
    }

    chooseDrink(drinkId) {
      if (!this.canInteract()) return;
      const available = CVVH.Config.isDrinkUnlocked(drinkId, this.day);
      if (!available) return;
      this.selectedDrink = drinkId;
      CVVH.Audio.play("click"); this.renderAll(true);
      this.tutorial.notify("drink:" + drinkId);
    }

    selectCustomer(customerId) {
      if (!this.canInteract()) return;
      const customer = this.customers.find((item) => item.id === customerId && !item.removeAt);
      if (!customer) return;
      this.selectedCustomerId = customerId; CVVH.Audio.play("click"); this.renderAll(true);
    }

    serve() {
      if (!this.canInteract()) return;
      const customer = this.selectedCustomer();
      if (!customer) { CVVH.UI.toast("Hãy chọn khách cần phục vụ.", "error"); return; }
      if (!this.tray.length) { CVVH.UI.toast("Khay đang trống.", "error"); return; }
      if (!this.selectedSauce) { CVVH.UI.toast("Bạn chưa chọn nước sốt.", "error"); return; }
      if (!this.selectedDrink) { CVVH.UI.toast("Hãy chọn ly trà hoặc nút Không nước.", "error"); return; }
      const drink = CVVH.Config.drinkById(this.selectedDrink);
      if (drink && this.currentWallet() < drink.cost) { CVVH.UI.toast("Không đủ tiền pha ly này.", "error"); CVVH.Audio.play("error"); return; }
      if (drink) this.summary.ingredientCosts += drink.cost;
      if (CVVH.Orders.matches(customer.order, this.tray, this.selectedSauce, this.selectedDrink)) this.serveCorrect(customer);
      else this.serveWrong(customer);
    }

    serveCorrect(customer) {
      this.combo += 1;
      this.summary.bestCombo = Math.max(this.summary.bestCombo, this.combo);
      const result = CVVH.Economy.calculateOrder(customer.order, customer.patienceRatio(), this.combo, this.modifiers);
      const loyaltyTipBonus = customer.relationshipPoints >= 40 ? .25 : customer.relationshipPoints >= 22 ? .16 : customer.relationshipPoints >= 10 ? .1 : customer.relationshipPoints >= 4 ? .05 : 0;
      result.tip = Math.round(result.tip * (1 + loyaltyTipBonus) / 500) * 500;
      if (customer.characterId === "khanh") {
        const khanhMultiplier = customer.specialKhanh ? 4.2 : 2.8;
        result.tip = Math.max(customer.specialKhanh ? 12000 : 6000, Math.round(result.tip * khanhMultiplier / 500) * 500);
      }
      this.summary.revenue += result.revenue; this.summary.tips += result.tip;
      this.reputation = Math.min(100, this.reputation + CVVH.Config.BALANCE.correctReputation);
      let relationPoints = 1 + (customer.patienceRatio() > .72 ? 1 : 0);
      if (customer.character.favoriteFood && customer.order.items.includes(customer.character.favoriteFood)) relationPoints += 1;
      const relationship = CVVH.Story.relationshipGain(this.save, customer.characterId, relationPoints);
      customer.relationshipPoints = relationship.points;
      customer.relationshipStage = relationship.stage;
      if (customer.characterId === "anh-bon-ba-bay") this.save.story.mysteryProgress = Math.min(3, this.save.story.mysteryProgress + 1);
      const responseContext = CVVH.Story.dialogueContext(customer);
      const response = CVVH.Characters.pickDialogue(customer.character, responseContext, this.save);
      const wasBonus = customer.bonusSecond === true;
      const triggerBonus = customer.characterId === "khanh" && !wasBonus && !this.tutorial.active && Math.random() < (customer.specialKhanh ? .5 : .28);
      if (triggerBonus) {
        customer.bonusSecond = true;
        customer.order = CVVH.CharacterSystem.generateOrder(this.save, customer.character, this.day, this.availableFoods, customer.specialKhanh ? Math.max(5, Math.min(7, CVVH.Config.BALANCE.maxTrayHardLimit)) : Math.min(this.modifiers.trayCapacity, 5), Math.random, false, customer.specialKhanh === true);
        CVVH.CharacterSystem.recordOrder(this.save, customer.characterId, customer.order);
        customer.reward = customer.order.items.reduce((sum, id) => sum + CVVH.Config.foodById(id).price, 0) + ((CVVH.Config.drinkById(customer.order.drink || "none") || {}).price || 0);
        customer.remainingPatience = customer.maxPatience * 1.12;
        customer.status = "waiting";
        customer.orderRevealed = false;
        customer.speech = "Chị... làm thêm phần nữa được không? Em đang hoàn thành những gì đã bắt đầu.";
      } else {
        customer.status = "served"; customer.removeAt = null;
        this.summary.served += 1;
        this.resolvedCustomers += 1;
      }
      const card = document.querySelector("[data-customer-id='" + customer.id + "']");
      CVVH.Audio.play("success"); if (card) { CVVH.UI.coinBurst(card); CVVH.UI.floating("+" + CVVH.Economy.money(result.revenue + result.tip), card, false); }
      let message = response + (result.tip > 0 ? " · Boa " + CVVH.Economy.money(result.tip) : "") + " · Combo x" + result.multiplier;
      if (relationship.leveled) message += " · Quan hệ: " + relationship.stage;
      if (triggerBonus) message = "Khánh gọi thêm đơn thưởng! “Em đang hoàn thành những gì đã bắt đầu.”";
      if (wasBonus && !this.save.story.seenScenes.includes("achievement-an-cho-dang")) {
        this.save.story.seenScenes.push("achievement-an-cho-dang");
        message += " · Thành tựu: Ăn cho đáng!";
      }
      CVVH.UI.toast(message, "success");
      this.tray = []; this.selectedSauce = null; this.selectedDrink = null; if (!triggerBonus) this.selectedCustomerId = null;
      CVVH.CharacterSystem.recordService(this.save, customer.characterId, true, customer.patienceRatio() > .72);
      CVVH.Storage.save(this.save);
      this.renderAll(true); this.tutorial.notify("served");
      this.showPostService(customer, true, triggerBonus);
    }

    serveWrong(customer) {
      this.summary.incorrect += 1; this.summary.penalties += CVVH.Config.BALANCE.wrongOrderPenalty;
      this.combo = 0; this.reputation = Math.max(0, this.reputation - CVVH.Config.BALANCE.wrongReputation);
      customer.status = "angry";
      customer.speech = CVVH.Characters.pickDialogue(customer.character, "wrongOrder", this.save);
      this.tray = []; this.selectedSauce = null; this.selectedDrink = null;
      CVVH.CharacterSystem.recordService(this.save, customer.characterId, false, false);
      CVVH.Audio.play("error"); CVVH.UI.toast(customer.speech + " · Khách vẫn đang chờ đơn đúng.", "error");
      const serveButton = CVVH.UI.byId("serve-btn"); CVVH.UI.floating("−" + CVVH.Economy.money(CVVH.Config.BALANCE.wrongOrderPenalty), serveButton, true);
      CVVH.Storage.save(this.save);
      this.renderAll(true);
      this.showPostService(customer, false, false);
    }

    showPostService(customer, correct, bonusOrder) {
      this.conversationActive = true;
      this.renderAll(false);
      const lines = bonusOrder ? CVVH.CharacterSystem.bonusOrderDialogue(customer.character) : CVVH.CharacterSystem.postServiceDialogue(this.save, customer.character, correct, customer.patienceRatio());
      CVVH.UI.playCustomerDialogue(lines, { phase:correct ? "Phản hồi" : "Đơn chưa đúng", finalLabel:bonusOrder ? "Xem đơn mới" : (correct ? "Tạm biệt" : "Làm lại"), allowSkip:true }, () => {
        if (!this.active) return;
        if (bonusOrder) {
          customer.status = "waiting";
          customer.orderRevealed = true;
          this.selectedCustomerId = customer.id;
          CVVH.UI.toast("Khánh gọi thêm một đơn ngẫu nhiên!", "info");
        } else if (correct) {
          customer.removeAt = performance.now() + 360;
          this.selectedCustomerId = null;
        } else {
          customer.status = customer.patienceRatio() < .22 ? "angry" : "waiting";
          customer.orderRevealed = true;
        }
        this.conversationActive = false;
        this.lastTime = performance.now();
        CVVH.Storage.save(this.save);
        this.renderAll(true);
      });
    }

    onFoodReady(slot) {
      if (!this.active) return;
      CVVH.Audio.play("ready"); CVVH.UI.toast(CVVH.Config.foodById(slot.foodId).name + " đã chín!", "success");
      this.renderAll(true); this.tutorial.notify("ready");
    }

    onFoodBurnt(slot) {
      if (!this.active) return;
      this.summary.burnt += 1; this.summary.penalties += 1000; this.combo = 0;
      this.reputation = Math.max(0, this.reputation - CVVH.Config.BALANCE.burntReputation);
      CVVH.Audio.play("error"); CVVH.UI.toast(CVVH.Config.foodById(slot.foodId).name + " bị cháy! Bấm vào chảo để bỏ.", "error");
      this.renderAll(true);
    }

    loseCustomer(customer) {
      if (customer.lossRecorded) return;
      customer.lossRecorded = true; customer.removeAt = performance.now() + 520;
      this.summary.lost += 1; this.combo = 0;
      this.resolvedCustomers += 1;
      this.reputation = Math.max(0, this.reputation - CVVH.Config.BALANCE.leaveReputation);
      if (this.selectedCustomerId === customer.id) this.selectedCustomerId = null;
      CVVH.Audio.play("error"); CVVH.UI.toast(customer.name + " đã bỏ đi vì chờ quá lâu.", "error"); this.renderAll(true);
    }

    clearTray() {
      if (!this.canInteract()) return;
      if (!this.tray.length && !this.selectedSauce && !this.selectedDrink) { CVVH.UI.toast("Khay đang trống.", "info"); return; }
      this.tray = []; this.selectedSauce = null; this.selectedDrink = null; CVVH.Audio.play("click"); CVVH.UI.toast("Đã dọn sạch khay.", "info"); this.renderAll(true);
    }

    useTrash() {
      if (!this.canInteract()) return;
      const burntSlots = this.fryer.slots.filter(function (slot) { return slot.state === "burnt"; });
      if (burntSlots.length) {
        burntSlots.forEach((slot) => this.fryer.discardBurnt(slot.index));
        CVVH.UI.toast("Đã bỏ " + burntSlots.length + " món cháy.", "info"); CVVH.Audio.play("click"); this.renderAll(true);
      } else this.clearTray();
    }

    canInteract() { return this.active && !this.paused && !this.conversationActive && !this.ending; }
    controlsEnabled() { return !this.paused && !this.conversationActive && !this.ending; }

    pause() {
      if (!this.active || this.ending || this.paused) return;
      this.paused = true; CVVH.UI.byId("pause-overlay").hidden = false; this.renderAll(false); CVVH.Audio.play("click");
    }
    resume() {
      if (!this.active || !this.paused) return;
      this.paused = false; this.lastTime = performance.now(); CVVH.UI.byId("pause-overlay").hidden = true; this.renderAll(true); CVVH.Audio.play("click");
    }
    autoPause() { if (this.active && !this.paused && !this.ending) this.pause(); }
    quitToMenu() {
      this.stopLoop(); this.paused = false; CVVH.UI.byId("pause-overlay").hidden = true;
      CVVH.UI.byId("customer-dialogue").hidden = true; CVVH.UI.byId("unlock-modal").hidden = true;
      if (this.tutorial.active) this.tutorial.complete(true);
      if (typeof this.callbacks.menu === "function") this.callbacks.menu();
    }

    completeTutorial(skipped) {
      this.save.tutorialCompleted = true; this.pendingTutorial = false; CVVH.Storage.save(this.save);
      CVVH.UI.toast(skipped ? "Đã bỏ qua hướng dẫn. Bạn có thể xem lại trong Cách chơi." : "Hoàn thành hướng dẫn — mở quầy thôi!", skipped ? "info" : "success");
      this.spawnElapsed = 0;
    }

    renderDynamic() {
      if (!this.active) return;
      CVVH.UI.updateHUD(this);
      CVVH.UI.updateFryers(this.fryer, this.controlsEnabled());
      CVVH.UI.updateCustomers(this.customers, this.selectedCustomerId, this.maxCustomers(), this.controlsEnabled());
      CVVH.UI.updateServeState(this.selectedCustomer(), this.tray.length, this.selectedSauce, this.selectedDrink, this.controlsEnabled());
    }

    renderAll(refreshTutorial) {
      if (!this.active) return;
      CVVH.UI.renderIngredients(this.day, this.controlsEnabled());
      CVVH.UI.byId("world-event").textContent = this.currentEvent.label;
      CVVH.UI.renderSauces(this.day, this.selectedSauce, this.controlsEnabled());
      CVVH.UI.renderDrinks(this.day, this.selectedDrink, this.controlsEnabled());
      CVVH.UI.renderFryers(this.fryer, this.controlsEnabled());
      CVVH.UI.renderTray(this.tray, this.trayCapacity());
      CVVH.UI.renderCustomers(this.customers, this.selectedCustomerId, this.maxCustomers(), this.controlsEnabled());
      CVVH.UI.updateHUD(this);
      CVVH.UI.updateServeState(this.selectedCustomer(), this.tray.length, this.selectedSauce, this.selectedDrink, this.controlsEnabled());
      if (refreshTutorial && this.tutorial.active) this.tutorial.refreshHighlight();
    }

    endDay() {
      if (this.ending) return;
      this.ending = true; this.active = false; if (this.raf) window.cancelAnimationFrame(this.raf);
      if (this.tutorial.active) this.tutorial.complete(true);
      const profit = this.summary.revenue + this.summary.tips - this.summary.ingredientCosts - this.summary.penalties;
      this.summary.reputationChange = this.reputation - this.startReputation;
      this.summary.score = Math.max(0, Math.round(this.summary.served * 900 + this.summary.revenue / 90 + this.summary.tips / 40 + this.summary.bestCombo * 160 - this.summary.incorrect * 320 - this.summary.lost * 260 - this.summary.burnt * 180));
      this.save.money = Math.max(0, this.save.money + profit);
      this.save.reputation = this.reputation;
      this.save.bestScore = Math.max(this.save.bestScore, this.summary.score);
      const completedDay = this.day;
      this.save.currentDay = this.day + 1;
      const unlockedFoods = CVVH.Config.FOODS.filter((food) => food.unlockDay === this.save.currentDay && !this.save.unlockedFoods.includes(food.id));
      unlockedFoods.forEach((food) => this.save.unlockedFoods.push(food.id));
      const unlockedDrinks = CVVH.Config.DRINKS.filter((drink) => drink.id !== "none" && drink.unlockDay === this.save.currentDay);
      const unlocked = unlockedFoods.concat(unlockedDrinks);
      const stats = this.save.stats;
      stats.totalCustomersServed += this.summary.served;
      stats.totalCustomersLost += this.summary.lost;
      stats.totalRevenue += this.summary.revenue;
      stats.totalProfit += profit;
      stats.totalTips += this.summary.tips;
      stats.totalBurntFood += this.summary.burnt;
      stats.totalIncorrectOrders += this.summary.incorrect;
      stats.highestCombo = Math.max(stats.highestCombo, this.summary.bestCombo);
      stats.bestDailyProfit = Math.max(stats.bestDailyProfit, profit);
      stats.highestDayReached = Math.max(stats.highestDayReached, this.save.currentDay);
      const chapter = CVVH.Story.chapterForDay(completedDay);
      if (completedDay === chapter.to && !this.save.story.chaptersCompleted.includes(chapter.id)) this.save.story.chaptersCompleted.push(chapter.id);
      CVVH.Storage.save(this.save);
      CVVH.UI.renderEnd(completedDay, this.summary, unlocked);
      if (typeof this.callbacks.saved === "function") this.callbacks.saved();
    }

    getStatus() {
      return {
        active: this.active, paused: this.paused, day: this.day || this.save.currentDay,
        remainingTime: Math.ceil(this.remainingTime || 0), money: Math.round(this.summary ? this.currentWallet() : this.save.money),
        reputation: Math.round(this.reputation == null ? this.save.reputation : this.reputation), customers: this.customers.length,
        trayItems: this.tray.slice(), selectedSauce: this.selectedSauce, selectedDrink:this.selectedDrink, dailyTarget:this.dailyTarget || 0, resolvedCustomers:this.resolvedCustomers || 0, combo: this.combo || 0
      };
    }
  }

  CVVH.Game = Game;
})();
