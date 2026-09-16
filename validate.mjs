import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const runtimeFiles = [
  "index.html","css/main.css","css/game.css","css/animations.css","css/responsive.css",
  "js/config.js","js/characters.js","js/character-system.js","js/storage.js","js/audio.js","js/economy.js",
  "js/orders.js","js/customers.js","js/cooking.js","js/upgrades.js","js/tutorial.js","js/story.js","js/ui.js","js/game.js","js/main.js"
];
const source = Object.fromEntries(runtimeFiles.map(function (file) { return [file,fs.readFileSync(path.join(root,file),"utf8")]; }));
const html = source["index.html"];

for (const file of runtimeFiles.filter(function (name) { return name.endsWith(".js"); })) new vm.Script(source[file],{ filename:file });

const htmlIds = [...html.matchAll(/\bid="([^"]+)"/g)].map(function (match) { return match[1]; });
assert.equal(new Set(htmlIds).size,htmlIds.length,"HTML contains duplicate IDs");
const queriedIds = new Set();
for (const [file,text] of Object.entries(source)) {
  if (!file.endsWith(".js")) continue;
  for (const match of text.matchAll(/(?:byId|getElementById)\("([^"]+)"\)/g)) queriedIds.add(match[1]);
  for (const match of text.matchAll(/querySelector(?:All)?\("#([a-z][a-z0-9-]*)"\)/gi)) queriedIds.add(match[1]);
  for (const match of text.matchAll(/target:\s*"#([a-z][a-z0-9-]*)"/gi)) queriedIds.add(match[1]);
}
for (const id of queriedIds) assert.ok(htmlIds.includes(id),"Missing HTML ID queried by JavaScript: " + id);
for (const file of ["css/main.css","css/game.css","css/animations.css","css/responsive.css"]) {
  for (const block of source[file].matchAll(/([^{}]+)\{/g)) {
    const selector = block[1].trim();
    if (selector.startsWith("@")) continue;
    for (const match of selector.matchAll(/#([a-z][a-z0-9-]*)/gi)) {
      assert.ok(htmlIds.includes(match[1]),"CSS selector targets missing HTML ID: #" + match[1] + " in " + file);
    }
  }
}

const localReferences = [];
for (const match of html.matchAll(/(?:src|href)="(\.\/[^"#?]+)"/g)) localReferences.push({ from:"index.html",ref:match[1] });
for (const [file,text] of Object.entries(source)) {
  if (file.endsWith(".css")) for (const match of text.matchAll(/url\(["']?(\.\.\/[^"')]+)["']?\)/g)) localReferences.push({ from:file,ref:match[1] });
  if (file.endsWith(".js")) for (const match of text.matchAll(/["'](\.\/assets\/[^"']+)["']/g)) localReferences.push({ from:"index.html",ref:match[1] });
}
for (const item of localReferences) {
  const target = path.resolve(path.dirname(path.join(root,item.from)),item.ref);
  assert.ok(fs.existsSync(target),"Missing local asset: " + item.ref + " from " + item.from);
}
assert.ok(!/(?:src|href)="\//.test(html),"Root-absolute URL found in HTML");
for (const breakpoint of [1100,820,560,380]) assert.ok(source["css/responsive.css"].includes("max-width: " + breakpoint + "px"),"Missing breakpoint " + breakpoint);
assert.ok(source["css/main.css"].includes("overflow-x: hidden"),"Horizontal overflow guard is missing");
assert.ok(source["css/responsive.css"].includes("height:100dvh"),"Desktop dynamic viewport sizing is missing");
assert.ok(source["css/responsive.css"].includes("grid-template-rows:minmax(176px,34%) minmax(0,66%)"),"Desktop customer/counter proportion regressed");
assert.ok(source["css/responsive.css"].includes('grid-template-areas:"drink sauce trash" "tray tray trash"'),"Desktop serving controls are no longer in the dense two-row layout");
assert.ok(source["css/responsive.css"].includes(".game-screen.active { min-height:100dvh; height:auto; overflow:visible; }"),"Tablet/mobile scrolling fallback is missing");
assert.ok(source["css/responsive.css"].includes(".customer-card .order-bubble") && source["css/responsive.css"].includes("right:0;"),"Order bubble no longer sits beside the customer portrait");
assert.ok(!/<button id="serve-btn"[^>]*\sdisabled/.test(html),"Serve must remain clickable for validation hints");

const dynamicRender = source["js/game.js"].match(/renderDynamic\(\)\s*\{([\s\S]*?)\n\s*\}\n\n\s*renderAll/);
assert.ok(dynamicRender && dynamicRender[1].includes("updateFryers") && dynamicRender[1].includes("updateCustomers") && dynamicRender[1].includes("updatePrepStations"),"Dynamic renderer must update artwork in place");
assert.ok(!dynamicRender[1].includes("renderFryers") && !dynamicRender[1].includes("renderCustomers"),"Animation loop rebuilds art and may flicker");
const serveState = source["js/ui.js"].match(/function updateServeState\([^)]*\)\s*\{([\s\S]*?)\n\s*\}/);
assert.ok(serveState && serveState[1].includes("button.disabled = !enabled"),"Serve button is locked before validation");
assert.ok(source["css/main.css"].includes("@font-face") && source["css/main.css"].includes("DejaVuSans.ttf") && source["css/main.css"].includes("font-display:swap"),"Local Vietnamese-safe font setup is missing");
assert.ok(html.includes("BUILD: 2026.09-CLEAN-CHARACTER-UPDATE") && source["js/config.js"].includes("GAME_VERSION"),"Build marker is missing");

const memoryStorage = new Map();
const sandbox = {
  window:{},console:console,
  localStorage:{ getItem:function (key) { return memoryStorage.has(key) ? memoryStorage.get(key) : null; },setItem:function (key,value) { memoryStorage.set(key,String(value)); },removeItem:function (key) { memoryStorage.delete(key); } },
  Intl:Intl,Set:Set,Map:Map,Math:Math,Number:Number,Object:Object,Array:Array,String:String,Boolean:Boolean,Date:Date,JSON:JSON,
  performance:{ now:function () { return 1000; } },
  document:{ querySelector:function () { return null; },querySelectorAll:function () { return []; } }
};
sandbox.window.window = sandbox.window;
sandbox.window.requestAnimationFrame = function () { return 1; };
sandbox.window.cancelAnimationFrame = function () {};
vm.createContext(sandbox);
for (const file of ["js/config.js","js/characters.js","js/character-system.js","js/storage.js","js/economy.js","js/orders.js","js/customers.js","js/cooking.js","js/upgrades.js"]) vm.runInContext(source[file],sandbox,{ filename:file });
const G = sandbox.window.CVVH;

const removedIds = ["tr"+"am","m"+"y","gia"+"-huy","co"+"-mai","co"+"-thao","thay"+"-khoi"];
for (const id of removedIds) {
  assert.equal(G.Characters.getById(id),undefined,"Deprecated character still registered: " + id);
  assert.equal(fs.existsSync(path.join(root,"assets","characters",id + ".svg")),false,"Deprecated asset still exists: " + id);
}
assert.equal(G.Characters.all.length,27,"Canonical recurring registry count changed unexpectedly");
assert.equal(G.CharacterSystem.bookEntries(G.Storage.createDefaultSave()).length,G.Characters.all.length + 1,"Character Book count is not dynamic");
for (const id of ["thay-tung","thay-phong","co-linh"]) assert.ok(G.Characters.getById(id),"Intended teacher missing: " + id);
const teachers = G.Characters.all.filter(function (character) { return character.ageRole.includes("Giáo viên"); }).map(function (character) { return character.id; }).sort();
assert.deepEqual(Array.from(teachers),["co-linh","thay-phong","thay-tung"],"Normal teacher roster contains unintended entries");

for (const id of ["phuoc-nguyen","anh-quan","thien-an","hoang-linh","an"]) assert.ok(G.Characters.getById(id),"New character missing: " + id);
assert.equal(G.CharacterSystem.knows("phuoc-nguyen","anh-quan"),true,"Phước Nguyên must know Anh Quân");
assert.equal(G.CharacterSystem.knows("anh-quan","phuoc-nguyen"),true,"Anh Quân must know Phước Nguyên");
assert.equal(G.CharacterSystem.knows("quy","vu"),false,"Quý must not know Vũ by default");
assert.equal(G.Characters.getById("an").gender,"male","An must be male");
assert.ok(G.Characters.getById("an").ageRole.includes("bóng rổ") && G.Characters.getById("an").ageRole.includes("tóc xoăn"),"An's basketball canon is missing");
assert.equal(G.Characters.getById("nhan").gender,"female","Nhân must be female");
assert.ok(G.Characters.getById("nhan").ageRole.includes("Hong Kong"),"Nhân must be from Hong Kong");
assert.equal(G.Characters.getById("thuy").gender,"male","Thủy must be male");
assert.ok(G.Characters.getById("thuy").ageRole.includes("IT") && G.Characters.getById("thuy").relations.includes("duong"),"Thủy must be Dương's IT classmate");
assert.ok(G.Characters.getById("thuy").runningJoke.includes("thích chị Thảo"),"Thủy's crush is missing");
assert.ok(G.Characters.getById("duong").ageRole.includes("Công nghệ thông tin"),"Dương's IT canon is missing");
assert.ok(G.Characters.mascot.isMascot && G.Characters.mascot.id === "homi","Homi mascot is missing");
const mascotProbe = G.Storage.createDefaultSave(); mascotProbe.unlockedCharacters.push("homi");
assert.ok(!G.CharacterSystem.eligible(mascotProbe,20,"normal").some(function (character) { return character.id === "homi"; }),"Homi entered customer pool");

const expectedPortraits = G.Characters.all.map(function (character) { return character.avatar; }).concat(G.Characters.genericVariants.map(function (character) { return character.avatar; }),[G.Characters.mascot.avatar]);
for (const ref of expectedPortraits) {
  const text = fs.readFileSync(path.join(root,ref.replace(/^\.\//,"")),"utf8");
  assert.ok(text.includes('viewBox="0 0 160 160"') && text.includes('shape-rendering="crispEdges"'),"Portrait outside shared pixel system: " + ref);
}
const classicFoodIds = new Set(["ca-vien","bo-vien","xuc-xich"]);
for (const food of G.Config.FOODS) {
  const text = fs.readFileSync(path.join(root,food.image.replace(/^\.\//,"")),"utf8");
  if (classicFoodIds.has(food.id)) {
    assert.ok(text.includes('viewBox="0 0 100 80"') && !text.includes('fill="#fff0b8"'),"Classic core food art was overwritten: " + food.id);
  } else {
    assert.ok(text.includes('viewBox="0 0 128 128"') && text.includes('shape-rendering="crispEdges"'),"Food art inconsistent: " + food.id);
  }
}

assert.equal(G.Config.FOODS.length,8,"Controlled menu should contain eight foods");
assert.equal(G.Config.DRINKS.length,5,"Four teas plus no-drink are required");
for (const id of ["tra-chanh","tra-dao","tra-tac","tra-vai"]) assert.ok(G.Config.drinkById(id),"Missing drink: " + id);
const newProductCounts = new Map();
G.Config.FOODS.filter(function (item) { return item.unlockDay > 1; }).concat(G.Config.DRINKS.filter(function (item) { return item.id !== "none"; })).forEach(function (item) {
  newProductCounts.set(item.unlockSegment,(newProductCounts.get(item.unlockSegment) || 0) + 1);
});
for (const [segment,count] of newProductCounts) assert.ok(count <= 2,"Story segment " + segment + " unlocks " + count + " products");
assert.equal(newProductCounts.get(1),1,"Segment 1 should add only one recipe");

const fixedTargets = [0,8,10,12,14,16];
for (let day = 1; day <= 5; day += 1) assert.equal(G.Config.dailyCustomerTarget(day,"normal",function () { return .99; }),fixedTargets[day],"Wrong target on day " + day);
for (const roll of [0,.4,.99]) assert.ok([16,17,18].includes(G.Config.dailyCustomerTarget(6,"normal",function () { return roll; })),"Day 6+ target escaped 16-18");
for (const roll of [0,.4,.99]) assert.ok([18,19,20].includes(G.Config.dailyCustomerTarget(9,"food-street",function () { return roll; })),"Special target escaped 18-20");

const defaults = G.Storage.createDefaultSave();
assert.equal(defaults.money,300000,"Starting capital changed");
assert.equal(defaults.saveVersion,4,"Save schema 4 is missing");
assert.equal(G.Storage.save(defaults),true,"Save write failed");
assert.equal(G.Storage.load().save.money,300000,"Saved progress did not reload");
G.Storage.reset(); assert.equal(memoryStorage.has(G.Config.SAVE_KEY),false,"Reset did not remove progress");
const oldAn = { version:3,currentDay:12,money:125000,reputation:71,relationships:{ an:17 },characterVisits:{ an:5 },unlockedCharacters:["an","khanh"],story:{ introSeen:true,seenScenes:["intro"],flags:{ khanhDaysAbsent:1 } },stats:{ totalCustomersServed:44 },upgrades:{ trayCapacity:2 } };
oldAn.relationships[removedIds[0]] = 99; oldAn.characterVisits[removedIds[1]] = 8; oldAn.unlockedCharacters.push(removedIds[2]);
const migrated = G.Storage.sanitize(oldAn);
assert.equal(migrated.saveVersion,4,"Old save did not migrate to schema 4");
assert.equal(migrated.money,125000,"Migration lost money");
assert.equal(migrated.relationships.an,17,"New An did not inherit compatible progress");
assert.equal(migrated.upgrades.trayCapacity,2,"Migration lost upgrades");
for (const id of removedIds) assert.equal(migrated.relationships[id],undefined,"Migration retained deprecated relation: " + id);
assert.equal(migrated.story.flags.menuSegment,5,"Menu segment was not initialized");
assert.equal(migrated.story.flags.khanhDaysAbsent,1,"Khánh pity state did not migrate");

let seed = 24681357;
function seededRandom() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
const simulationSave = G.Storage.createDefaultSave();
simulationSave.unlockedCharacters = G.Characters.all.map(function (character) { return character.id; }).concat(["homi"]);
const allFoods = G.Config.FOODS.slice();
for (const id of ["phuoc-nguyen","anh-quan","thien-an","hoang-linh","an","khanh"]) {
  const character = G.Characters.getById(id);
  const signatures = new Set(); const sizes = new Set();
  for (let visit = 0; visit < 20; visit += 1) {
    const order = G.CharacterSystem.generateOrder(simulationSave,character,16,allFoods,8,seededRandom,false);
    signatures.add(G.CharacterSystem.orderSignature(order)); sizes.add(order.items.length);
    G.CharacterSystem.recordOrder(simulationSave,id,order);
  }
  assert.ok(signatures.size >= 5,character.name + " orders repeat too much");
  if (id === "khanh") assert.ok(Math.min(...sizes) >= 3 && Math.max(...sizes) >= 4,"Khánh giant order failed");
  if (id === "an") assert.ok(Math.min(...sizes) >= 2 && Math.max(...sizes) <= 4,"An medium-large order balance failed");
}
assert.ok(source["js/character-system.js"].includes("Ngon cỡ Poseidon."),"Khánh Poseidon reaction is missing");

const ratioSave = G.Storage.createDefaultSave();
ratioSave.unlockedCharacters = G.Characters.all.map(function (character) { return character.id; });
let named = 0; let generic = 0;
for (let index = 0; index < 6000; index += 1) {
  const visitor = G.CharacterSystem.chooseVisitor(ratioSave,12,{ id:"normal" },seededRandom);
  if (visitor.isGeneric) generic += 1; else named += 1;
}
const namedRate = named / (named + generic);
assert.ok(namedRate >= .55 && namedRate <= .65,"Named spawn rate outside 55-65%: " + namedRate.toFixed(3));

assert.equal(G.Orders.matches({ items:["ca-vien","bo-vien","ca-vien"],sauce:"tuong-ot",drink:"tra-chanh" },["bo-vien","ca-vien","ca-vien"],"tuong-ot","tra-chanh"),true,"Correct order rejected");
assert.equal(G.Orders.matches({ items:["ca-vien"],sauce:"tuong-ot",drink:"none" },["bo-vien"],"tuong-ot","none"),false,"Wrong food accepted");
let readyEvents = 0; let burntEvents = 0;
const fryer = new G.Cooking.FryerManager(3,{ cookTimeScale:1,readyTimeScale:1 },{ ready:function () { readyEvents += 1; },burnt:function () { burntEvents += 1; } });
fryer.addFood("ca-vien"); fryer.update(G.Config.BALANCE.rawStageMs + 1); fryer.update(G.Config.foodById("ca-vien").cookTime + 1); fryer.update(G.Config.foodById("ca-vien").burnTime + 1);
assert.equal(readyEvents,1,"Ready callback failed"); assert.equal(burntEvents,1,"Burn callback failed"); assert.equal(fryer.discardBurnt(0),true,"Burnt food cannot be discarded");
const prep = new G.Cooking.PrepManager([G.Config.foodById("banh-trang-tron")],{ cookTimeScale:1,readyTimeScale:1 },{});
assert.ok(prep.addFood("banh-trang-tron"),"Mix station rejected recipe"); prep.update(G.Config.foodById("banh-trang-tron").cookTime + 1); assert.equal(prep.collect(0),"banh-trang-tron","Prepared dish did not reach ready state");

const richSave = G.Storage.createDefaultSave();
const beforeCapacity = G.Upgrades.modifiers(richSave.upgrades).fryerCapacity;
assert.equal(G.Upgrades.buy(richSave,"fryerCapacity").ok,true,"Affordable upgrade failed");
assert.equal(G.Upgrades.modifiers(richSave.upgrades).fryerCapacity,beforeCapacity + 1,"Upgrade effect did not apply");
const poorSave = G.Storage.createDefaultSave(); poorSave.money = 0;
assert.equal(G.Upgrades.buy(poorSave,"fasterFryer").reason,"money","Insufficient funds not rejected");
const maxSave = G.Storage.createDefaultSave(); maxSave.upgrades.fryerCapacity = 3;
assert.equal(G.Upgrades.buy(maxSave,"fryerCapacity").reason,"max","Maximum level not enforced");

const fakeElements = new Map();
function fakeElement(id) {
  if (!fakeElements.has(id)) fakeElements.set(id,{ id:id,hidden:true,disabled:false,textContent:"",addEventListener:function () {},focus:function () {},classList:{ add:function () {},remove:function () {},toggle:function () {} } });
  return fakeElements.get(id);
}
let alertCount = 0; let endRendered = 0; const dialogueHistory = [];
G.UI = {
  byId:fakeElement,showScreen:function () {},renderIngredients:function () {},renderSauces:function () {},renderDrinks:function () {},
  renderFryers:function () {},updateFryers:function () {},renderPrepStations:function () {},updatePrepStations:function () {},
  renderTray:function () {},renderCustomers:function () {},updateCustomers:function () {},renderMascot:function () {},
  updateHUD:function () {},updateServeState:function () {},toast:function () {},floating:function () {},coinBurst:function () {},
  showUnlock:function (details,done) { done(); },showKhanhAlert:function (done) { alertCount += 1; done(); },
  playCustomerDialogue:function (lines,options,done) { dialogueHistory.push({ lines:lines,options:options }); done(); },
  renderEnd:function () { endRendered += 1; }
};
G.Audio = { play:function () {} };
G.TutorialManager = class { constructor(done) { this.done = done; this.active = false; } start() { this.active = true; } notify() {} refreshHighlight() {} complete() { this.active = false; this.done(true); } };
vm.runInContext(source["js/story.js"],sandbox,{ filename:"js/story.js" });
G.Story.StoryManager = class { show(scene,done) { done(scene); } };
vm.runInContext(source["js/game.js"],sandbox,{ filename:"js/game.js" });

const pityFlags = { khanhDaysAbsent:0,khanhLastVisitDay:0 };
let lastKhanhDay = 0;
for (let day = 1; day <= 30; day += 1) {
  const due = G.Game.shouldScheduleKhanh(day,pityFlags,function () { return .99; });
  if (due) {
    if (lastKhanhDay) assert.ok(day - lastKhanhDay <= 2,"Khánh exceeded two-day pity limit");
    lastKhanhDay = day; pityFlags.khanhDaysAbsent = 0; pityFlags.khanhLastVisitDay = day;
  } else pityFlags.khanhDaysAbsent = Math.min(2,pityFlags.khanhDaysAbsent + 1);
}
assert.ok(lastKhanhDay >= 29,"Thirty-day Khánh simulation stopped early");

const invasionSave = G.Storage.createDefaultSave();
invasionSave.tutorialCompleted = true; invasionSave.story.introSeen = true; invasionSave.story.seenScenes = ["intro"]; invasionSave.story.flags.khanhDaysAbsent = 1;
const game = new G.Game(invasionSave,{});
game.start(2);
assert.equal(game.dailyTarget,10,"Actual Game day 2 target is not 10");
game.customers = []; game.selectedCustomerId = null; game.spawnedCount = game.khanhSlot; game.spawnCustomer(false);
assert.equal(alertCount,1,"Khánh invasion alert did not run");
assert.equal(game.khanhPending,false,"Khánh alert left input frozen");
assert.equal(game.customers.length,1,"No customer spawned after alert");
assert.equal(game.customers[0].characterId,"khanh","Generic customer replaced Khánh after alert");
assert.ok(game.customers[0].order.items.length >= 3,"Runtime Khánh order is not giant");

const khanh = game.customers[0];
game.selectedCustomerId = khanh.id; game.tray = khanh.order.items.slice(); game.selectedSauce = khanh.order.sauce; game.selectedDrink = khanh.order.drink || "none";
const originalRandom = Math.random;
Math.random = function () { return .1; };
try { game.serve(); } finally { Math.random = originalRandom; }
assert.ok(game.summary.tips >= 5000,"Khánh did not receive generous tip");
assert.equal(khanh.bonusSecond,true,"Khánh second order did not trigger under QA roll");
assert.ok(dialogueHistory.some(function (entry) { return entry.options.phase === "Phản hồi"; }),"Correct-order reaction did not appear");

for (let day = 1; day <= 6; day += 1) {
  const save = G.Storage.createDefaultSave(); save.tutorialCompleted = true; save.story.introSeen = true;
  save.story.seenScenes = ["intro","chapter2","chapter3","rival","foodRush","exam-scene","cooperation","graduation","endless"];
  const daily = new G.Game(save,{}); daily.start(day);
  const expected = day <= 5 ? fixedTargets[day] : daily.dailyTarget;
  assert.equal(daily.dailyTarget,expected,"Actual Game target wrong on day " + day);
  daily.customers = []; daily.resolvedCustomers = daily.dailyTarget; daily.khanhDue = false; daily.khanhPending = false; daily.update(1);
  assert.equal(save.currentDay,day + 1,"Actual end-of-day flow failed on day " + day);
}
assert.ok(endRendered >= 6,"End screen did not render for progression simulation");

console.log("QA passed: " + runtimeFiles.length + " runtime files, " + localReferences.length + " local references, " + G.Characters.all.length + " named customers, 30 simulated Khánh days.");
