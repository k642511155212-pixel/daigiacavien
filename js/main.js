(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};
  const loaded = CVVH.Storage.load();
  let save = loaded.save;
  CVVH.Audio.setEnabled(save.soundEnabled);

  const game = new CVVH.Game(save, {
    menu: showMenu,
    saved: function () { CVVH.UI.renderMenu(save); }
  });

  function showMenu() {
    CVVH.UI.renderMenu(save);
    CVVH.UI.showScreen("menu-screen");
  }

  function startGame() { CVVH.Audio.play("click"); game.start(save.currentDay); }

  function toggleSound() {
    save.soundEnabled = !save.soundEnabled;
    CVVH.Audio.setEnabled(save.soundEnabled);
    CVVH.Storage.save(save);
    CVVH.UI.setSoundButtons(save.soundEnabled);
    if (save.soundEnabled) CVVH.Audio.play("click");
  }

  function purchaseUpgrade(upgradeId, card) {
    const result = CVVH.Upgrades.buy(save, upgradeId);
    if (!result.ok) {
      if (result.reason === "money") CVVH.UI.toast("Chưa đủ tiền. Cần " + CVVH.Economy.money(result.cost) + ".", "error");
      else CVVH.UI.toast("Nâng cấp này đã đạt cấp tối đa.", "info");
      CVVH.Audio.play("error"); return;
    }
    CVVH.Storage.save(save); CVVH.Audio.play("upgrade"); CVVH.UI.sparkle(card);
    CVVH.UI.toast(result.upgrade.name + " đã lên cấp " + result.level + "!", "success");
    CVVH.UI.renderShop(save, purchaseUpgrade); CVVH.UI.renderMenu(save);
  }

  function openShop() {
    CVVH.Audio.play("click"); CVVH.UI.renderShop(save, purchaseUpgrade); CVVH.UI.showScreen("shop-screen");
  }

  CVVH.UI.byId("play-btn").addEventListener("click", startGame);
  CVVH.UI.byId("continue-btn").addEventListener("click", startGame);
  CVVH.UI.byId("how-btn").addEventListener("click", function () { CVVH.Audio.play("click"); CVVH.UI.openModal("how-modal"); });
  CVVH.UI.byId("shop-btn").addEventListener("click", openShop);
  CVVH.UI.byId("stats-btn").addEventListener("click", function () { CVVH.Audio.play("click"); CVVH.UI.renderStats(save); CVVH.UI.showScreen("stats-screen"); });
  CVVH.UI.byId("sound-btn").addEventListener("click", toggleSound);
  CVVH.UI.byId("game-sound-btn").addEventListener("click", toggleSound);
  CVVH.UI.byId("reset-btn").addEventListener("click", function () { CVVH.UI.openModal("confirm-modal"); });
  CVVH.UI.byId("confirm-reset-btn").addEventListener("click", function () {
    game.stopLoop(); save = CVVH.Storage.reset(); game.save = save; CVVH.Audio.setEnabled(save.soundEnabled);
    CVVH.UI.closeModal("confirm-modal"); showMenu(); CVVH.UI.toast("Tiến trình đã được xóa.", "info");
  });
  document.querySelectorAll("[data-close-modal]").forEach(function (button) { button.addEventListener("click", function () { CVVH.UI.closeModal(button.dataset.closeModal); }); });
  document.querySelectorAll("[data-back-menu]").forEach(function (button) { button.addEventListener("click", showMenu); });
  CVVH.UI.byId("next-day-btn").addEventListener("click", startGame);
  CVVH.UI.byId("end-shop-btn").addEventListener("click", openShop);
  CVVH.UI.byId("end-menu-btn").addEventListener("click", showMenu);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (!CVVH.UI.byId("story-modal").hidden) return;
      if (!CVVH.UI.byId("how-modal").hidden) CVVH.UI.closeModal("how-modal");
      else if (!CVVH.UI.byId("confirm-modal").hidden) CVVH.UI.closeModal("confirm-modal");
      else if (game.active) game.paused ? game.resume() : game.pause();
    }
    if (event.code === "Space" && game.active && !game.paused && document.activeElement === document.body) { event.preventDefault(); game.serve(); }
  });
  document.addEventListener("visibilitychange", function () { if (document.hidden) game.autoPause(); });

  function registerWebMCP() {
    const context = document.modelContext;
    if (!context || typeof context.registerTool !== "function") return;
    const safeRegister = function (tool) {
      try { void Promise.resolve(context.registerTool(tool)).catch(function () {}); } catch (error) { /* Optional browser capability. */ }
    };
    try {
      safeRegister({
        name: "get_stall_status", title: "Xem trạng thái quầy", description: "Đọc trạng thái hiện tại của game Cá Viên Vỉa Hè.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: function () { return game.getStatus(); }
      });
      safeRegister({
        name: "start_stall_day", title: "Bắt đầu ngày bán", description: "Bắt đầu ngày hiện tại từ màn menu.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute: function () { if (!game.active) startGame(); return game.getStatus(); }
      });
    } catch (error) { /* Unsupported or partial implementations must never affect gameplay. */ }
  }

  CVVH.UI.renderMenu(save);
  CVVH.UI.showScreen("menu-screen");
  registerWebMCP();
  window.setTimeout(function () { CVVH.UI.byId("loading-screen").classList.add("done"); }, 850);
  window.CVVHGame = game;
})();
