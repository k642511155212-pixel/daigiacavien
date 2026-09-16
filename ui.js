(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};
  const byId = function (id) { return document.getElementById(id); };
  const stateLabels = { empty: "TRỐNG", raw: "SỐNG", cooking: "ĐANG CHIÊN", ready: "SẴN SÀNG", burnt: "CHÁY" };

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(function (screen) {
      screen.classList.toggle("active", screen.id === id);
    });
    document.body.classList.toggle("game-active", id === "game-screen");
    window.scrollTo(0, 0);
  }

  function openModal(id) { const modal = byId(id); if (modal) { modal.hidden = false; const button = modal.querySelector("button"); if (button) button.focus(); } }
  function closeModal(id) { const modal = byId(id); if (modal) modal.hidden = true; }

  function image(src, alt, className) {
    const img = document.createElement("img");
    img.src = src; img.alt = alt || ""; if (className) img.className = className;
    return img;
  }

  function renderMenu(save) {
    byId("menu-chapter").textContent = CVVH.Story.chapterForDay(save.currentDay).title;
    byId("menu-day").textContent = save.currentDay;
    byId("continue-day").textContent = save.currentDay;
    byId("menu-money").textContent = CVVH.Economy.money(save.money);
    byId("menu-reputation").textContent = Math.round(save.reputation) + "/100";
    byId("menu-best").textContent = new Intl.NumberFormat("vi-VN").format(save.bestScore);
    const continueButton = byId("continue-btn");
    continueButton.disabled = !save.hasPlayed;
    continueButton.title = save.hasPlayed ? "Tiếp tục từ ngày đã lưu" : "Hãy chơi ngày đầu tiên trước";
    setSoundButtons(save.soundEnabled);
  }

  function setSoundButtons(enabled) {
    [byId("sound-btn"), byId("game-sound-btn")].forEach(function (button) {
      if (!button) return;
      button.setAttribute("aria-pressed", String(enabled));
      if (button.id === "sound-btn") button.textContent = enabled ? "🔊 Âm thanh" : "🔇 Đã tắt tiếng";
      else button.textContent = enabled ? "🔊" : "🔇";
    });
  }

  function renderIngredients(day, enabled) {
    const container = byId("ingredients");
    container.textContent = "";
    CVVH.Config.getUnlockedFoods(day).forEach(function (food) {
      const locked = food.unlockDay > day;
      const button = document.createElement("button");
      button.className = "ingredient-button" + (locked ? " locked" : "");
      button.dataset.foodId = food.id;
      button.disabled = locked || !enabled;
      button.setAttribute("aria-label", locked ? food.name + " mở khóa ở ngày " + food.unlockDay : "Cho " + food.name + " vào chảo, giá vốn " + CVVH.Economy.money(food.cost));
      button.appendChild(image(food.image, ""));
      const strong = document.createElement("strong"); strong.textContent = locked ? "Ngày " + food.unlockDay : food.shortName;
      const small = document.createElement("small"); small.textContent = locked ? "Chưa mở" : CVVH.Economy.money(food.cost);
      button.appendChild(strong); button.appendChild(small); container.appendChild(button);
    });
  }

  function renderSauces(day, selected, enabled) {
    const container = byId("sauces"); container.textContent = "";
    CVVH.Config.getUnlockedSauces(day).forEach(function (sauce) {
      const button = document.createElement("button");
      button.className = "sauce-button" + (selected === sauce.id ? " selected" : "");
      button.dataset.sauceId = sauce.id; button.disabled = !enabled;
      button.setAttribute("aria-pressed", String(selected === sauce.id));
      button.setAttribute("aria-label", "Chọn " + sauce.name);
      button.appendChild(image(sauce.image, ""));
      const span = document.createElement("span"); span.textContent = sauce.shortName; button.appendChild(span);
      container.appendChild(button);
    });
  }

  function renderDrinks(day, selected, enabled) {
    const container = byId("drinks"); container.textContent = "";
    CVVH.Config.getUnlockedDrinks(day).forEach(function (drink) {
      const button = document.createElement("button");
      button.className = "drink-button" + (selected === drink.id ? " selected" : "");
      button.dataset.drinkId = drink.id; button.disabled = !enabled;
      button.setAttribute("aria-pressed", String(selected === drink.id));
      button.setAttribute("aria-label", drink.id === "none" ? "Đơn không có nước" : "Pha " + drink.name + ", giá vốn " + CVVH.Economy.money(drink.cost));
      button.appendChild(image(drink.image, ""));
      const span = document.createElement("span"); span.textContent = drink.shortName; button.appendChild(span);
      container.appendChild(button);
    });
  }

  function createFryerSlot(slot) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.slotIndex = slot.index;
    button.dataset.foodId = slot.foodId || "";
    if (slot.foodId) {
      const food = CVVH.Config.foodById(slot.foodId);
      const art = document.createElement("div"); art.className = "fryer-food"; art.appendChild(image(food.image, food.name)); button.appendChild(art);
      const progress = document.createElement("div"); progress.className = "fryer-progress";
      const fill = document.createElement("i"); progress.appendChild(fill); button.appendChild(progress);
      const status = document.createElement("span"); status.className = "fryer-status"; button.appendChild(status);
    }
    return button;
  }

  function updateFryerButton(button, slot, enabled) {
    const className = "fryer-slot " + slot.state;
    if (button.className !== className) button.className = className;
    button.dataset.foodId = slot.foodId || "";
    button.disabled = !enabled || slot.state === "empty" || slot.state === "raw" || slot.state === "cooking";
    button.setAttribute("aria-label", "Ô chảo " + (slot.index + 1) + ": " + stateLabels[slot.state]);
    const fill = button.querySelector(".fryer-progress i");
    if (fill) fill.style.width = Math.round(slot.progress * 100) + "%";
    const status = button.querySelector(".fryer-status");
    if (status) status.textContent = stateLabels[slot.state];
  }

  function renderFryers(manager, enabled) {
    const container = byId("fryer-slots");
    const expectedIndexes = new Set(manager.slots.map(function (slot) { return String(slot.index); }));
    container.querySelectorAll("[data-slot-index]").forEach(function (button) {
      if (!expectedIndexes.has(button.dataset.slotIndex)) button.remove();
    });
    manager.slots.forEach(function (slot) {
      let button = container.querySelector("[data-slot-index='" + slot.index + "']");
      const foodId = slot.foodId || "";
      if (!button || button.dataset.foodId !== foodId) {
        const replacement = createFryerSlot(slot);
        if (button) button.replaceWith(replacement); else container.appendChild(replacement);
        button = replacement;
      }
      updateFryerButton(button, slot, enabled);
    });
  }

  function updateFryers(manager, enabled) {
    const container = byId("fryer-slots");
    const buttons = container.querySelectorAll("[data-slot-index]");
    if (buttons.length !== manager.slots.length) { renderFryers(manager, enabled); return; }
    manager.slots.forEach(function (slot) {
      const button = container.querySelector("[data-slot-index='" + slot.index + "']");
      if (!button || button.dataset.foodId !== (slot.foodId || "")) { renderFryers(manager, enabled); return; }
      updateFryerButton(button, slot, enabled);
    });
  }

  function renderTray(items, capacity) {
    const container = byId("serving-tray"); container.textContent = "";
    items.forEach(function (foodId, index) {
      const food = CVVH.Config.foodById(foodId); if (!food) return;
      const item = document.createElement("div"); item.className = "tray-item"; item.dataset.trayIndex = index; item.title = food.name;
      item.appendChild(image(food.image, food.name)); container.appendChild(item);
    });
    byId("tray-count").textContent = items.length + "/" + capacity;
  }

  function appendOrderItems(container, order) {
    const countMap = CVVH.Orders.counts(order.items);
    Object.keys(countMap).forEach(function (foodId, index) {
      const food = CVVH.Config.foodById(foodId); if (!food) return;
      if (index > 0) { const plus = document.createElement("span"); plus.className = "order-plus"; plus.textContent = "+"; container.appendChild(plus); }
      const wrap = document.createElement("div"); wrap.className = "order-food"; wrap.title = food.name;
      wrap.appendChild(image(food.image, food.name));
      if (countMap[foodId] > 1) { const count = document.createElement("em"); count.textContent = "×" + countMap[foodId]; wrap.appendChild(count); }
      container.appendChild(wrap);
    });
    const plus = document.createElement("span"); plus.className = "order-plus"; plus.textContent = "+"; container.appendChild(plus);
    const sauce = CVVH.Config.sauceById(order.sauce);
    const sauceWrap = document.createElement("div"); sauceWrap.className = "order-sauce";
    sauceWrap.appendChild(image(sauce.image, sauce.name)); const label = document.createElement("small"); label.textContent = sauce.shortName; sauceWrap.appendChild(label); container.appendChild(sauceWrap);
    const drink = CVVH.Config.drinkById(order.drink || "none");
    if (drink) {
      const drinkWrap = document.createElement("div"); drinkWrap.className = "order-drink"; drinkWrap.title = drink.name;
      drinkWrap.appendChild(image(drink.image, drink.name));
      const drinkLabel = document.createElement("small"); drinkLabel.textContent = drink.shortName; drinkWrap.appendChild(drinkLabel);
      container.appendChild(drinkWrap);
    }
  }

  function customerRenderKey(customer) {
    return JSON.stringify([customer.name, customer.avatar, customer.speech, customer.reward, customer.order.items, customer.order.sauce, customer.order.drink || "none", customer.relationshipStage, Boolean(customer.bonusSecond)]);
  }

  function createCustomerCard(customer) {
      const card = document.createElement("button");
      card.type = "button"; card.className = "customer-card";
      card.dataset.customerId = customer.id;
      card.dataset.renderKey = customerRenderKey(customer);
      card.setAttribute("role", "listitem"); card.setAttribute("aria-label", "Chọn khách " + customer.name);
      const bubble = document.createElement("div"); bubble.className = "order-bubble";
      const head = document.createElement("div"); head.className = "order-head";
      const wait = document.createElement("span"); wait.textContent = customer.speech || "Cho mình món này"; wait.title = customer.speech || "";
      const reward = document.createElement("span"); reward.textContent = CVVH.Economy.money(customer.reward);
      head.appendChild(wait); head.appendChild(reward); bubble.appendChild(head);
      const items = document.createElement("div"); items.className = "order-items"; appendOrderItems(items, customer.order); bubble.appendChild(items); card.appendChild(bubble);
      const avatarWrap = document.createElement("div"); avatarWrap.className = "customer-avatar-wrap"; avatarWrap.appendChild(image(customer.avatar, "Chân dung " + customer.name, "customer-avatar")); card.appendChild(avatarWrap);
      const patience = document.createElement("div"); patience.className = "patience";
      const fill = document.createElement("i"); patience.appendChild(fill); card.appendChild(patience);
      const name = document.createElement("span"); name.className = "customer-name"; name.textContent = customer.name + (customer.relationshipStage === "STRANGER" ? "" : " · " + CVVH.Characters.stageLabel(customer.relationshipStage)); card.appendChild(name);
      return card;
  }

  function updateCustomerCard(card, customer, selectedId, enabled) {
    const ratio = customer.patienceRatio();
    const className = "customer-card " + customer.status + (selectedId === customer.id ? " selected" : "") + (customer.orderRevealed ? " order-revealed" : " order-hidden");
    if (card.className !== className) card.className = className;
    card.disabled = !enabled || customer.status === "leaving" || customer.status === "served";
    card.setAttribute("aria-label", (selectedId === customer.id ? "Đang chọn khách " : "Chọn khách ") + customer.name);
    const wait = card.querySelector(".order-head span:first-child");
    if (wait) wait.textContent = customer.status === "angry" ? "Sắp hết kiên nhẫn!" : (customer.speech || "Cho mình món này");
    const patience = card.querySelector(".patience");
    const fill = card.querySelector(".patience i");
    if (patience) patience.setAttribute("aria-label", "Kiên nhẫn " + Math.round(ratio * 100) + "%");
    if (fill) {
      fill.style.width = Math.round(ratio * 100) + "%";
      fill.style.background = ratio > .65 ? "#45b85a" : ratio > .4 ? "#f0c441" : ratio > .2 ? "#ef8435" : "#e83c38";
    }
  }

  function renderCustomers(customers, selectedId, maxCustomers, enabled) {
    const container = byId("customers");
    const activeIds = new Set(customers.map(function (customer) { return customer.id; }));
    container.querySelectorAll("[data-customer-id]").forEach(function (card) {
      if (!activeIds.has(card.dataset.customerId)) card.remove();
    });
    customers.forEach(function (customer) {
      let card = container.querySelector("[data-customer-id='" + customer.id + "']");
      const renderKey = customerRenderKey(customer);
      if (!card || card.dataset.renderKey !== renderKey) {
        const replacement = createCustomerCard(customer);
        if (card) card.replaceWith(replacement); else container.appendChild(replacement);
        card = replacement;
      }
      updateCustomerCard(card, customer, selectedId, enabled);
    });
    byId("empty-customers").hidden = customers.length > 0;
    byId("customer-count").textContent = customers.length + "/" + maxCustomers + " khách";
  }

  function updateCustomers(customers, selectedId, maxCustomers, enabled) {
    const container = byId("customers");
    const cards = container.querySelectorAll("[data-customer-id]");
    if (cards.length !== customers.length) { renderCustomers(customers, selectedId, maxCustomers, enabled); return; }
    for (const customer of customers) {
      const card = container.querySelector("[data-customer-id='" + customer.id + "']");
      if (!card || card.dataset.renderKey !== customerRenderKey(customer)) { renderCustomers(customers, selectedId, maxCustomers, enabled); return; }
      updateCustomerCard(card, customer, selectedId, enabled);
    }
    byId("empty-customers").hidden = customers.length > 0;
    byId("customer-count").textContent = customers.length + "/" + maxCustomers + " khách";
  }

  function updateHUD(game) {
    byId("hud-day").textContent = game.day;
    const resolved = game.summary.served + game.summary.lost;
    byId("hud-time").textContent = resolved + "/" + game.dailyTarget;
    byId("customer-count").textContent = "Lượt " + Math.max(1, Math.min(game.spawnedCount, game.dailyTarget)) + "/" + game.dailyTarget;
    byId("hud-money").textContent = CVVH.Economy.money(game.currentWallet());
    byId("hud-reputation").textContent = Math.round(game.reputation);
    byId("rep-bar").style.width = game.reputation + "%";
    byId("day-time-bar").style.width = Math.min(100, resolved / game.dailyTarget * 100) + "%";
    const multiplier = CVVH.Economy.comboMultiplier(game.combo);
    byId("hud-combo").textContent = "x" + multiplier;
    const box = byId("combo-box"); box.classList.toggle("hot", multiplier > 1);
  }

  function formatTime(seconds) {
    const value = Math.max(0, Math.ceil(seconds));
    return String(Math.floor(value / 60)).padStart(2, "0") + ":" + String(value % 60).padStart(2, "0");
  }

  function updateServeState(selectedCustomer, trayLength, sauce, drink, enabled) {
    const button = byId("serve-btn");
    const ready = Boolean(selectedCustomer && trayLength > 0 && sauce && drink);
    let hint = "Chọn một khách để phục vụ";
    if (selectedCustomer && trayLength === 0) hint = selectedCustomer.name + " đã được chọn · Lấy món chín ra khay";
    else if (selectedCustomer && !sauce) hint = selectedCustomer.name + " đã được chọn · Chọn nước sốt";
    else if (selectedCustomer && !drink) hint = selectedCustomer.name + " đã được chọn · Chọn trà hoặc Không nước";
    else if (ready) hint = "Sẵn sàng phục vụ " + selectedCustomer.name;
    button.disabled = !enabled;
    button.classList.toggle("is-ready", ready);
    button.title = enabled ? (ready ? "Giao khay cho " + selectedCustomer.name : "Bấm để xem bước còn thiếu") : "Trò chơi đang tạm dừng";
    button.setAttribute("aria-label", button.title);
    byId("selected-customer-label").textContent = hint;
  }

  function showKhanhAlert(done) {
    const alert = byId("khanh-alert");
    alert.hidden = false;
    document.body.classList.add("khanh-shake");
    CVVH.Audio.play("arrival");
    window.setTimeout(function () {
      alert.hidden = true;
      document.body.classList.remove("khanh-shake");
      if (typeof done === "function") done();
    }, 7100);
  }

  function playCustomerDialogue(lines, options, done) {
    const panel = byId("customer-dialogue");
    const nextButton = byId("customer-dialogue-next");
    const skipButton = byId("customer-dialogue-skip");
    const settings = options || {};
    let index = 0;
    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      panel.hidden = true;
      nextButton.onclick = null;
      skipButton.onclick = null;
      if (typeof done === "function") done();
    }
    function renderLine() {
      const current = lines[index];
      byId("customer-dialogue-progress").textContent = (settings.phase || "Trò chuyện") + " · " + (index + 1) + "/" + lines.length;
      byId("customer-dialogue-speaker").textContent = current.speaker;
      byId("customer-dialogue-text").textContent = current.text;
      const avatar = byId("customer-dialogue-avatar");
      avatar.src = current.avatar || "./assets/ui/cart.svg";
      avatar.alt = "Chân dung " + current.speaker;
      nextButton.textContent = index === lines.length - 1 ? (settings.finalLabel || "Xem đơn") : "Tiếp";
    }
    panel.hidden = false;
    skipButton.hidden = settings.allowSkip === false;
    nextButton.onclick = function () {
      CVVH.Audio.play("click");
      if (index >= lines.length - 1) { finish(); return; }
      index += 1; renderLine();
    };
    skipButton.onclick = function () { CVVH.Audio.play("click"); finish(); };
    renderLine();
    nextButton.focus();
  }

  function showUnlock(details, done) {
    const modal = byId("unlock-modal");
    const avatar = byId("unlock-avatar");
    avatar.src = details.avatar; avatar.alt = "Chân dung " + details.name;
    byId("unlock-name").textContent = details.name;
    byId("unlock-tagline").textContent = details.tagline;
    byId("unlock-trait").textContent = details.trait;
    const button = byId("unlock-continue-btn");
    button.onclick = function () {
      CVVH.Audio.play("upgrade"); modal.hidden = true; button.onclick = null;
      if (typeof done === "function") done();
    };
    modal.hidden = false;
    button.focus();
  }

  function toast(message, type) {
    const region = byId("toast-region"); const item = document.createElement("div"); item.className = "toast " + (type || "info"); item.textContent = message; region.appendChild(item);
    window.setTimeout(function () { item.remove(); }, 2600);
  }

  function floating(message, element, negative) {
    const rect = element ? element.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
    const text = document.createElement("div"); text.className = "floating-text" + (negative ? " negative" : ""); text.textContent = message;
    text.style.left = (rect.left + rect.width / 2) + "px"; text.style.top = rect.top + "px"; byId("float-layer").appendChild(text);
    window.setTimeout(function () { text.remove(); }, 1250);
  }

  function coinBurst(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 8; i += 1) {
      const coin = document.createElement("i"); coin.className = "coin-particle";
      coin.style.left = (rect.left + rect.width / 2) + "px"; coin.style.top = (rect.top + rect.height / 2) + "px";
      coin.style.setProperty("--tx", ((Math.random() - .5) * 130) + "px"); coin.style.setProperty("--ty", (-35 - Math.random() * 85) + "px");
      byId("float-layer").appendChild(coin); window.setTimeout(function () { coin.remove(); }, 800);
    }
  }

  function sparkle(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 6; i += 1) {
      const item = document.createElement("i"); item.className = "sparkle-particle"; item.textContent = "✦";
      item.style.left = (rect.left + Math.random() * rect.width) + "px"; item.style.top = (rect.top + Math.random() * rect.height) + "px";
      byId("float-layer").appendChild(item); window.setTimeout(function () { item.remove(); }, 900);
    }
  }

  function renderShop(save, onBuy) {
    byId("shop-money").textContent = CVVH.Economy.money(save.money);
    const grid = byId("upgrade-grid"); grid.textContent = "";
    CVVH.Config.UPGRADES.forEach(function (upgrade) {
      const level = save.upgrades[upgrade.id] || 0; const maxed = level >= upgrade.maxLevel;
      const card = document.createElement("article"); card.className = "upgrade-card";
      const icon = document.createElement("div"); icon.className = "upgrade-icon"; icon.textContent = upgrade.icon; card.appendChild(icon);
      const title = document.createElement("h2"); title.textContent = upgrade.name; card.appendChild(title);
      const desc = document.createElement("p"); desc.textContent = upgrade.description; card.appendChild(desc);
      const levels = document.createElement("div"); levels.className = "upgrade-level"; levels.setAttribute("aria-label", "Cấp " + level + " trên " + upgrade.maxLevel);
      for (let index = 0; index < upgrade.maxLevel; index += 1) { const pip = document.createElement("i"); if (index < level) pip.className = "filled"; levels.appendChild(pip); }
      card.appendChild(levels);
      const costLine = document.createElement("div"); costLine.className = "upgrade-cost";
      const current = document.createElement("span"); current.textContent = "Cấp " + level + "/" + upgrade.maxLevel; const cost = document.createElement("strong"); cost.textContent = maxed ? "Tối đa" : CVVH.Economy.money(CVVH.Economy.upgradeCost(upgrade, level)); costLine.appendChild(current); costLine.appendChild(cost); card.appendChild(costLine);
      const button = document.createElement("button"); button.className = "game-button " + (maxed ? "game-button--cream" : "game-button--teal"); button.disabled = maxed; button.textContent = maxed ? "Đã đạt cấp tối đa" : "Nâng cấp"; button.dataset.upgradeId = upgrade.id;
      button.addEventListener("click", function () { onBuy(upgrade.id, card); }); card.appendChild(button); grid.appendChild(card);
    });
  }

  function renderStats(save) {
    const s = save.stats;
    const values = [
      ["🍢","Khách đã phục vụ",s.totalCustomersServed], ["🚶","Khách bỏ đi",s.totalCustomersLost],
      ["💰","Tổng doanh thu",CVVH.Economy.money(s.totalRevenue)], ["📈","Tổng lợi nhuận",CVVH.Economy.money(s.totalProfit)],
      ["🪙","Tổng tiền boa",CVVH.Economy.money(s.totalTips)], ["🔥","Món bị cháy",s.totalBurntFood],
      ["💢","Đơn phục vụ sai",s.totalIncorrectOrders], ["⚡","Combo cao nhất",s.highestCombo],
      ["🏆","Lãi ngày cao nhất",CVVH.Economy.money(s.bestDailyProfit)], ["📅","Ngày cao nhất",s.highestDayReached]
    ];
    const grid = byId("stats-grid"); grid.textContent = "";
    values.forEach(function (entry) { const card = document.createElement("article"); card.className = "stat-card"; const icon = document.createElement("div"); icon.className = "stat-icon"; icon.textContent = entry[0]; const label = document.createElement("span"); label.textContent = entry[1]; const value = document.createElement("strong"); value.textContent = entry[2]; card.append(icon,label,value); grid.appendChild(card); });
    const milestones = [10,30,75,150,300,600]; const served = s.totalCustomersServed; const next = milestones.find(function (value) { return value > served; }) || Math.ceil((served + 1) / 500) * 500;
    const previous = milestones.filter(function (value) { return value <= served; }).pop() || 0;
    byId("next-milestone").textContent = "Phục vụ " + next + " khách";
    byId("milestone-bar").style.width = Math.min(100, (served - previous) / Math.max(1, next - previous) * 100) + "%";
  }

  function renderCharacterBook(save) {
    const entries = CVVH.CharacterSystem.bookEntries(save);
    const unlockedCount = entries.filter(function (entry) { return entry.unlocked; }).length;
    byId("book-progress").textContent = unlockedCount + "/" + entries.length + " nhân vật";
    const grid = byId("character-book-grid"); grid.textContent = "";
    entries.forEach(function (entry) {
      const card = document.createElement("article");
      card.className = "book-card game-panel" + (entry.unlocked ? "" : " locked");
      if (!entry.unlocked) {
        const mystery = document.createElement("div"); mystery.className = "book-mystery"; mystery.textContent = "?";
        const name = document.createElement("h2"); name.textContent = "???";
        const hint = document.createElement("p"); hint.textContent = "Tiếp tục bán để gặp nhân vật này.";
        card.append(mystery, name, hint); grid.appendChild(card); return;
      }
      const portrait = image(entry.avatar, "Chân dung " + entry.name, "book-portrait");
      const body = document.createElement("div"); body.className = "book-copy";
      const name = document.createElement("h2"); name.textContent = entry.name;
      const trait = document.createElement("span"); trait.className = "book-trait"; trait.textContent = entry.trait;
      const description = document.createElement("p"); description.textContent = entry.description;
      const stars = document.createElement("div"); stars.className = "book-stars"; stars.setAttribute("aria-label", entry.stars + " trên 5 sao quan hệ"); stars.textContent = "★".repeat(entry.stars) + "☆".repeat(5 - entry.stars);
      const stats = document.createElement("small"); stats.textContent = "Lượt ghé: " + entry.visits + " · " + CVVH.Characters.stageLabel(entry.stage);
      body.append(name, trait, description, stars, stats); card.append(portrait, body); grid.appendChild(card);
    });
  }

  function renderEnd(day, summary, unlocked) {
    byId("end-title").textContent = "Tổng kết ngày " + day;
    const profit = summary.revenue + summary.tips - summary.ingredientCosts - summary.penalties;
    const scoreTarget = 50000 + day * 12000;
    const stars = profit >= scoreTarget ? 3 : profit >= scoreTarget * .55 ? 2 : profit > 0 ? 1 : 0;
    byId("end-stars").textContent = Array.from({length:3}, function (_,i) { return i < stars ? "★" : "☆"; }).join(" ");
    const rows = [
      ["Khách đã phục vụ",summary.served], ["Khách bỏ đi",summary.lost], ["Đơn sai",summary.incorrect], ["Món cháy",summary.burnt],
      ["Doanh thu",CVVH.Economy.money(summary.revenue)], ["Giá vốn",CVVH.Economy.money(-summary.ingredientCosts)], ["Tiền boa",CVVH.Economy.money(summary.tips)], ["Phạt",CVVH.Economy.money(-summary.penalties)],
      ["Uy tín thay đổi",(summary.reputationChange >= 0 ? "+" : "") + summary.reputationChange.toFixed(1)], ["Combo tốt nhất",summary.bestCombo], ["Điểm ngày",new Intl.NumberFormat("vi-VN").format(summary.score)]
    ];
    const container = byId("end-summary"); container.textContent = "";
    rows.forEach(function (entry) { const row = document.createElement("div"); row.className = "summary-row"; const label = document.createElement("span"); label.textContent = entry[0]; const value = document.createElement("strong"); value.textContent = entry[1]; row.append(label,value); container.appendChild(row); });
    const profitLine = byId("end-profit"); profitLine.textContent = CVVH.Economy.money(profit); profitLine.parentElement.classList.toggle("loss", profit < 0);
    const unlock = byId("unlock-message"); unlock.hidden = !unlocked.length; unlock.textContent = unlocked.length ? "Mở khóa mới: " + unlocked.map(function (food) { return food.name; }).join(", ") + "!" : "";
    showScreen("end-screen");
  }

  CVVH.UI = {
    byId: byId, showScreen: showScreen, openModal: openModal, closeModal: closeModal, renderMenu: renderMenu,
    setSoundButtons: setSoundButtons, renderIngredients: renderIngredients, renderSauces: renderSauces, renderDrinks: renderDrinks,
    renderFryers: renderFryers, updateFryers: updateFryers, renderTray: renderTray, renderCustomers: renderCustomers, updateCustomers: updateCustomers, updateHUD: updateHUD,
    updateServeState: updateServeState, playCustomerDialogue: playCustomerDialogue, showUnlock: showUnlock, showKhanhAlert: showKhanhAlert,
    toast: toast, floating: floating, coinBurst: coinBurst, sparkle: sparkle,
    renderShop: renderShop, renderStats: renderStats, renderCharacterBook: renderCharacterBook, renderEnd: renderEnd
  };
})();
