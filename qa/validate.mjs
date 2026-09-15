import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const runtimeFiles = [
  "index.html", "css/main.css", "css/game.css", "css/animations.css", "css/responsive.css",
  "js/config.js", "js/characters.js", "js/character-system.js", "js/storage.js", "js/audio.js", "js/economy.js", "js/orders.js",
  "js/customers.js", "js/cooking.js", "js/upgrades.js", "js/tutorial.js", "js/story.js", "js/ui.js", "js/game.js", "js/main.js"
];

const source = Object.fromEntries(runtimeFiles.map((file) => [file, fs.readFileSync(path.join(root, file), "utf8")]));
const html = source["index.html"];

for (const file of runtimeFiles.filter((name) => name.endsWith(".js"))) {
  new vm.Script(source[file], { filename: file });
}

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(htmlIds).size, htmlIds.length, "HTML contains duplicate IDs");
const queriedIds = new Set();
for (const [file, text] of Object.entries(source)) {
  if (!file.endsWith(".js")) continue;
  for (const match of text.matchAll(/(?:byId|getElementById)\("([^"]+)"\)/g)) queriedIds.add(match[1]);
}
for (const id of queriedIds) assert.ok(htmlIds.includes(id), `Missing HTML ID queried by JavaScript: ${id}`);

const localReferences = [];
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)) localReferences.push({ from: "index.html", ref: match[1] });
for (const [file, text] of Object.entries(source)) {
  if (file.endsWith(".css")) for (const match of text.matchAll(/url\(["']?(\.\.\/[^"')]+)["']?\)/g)) localReferences.push({ from: file, ref: match[1] });
  if (file.endsWith(".js")) for (const match of text.matchAll(/["'](\.\/assets\/[^"']+)["']/g)) localReferences.push({ from: "index.html", ref: match[1] });
}
for (const item of localReferences) {
  const target = path.resolve(path.dirname(path.join(root, item.from)), item.ref);
  assert.ok(fs.existsSync(target), `Missing local asset: ${item.ref} from ${item.from}`);
}

