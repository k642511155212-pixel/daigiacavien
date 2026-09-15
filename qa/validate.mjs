import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const runtimeFiles = [
  "index.html", "css/main.css", "css/game.css", "css/animations.css", "css/responsive.css",
  "js/config.js", "js/characters.js", "js/storage.js", "js/audio.js", "js/economy.js", "js/orders.js",
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
for (const file of ["js/config.js","js/characters.js","js/storage.js","js/economy.js","js/orders.js","js/customers.js","js/cooking.js","js/upgrades.js"]) {
  vm.runInContext(source[file], sandbox, { filename: file });
}
const G = sandbox.window.CVVH;

assert.ok(G.Characters.all.length >= 20, "Fewer than 20 recurring characters");
for (const character of G.Characters.all) assert.ok(character.dialogue.normal.length >= 15, `${character.name} needs at least 15 normal lines`);

const defaults = G.Storage.createDefaultSave();
assert.equal(defaults.money, 300000, "Starting capital must be 300,000 VND");
assert.equal(G.Storage.save(defaults), true, "Save write failed");
assert.equal(G.Storage.load().save.money, 300000, "Saved progress did not reload");
G.Storage.reset();
assert.equal(memoryStorage.has(G.Config.SAVE_KEY), false, "Reset did not remove saved progress");
memoryStorage.set(G.Config.SAVE_KEY, "{not valid json");
assert.equal(G.Storage.load().save.currentDay, 1, "Invalid save was not recovered");

assert.equal(G.Orders.matches({ items:["ca-vien","bo-vien","ca-vien"], sauce:"tuong-ot" }, ["bo-vien","ca-vien","ca-vien"], "tuong-ot"), true, "Correct order rejected");
assert.equal(G.Orders.matches({ items:["ca-vien"], sauce:"tuong-ot" }, ["ca-vien"], "tuong-ca"), false, "Wrong sauce accepted");
assert.equal(G.Orders.matches({ items:["ca-vien"], sauce:"tuong-ot" }, ["bo-vien"], "tuong-ot"), false, "Wrong food accepted");

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
G.UI = {
  byId: fakeElement, showScreen(){}, renderIngredients(){}, renderSauces(){}, renderFryers(){}, renderTray(){}, renderCustomers(){},
  updateHUD(){}, updateServeState(){}, toast(){}, floating(){}, coinBurst(){}, renderEnd(){ endRendered = true; }
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
assert.ok(game.customers.length >= 1, "Customer did not spawn at start");
assert.equal(game.addIngredient("ca-vien", fakeElement("source")), undefined, "Ingredient action threw unexpectedly");
assert.equal(game.summary.ingredientCosts, G.Config.foodById("ca-vien").cost, "Ingredient cost was not tracked");
const activeSlot = game.fryer.slots.find((slot) => slot.foodId === "ca-vien");
activeSlot.state = "ready";
game.useFryer(activeSlot.index, fakeElement("fryer"));
assert.deepEqual(Array.from(game.tray), ["ca-vien"], "Ready food did not move to tray");

const firstCustomer = game.customers[0];
firstCustomer.characterId = "nhan";
firstCustomer.character = G.Characters.getById("nhan");
firstCustomer.order = { items:["ca-vien"], sauce:"tuong-ot" };
game.selectedCustomerId = firstCustomer.id;
game.selectedSauce = "tuong-ot";
game.serve();
assert.equal(game.summary.served, 1, "Correct order was not recorded");
assert.ok(game.summary.revenue > 0, "Correct order earned no revenue");
assert.equal(game.combo, 1, "Correct order did not increase combo");

game.spawnCustomer(false);
const wrongCustomer = game.customers.find((customer) => !customer.removeAt);
wrongCustomer.order = { items:["bo-vien"], sauce:"tuong-ca" };
game.selectedCustomerId = wrongCustomer.id;
game.tray = ["ca-vien"];
game.selectedSauce = "tuong-ot";
game.serve();
assert.equal(game.summary.incorrect, 1, "Wrong order was not recorded");
assert.equal(game.combo, 0, "Wrong order did not break combo");

wrongCustomer.remainingPatience = .01;
wrongCustomer.status = "waiting";
game.update(100);
assert.equal(game.summary.lost, 1, "Expired customer patience was not recorded");

game.pause(); assert.equal(game.paused, true, "Pause failed");
game.resume(); assert.equal(game.paused, false, "Resume failed");
game.remainingTime = 0;
game.update(1);
assert.equal(endRendered, true, "End-of-day screen was not rendered");
assert.equal(integrationSave.currentDay, 2, "Day progression failed");
assert.equal(G.Storage.load().save.currentDay, 2, "Completed day did not persist");
assert.equal(integrationSave.stats.totalCustomersServed, 1, "Statistics did not record served customers");
assert.equal(integrationSave.stats.totalIncorrectOrders, 1, "Statistics did not record incorrect orders");
assert.equal(integrationSave.stats.totalCustomersLost, 1, "Statistics did not record lost customers");

console.log(`QA passed: ${runtimeFiles.length} runtime files, ${localReferences.length} local references, ${G.Characters.all.length} recurring characters.`);