assert.ok(!/(?:src|href)="\//.test(html), "Root-absolute URL found in HTML");
for (const breakpoint of [1100, 820, 560, 380]) assert.ok(source["css/responsive.css"].includes(`max-width: ${breakpoint}px`), `Missing responsive breakpoint ${breakpoint}px`);
assert.ok(source["css/main.css"].includes("overflow-x: hidden"), "Horizontal overflow guard is missing");
assert.ok(source["css/responsive.css"].includes("@media (min-width: 900px)"), "Desktop landscape layout is missing");
assert.ok(source["css/responsive.css"].includes("height:100dvh"), "Dynamic viewport-height sizing is missing");
assert.ok(!/<button id="serve-btn"[^>]*\sdisabled/.test(html), "Serve button must remain clickable so validation hints can be shown");
const dynamicRender = source["js/game.js"].match(/renderDynamic\(\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*renderAll/);
assert.ok(dynamicRender, "Could not inspect dynamic renderer");
assert.ok(dynamicRender[1].includes("updateFryers") && dynamicRender[1].includes("updateCustomers"), "Dynamic renderer does not use in-place updates");
assert.ok(!dynamicRender[1].includes("renderFryers") && !dynamicRender[1].includes("renderCustomers"), "Dynamic renderer rebuilds animated artwork and may flicker");
const serveState = source["js/ui.js"].match(/function updateServeState\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
assert.ok(serveState && serveState[1].includes("button.disabled = !enabled"), "Serve button is incorrectly locked when an order step is incomplete");
const unfinishedMarker = new RegExp("\\b(?:TO" + "DO|FIX" + "ME|implement " + "later)\\b", "i");
for (const [file, text] of Object.entries(source)) assert.ok(!unfinishedMarker.test(text), `Unfinished marker in ${file}`);

const memoryStorage = new Map();
const sandbox = {
  window: {},
  console,
  localStorage: {
    getItem(key) { return memoryStorage.has(key) ? memoryStorage.get(key) : null; },
    setItem(key, value) { memoryStorage.set(key, String(value)); },
    removeItem(key) { memoryStorage.delete(key); }
  },
  Intl, Set, Map, Math, Number, Object, Array, String, Boolean, Date, JSON,
  performance: { now: () => 1000 },
  document: { querySelector: () => null, querySelectorAll: () => [] }
};
sandbox.window.window = sandbox.window;
sandbox.window.requestAnimationFrame = () => 1;
sandbox.window.cancelAnimationFrame = () => {};
vm.createContext(sandbox);
for (const file of ["js/config.js","js/characters.js","js/character-system.js","js/storage.js","js/economy.js","js/orders.js","js/customers.js","js/cooking.js","js/upgrades.js"]) {
  vm.runInContext(source[file], sandbox, { filename: file });
}
const G = sandbox.window.CVVH;

assert.equal(G.Characters.all.length, 23, "Updated recurring cast count is incorrect");
for (const removed of ["tram","my","gia-huy","co-thao","thay-phong","thay-khoi"]) assert.equal(G.Characters.getById(removed), undefined, `Removed character still active: ${removed}`);
for (const character of G.Characters.all) assert.ok(character.dialogue.normal.length >= 15, `${character.name} needs at least 15 normal lines`);
assert.equal(G.CharacterSystem.knows("quy", "trang"), true, "Quý must know best friend Trang");
assert.equal(G.CharacterSystem.knows("quy", "tran"), true, "Quý must know best friend Trân");
assert.equal(G.CharacterSystem.knows("quy", "vu"), false, "Quý must not know Vũ by default");
assert.ok(G.Characters.getById("nhan").ageRole.includes("Hong Kong"), "Nhân must be an exchange student from Hong Kong");
assert.ok(G.Characters.getById("duong").ageRole.includes("Công nghệ thông tin"), "Dương must study IT");
assert.ok(G.Characters.getById("nhan").ageRole.startsWith("Nữ"), "Nhân must be presented as female");
assert.ok(G.Characters.getById("thuy").ageRole.startsWith("Nam"), "Thủy must be presented as male");
assert.ok(G.Characters.getById("thuy").runningJoke.includes("chị Thảo"), "Thủy's obvious affection for Thảo is missing");
assert.ok(G.Characters.getById("khanh").portionSizeWeight === "high", "Khánh must favor large randomized portions");
assert.equal(G.Config.FOODS.length, 16, "Expanded fried-food menu is incomplete");
assert.equal(G.Config.DRINKS.length, 5, "Drink station must have four teas plus no-drink");
for (const id of ["tra-chanh","tra-dao","tra-tac","tra-vai"]) assert.ok(G.Config.drinkById(id), `Missing drink ${id}`);
assert.ok(source["js/character-system.js"].includes("Ngon cỡ Poseidon."), "Khánh's Poseidon reaction is missing");
assert.ok(source["css/main.css"].includes('"Noto Sans"') && source["css/main.css"].includes('"DejaVu Sans"'), "Vietnamese-safe fallback stack is missing");
assert.ok(html.includes("KHÁNH BÉO ĐANG ĐỔ BỘ"), "Khánh warning overlay is missing");

const defaults = G.Storage.createDefaultSave();
assert.equal(defaults.money, 300000, "Starting capital must be 300,000 VND");
assert.equal(defaults.saveVersion, 3, "Save schema version 3 is missing");
assert.equal(G.Storage.save(defaults), true, "Save write failed");
assert.equal(G.Storage.load().save.money, 300000, "Saved progress did not reload");
G.Storage.reset();
assert.equal(memoryStorage.has(G.Config.SAVE_KEY), false, "Reset did not remove saved progress");
memoryStorage.set(G.Config.SAVE_KEY, "{not valid json");
assert.equal(G.Storage.load().save.currentDay, 1, "Invalid save was not recovered");
const migrated = G.Storage.sanitize({ version:1, currentDay:5, money:125000, reputation:70, relationships:{ vu:7 }, story:{ introSeen:true, seenScenes:["intro"], dialogueSeen:{} } });
assert.equal(migrated.saveVersion, 3, "Old save was not migrated to schema 3");
assert.equal(migrated.money, 125000, "Migration lost existing money");
assert.ok(migrated.unlockedCharacters.includes("han"), "Migration did not preserve appropriate character progress");

const unlockSave = G.Storage.createDefaultSave();
unlockSave.stats.totalCustomersServed = 3;
let unlocked = G.CharacterSystem.updateUnlocks(unlockSave, 2, 64);
assert.ok(unlocked.includes("duong"), "Dương unlock condition failed");
unlockSave.story.flags.vuAskedAboutHan = 2;
unlocked = G.CharacterSystem.updateUnlocks(unlockSave, 4, 66);
assert.ok(unlocked.includes("han"), "Hân unlock after Vũ's story failed");
assert.ok(unlocked.includes("tho"), "Thơ reputation/day unlock failed");
const unlockedRoundTrip = G.Storage.sanitize(unlockSave);
assert.ok(unlockedRoundTrip.unlockedCharacters.includes("duong") && unlockedRoundTrip.unlockedCharacters.includes("han") && unlockedRoundTrip.unlockedCharacters.includes("tho"), "Character unlocks did not persist");
assert.equal(unlockedRoundTrip.story.flags.vuAskedAboutHan, 2, "Story flags did not persist");

let randomSeed = 24681357;
function seededRandom() { randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0; return randomSeed / 4294967296; }
const simulationSave = G.Storage.createDefaultSave();
simulationSave.unlockedCharacters = G.Characters.all.map(function (character) { return character.id; });
const allFoods = G.Config.FOODS.slice();
for (const character of G.Characters.all) {
  const signatures = new Set(); const foods = new Set(); const sauces = new Set(); const sizes = new Set();
  for (let visit = 0; visit < 20; visit += 1) {
    const order = G.CharacterSystem.generateOrder(simulationSave, character, 10, allFoods, 8, seededRandom, false);
    signatures.add(G.CharacterSystem.orderSignature(order)); order.items.forEach(function (id) { foods.add(id); }); sauces.add(order.sauce); sizes.add(order.items.length);
    G.CharacterSystem.recordOrder(simulationSave, character.id, order);
  }
  assert.ok(signatures.size >= 5, `${character.name} orders repeat too much`);
  assert.ok(foods.size >= 3, `${character.name} food choices are not random enough`);
  assert.ok(sauces.size >= 2, `${character.name} sauce appears permanent`);
  if (character.id === "khanh") assert.ok(sizes.size >= 2 && Math.min(...sizes) >= 3, "Khánh's large randomized portion logic failed");
  assert.ok(simulationSave.recentOrders[character.id].length <= 5, `${character.name} recent-order history exceeded five entries`);
}

const dialogueSave = G.Storage.createDefaultSave();
const hanDialogue = G.CharacterSystem.preOrderDialogue(dialogueSave, G.Characters.getById("han"), { id:"normal" });
assert.ok(hanDialogue.length >= 1 && !hanDialogue.map(function (item) { return item.text; }).join(" ").includes("Vũ"), "Hân lacks independent dialogue");
const thuyDialogue = G.CharacterSystem.preOrderDialogue(dialogueSave, G.Characters.getById("thuy"), { id:"normal" });
assert.ok(thuyDialogue.length >= 2, "Pre-order dialogue needs a customer and Thảo exchange");

assert.equal(G.Orders.matches({ items:["ca-vien","bo-vien","ca-vien"], sauce:"tuong-ot", drink:"tra-chanh" }, ["bo-vien","ca-vien","ca-vien"], "tuong-ot", "tra-chanh"), true, "Correct order rejected");
assert.equal(G.Orders.matches({ items:["ca-vien"], sauce:"tuong-ot", drink:"tra-dao" }, ["ca-vien"], "tuong-ca", "tra-dao"), false, "Wrong sauce accepted");
assert.equal(G.Orders.matches({ items:["ca-vien"], sauce:"tuong-ot", drink:"tra-tac" }, ["ca-vien"], "tuong-ot", "none"), false, "Wrong drink accepted");
assert.equal(G.Orders.matches({ items:["ca-vien"], sauce:"tuong-ot", drink:"none" }, ["bo-vien"], "tuong-ot", "none"), false, "Wrong food accepted");

let readyEvents = 0;
let burntEvents = 0;
const fryer = new G.Cooking.FryerManager(3, { cookTimeScale:1, readyTimeScale:1 }, { ready(){ readyEvents += 1; }, burnt(){ burntEvents += 1; } });
assert.ok(fryer.addFood("ca-vien"), "Could not add food to empty fryer");
fryer.update(G.Config.BALANCE.rawStageMs + 1);
assert.equal(fryer.slots[0].state, "cooking", "RAW did not advance to COOKING");
fryer.update(G.Config.foodById("ca-vien").cookTime + 1);
assert.equal(fryer.slots[0].state, "ready", "COOKING did not advance to READY");
assert.equal(readyEvents, 1, "Ready callback did not fire exactly once");
fryer.update(G.Config.foodById("ca-vien").burnTime + 1);
assert.equal(fryer.slots[0].state, "burnt", "READY did not advance to BURNT");
assert.equal(burntEvents, 1, "Burnt callback did not fire exactly once");
assert.equal(fryer.discardBurnt(0), true, "Burnt food could not be discarded");

const richSave = G.Storage.createDefaultSave();
const capacityBefore = G.Upgrades.modifiers(richSave.upgrades).fryerCapacity;
const purchase = G.Upgrades.buy(richSave, "fryerCapacity");
assert.equal(purchase.ok, true, "Affordable upgrade failed");
assert.equal(G.Upgrades.modifiers(richSave.upgrades).fryerCapacity, capacityBefore + 1, "Upgrade effect did not apply");
const poorSave = G.Storage.createDefaultSave(); poorSave.money = 0;
assert.equal(G.Upgrades.buy(poorSave, "fasterFryer").reason, "money", "Insufficient funds were not rejected");
const maxSave = G.Storage.createDefaultSave(); maxSave.upgrades.fryerCapacity = 3;
assert.equal(G.Upgrades.buy(maxSave, "fryerCapacity").reason, "max", "Maximum level was not enforced");

const fakeElements = new Map();
function fakeElement(id) {
  if (!fakeElements.has(id)) fakeElements.set(id, { id, hidden:true, disabled:false, textContent:"", addEventListener(){}, focus(){}, classList:{ add(){}, remove(){}, toggle(){} } });
  return fakeElements.get(id);
}
let endRendered = false;
const dialogueHistory = [];
let pendingFirstDialogue = null;
let delayFirstPreOrder = true;
G.UI = {
  byId: fakeElement, showScreen(){}, renderIngredients(){}, renderSauces(){}, renderDrinks(){}, renderFryers(){}, updateFryers(){}, renderTray(){}, renderCustomers(){}, updateCustomers(){},
  updateHUD(){}, updateServeState(){}, toast(){}, floating(){}, coinBurst(){}, showUnlock(details, done){ done(); },
  showKhanhAlert(done){ done(); },
  playCustomerDialogue(lines, options, done){
    dialogueHistory.push({ lines, options });
    if (delayFirstPreOrder && options.phase === "Trước khi gọi món") { delayFirstPreOrder = false; pendingFirstDialogue = done; }
    else done();
  }, renderEnd(){ endRendered = true; }
};
G.Audio = { play(){} };
G.TutorialManager = class { constructor(done){ this.done = done; this.active = false; } start(){ this.active = true; } notify(){} refreshHighlight(){} complete(){ this.active = false; this.done(true); } };
vm.runInContext(source["js/story.js"], sandbox, { filename:"js/story.js" });
G.Story.StoryManager = class { show(scene, done){ done(scene); } };
vm.runInContext(source["js/game.js"], sandbox, { filename:"js/game.js" });

const integrationSave = G.Storage.createDefaultSave();
integrationSave.tutorialCompleted = true;
integrationSave.story.introSeen = true;
integrationSave.story.seenScenes.push("intro");
const game = new G.Game(integrationSave, {});
game.start(1);
assert.equal(game.active, true, "Game did not start");
assert.equal(game.dailyTarget, 4, "Day 1 customer target should be four");
assert.ok(game.customers.length >= 1, "Customer did not spawn at start");
assert.equal(game.maxCustomers(), 1, "More than one active customer is allowed");
assert.equal(game.customers[0].orderRevealed, false, "Order appeared before pre-order dialogue completed");
assert.equal(game.conversationActive, true, "Gameplay did not pause during pre-order dialogue");
assert.equal(dialogueHistory[0].options.phase, "Trước khi gọi món", "Pre-order dialogue did not run before gameplay");
pendingFirstDialogue();
assert.equal(game.customers[0].orderRevealed, true, "Order was not revealed after pre-order dialogue completed");
assert.equal(game.addIngredient("ca-vien", fakeElement("source")), undefined, "Ingredient action threw unexpectedly");
assert.equal(game.summary.ingredientCosts, G.Config.foodById("ca-vien").cost, "Ingredient cost was not tracked");
const activeSlot = game.fryer.slots.find((slot) => slot.foodId === "ca-vien");
activeSlot.state = "ready";
game.useFryer(activeSlot.index, fakeElement("fryer"));
assert.deepEqual(Array.from(game.tray), ["ca-vien"], "Ready food did not move to tray");

const firstCustomer = game.customers[0];
firstCustomer.characterId = "nhan";
firstCustomer.character = G.Characters.getById("nhan");
firstCustomer.order = { items:["ca-vien"], sauce:"tuong-ot", drink:"none" };
game.selectedCustomerId = firstCustomer.id;
game.selectedSauce = "tuong-ot";
game.selectedDrink = "none";
game.serve();
assert.equal(game.summary.served, 1, "Correct order was not recorded");
assert.ok(game.summary.revenue > 0, "Correct order earned no revenue");
assert.equal(game.combo, 1, "Correct order did not increase combo");
assert.ok(dialogueHistory.some(function (entry) { return entry.options.phase === "Phản hồi"; }), "Correct-service reaction did not appear");

game.customers[0].removeAt = 999;
game.update(1);
game.spawnCustomer(false);
assert.equal(game.customers.length, 1, "A new customer appeared before the previous customer left");
const wrongCustomer = game.customers.find((customer) => !customer.removeAt);
wrongCustomer.order = { items:["bo-vien"], sauce:"tuong-ca", drink:"tra-chanh" };
game.selectedCustomerId = wrongCustomer.id;
game.tray = ["ca-vien"];
game.selectedSauce = "tuong-ot";
game.selectedDrink = "none";
game.serve();
assert.equal(game.summary.incorrect, 1, "Wrong order was not recorded");
assert.equal(game.combo, 0, "Wrong order did not break combo");
assert.ok(dialogueHistory.some(function (entry) { return entry.options.phase === "Đơn chưa đúng"; }), "Wrong-order reaction did not appear");

wrongCustomer.remainingPatience = .01;
wrongCustomer.status = "waiting";
game.update(100);
assert.equal(game.summary.lost, 1, "Expired customer patience was not recorded");

game.pause(); assert.equal(game.paused, true, "Pause failed");
game.resume(); assert.equal(game.paused, false, "Resume failed");
game.customers = [];
game.resolvedCustomers = game.dailyTarget;
game.update(1);
assert.equal(endRendered, true, "End-of-day screen was not rendered");
assert.equal(integrationSave.currentDay, 2, "Day progression failed");
assert.equal(G.Storage.load().save.currentDay, 2, "Completed day did not persist");
assert.equal(integrationSave.stats.totalCustomersServed, 1, "Statistics did not record served customers");
assert.equal(integrationSave.stats.totalIncorrectOrders, 1, "Statistics did not record incorrect orders");
assert.equal(integrationSave.stats.totalCustomersLost, 1, "Statistics did not record lost customers");

const progressionSave = G.Storage.createDefaultSave();
progressionSave.tutorialCompleted = true;
progressionSave.story.introSeen = true;
progressionSave.story.seenScenes = ["intro","chapter2","chapter3","rival","foodRush","exam-scene","cooperation","graduation"];
const lateGame = new G.Game(progressionSave, {});
lateGame.start(12);
assert.ok(lateGame.dailyTarget > game.dailyTarget && lateGame.dailyTarget <= G.Config.BALANCE.dailyCustomerMax, "Daily customer target does not scale gradually");

console.log(`QA passed: ${runtimeFiles.length} runtime files, ${localReferences.length} local references, ${G.Characters.all.length} recurring characters.`);
