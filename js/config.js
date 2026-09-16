(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};
  const GAME_VERSION = "2026.09-CLEAN-CHARACTER-UPDATE";
  window.GAME_VERSION = GAME_VERSION;
  CVVH.GAME_VERSION = GAME_VERSION;

  const SPECIAL_EVENTS = new Set(["food-street", "music-event"]);

  CVVH.Config = {
    SAVE_KEY: "caVienViaHeSave_v1",
    VERSION: 4,
    GAME_VERSION: GAME_VERSION,
    BALANCE: Object.freeze({
      startingMoney: 300000,
      startingReputation: 60,
      dayDuration: 82,
      dailyCustomerMax: 20,
      namedCustomerRate: .60,
      firstSpawnDelay: 700,
      wrongOrderPenalty: 2000,
      leaveReputation: 3,
      wrongReputation: 2,
      correctReputation: 1.2,
      burntReputation: .35,
      rawStageMs: 420,
      maxTrayHardLimit: 12
    }),
    FOODS: Object.freeze([
      { id:"ca-vien", name:"Cá viên", shortName:"Cá viên", image:"./assets/food/ca-vien.svg", station:"fryer", cost:3000, price:12000, cookTime:3900, burnTime:4200, unlockDay:1, unlockSegment:1 },
      { id:"bo-vien", name:"Bò viên", shortName:"Bò viên", image:"./assets/food/bo-vien.svg", station:"fryer", cost:3200, price:13000, cookTime:4300, burnTime:4000, unlockDay:1, unlockSegment:1 },
      { id:"xuc-xich", name:"Xúc xích", shortName:"Xúc xích", image:"./assets/food/xuc-xich.svg", station:"fryer", cost:3500, price:14000, cookTime:4600, burnTime:3700, unlockDay:1, unlockSegment:1 },
      { id:"pho-mai-que", name:"Phô mai que", shortName:"Phô mai", image:"./assets/food/pho-mai-que.svg", station:"fryer", cost:4300, price:17000, cookTime:3600, burnTime:2900, unlockDay:2, unlockSegment:1 },
      { id:"nem-chua-ran", name:"Nem chua rán", shortName:"Nem chua", image:"./assets/food/nem-chua-ran.svg", station:"fryer", cost:4500, price:18000, cookTime:4900, burnTime:3400, unlockDay:6, unlockSegment:3 },
      { id:"banh-trang-tron", name:"Bánh tráng trộn", shortName:"Bánh tráng", image:"./assets/food/banh-trang-tron.svg", station:"mix", stationName:"Bàn trộn", cost:5000, price:20000, cookTime:3100, burnTime:9000, unlockDay:9, unlockSegment:4 },
      { id:"mi-tron", name:"Mì trộn", shortName:"Mì trộn", image:"./assets/food/mi-tron.svg", station:"pot", stationName:"Nồi mì", cost:6000, price:24000, cookTime:3900, burnTime:6000, unlockDay:12, unlockSegment:5 },
      { id:"ca-vien-curry", name:"Cá viên sốt cà ri", shortName:"Cá cà ri", image:"./assets/food/ca-vien-curry.svg", station:"signature", stationName:"Nồi cà ri", cost:7200, price:29000, cookTime:4700, burnTime:5200, unlockDay:15, unlockSegment:6 }
    ]),
    DRINKS: Object.freeze([
      { id:"none", name:"Không gọi nước", shortName:"Không nước", image:"./assets/drinks/no-drink.svg", cost:0, price:0, unlockDay:1, unlockSegment:1 },
      { id:"tra-chanh", name:"Trà chanh", shortName:"Chanh", image:"./assets/drinks/tra-chanh.svg", cost:3500, price:12000, unlockDay:3, unlockSegment:2 },
      { id:"tra-dao", name:"Trà đào", shortName:"Đào", image:"./assets/drinks/tra-dao.svg", cost:4500, price:16000, unlockDay:3, unlockSegment:2 },
      { id:"tra-tac", name:"Trà tắc", shortName:"Tắc", image:"./assets/drinks/tra-tac.svg", cost:3800, price:13000, unlockDay:6, unlockSegment:3 },
      { id:"tra-vai", name:"Trà vải", shortName:"Vải", image:"./assets/drinks/tra-vai.svg", cost:4800, price:17000, unlockDay:12, unlockSegment:5 }
    ]),
    SAUCES: Object.freeze([
      { id:"tuong-ot", name:"Tương ớt", shortName:"Ớt", image:"./assets/ui/sauce-chili.svg", unlockDay:1 },
      { id:"tuong-ca", name:"Tương cà", shortName:"Cà", image:"./assets/ui/sauce-ketchup.svg", unlockDay:1 },
      { id:"mayonnaise", name:"Mayonnaise", shortName:"Mayo", image:"./assets/ui/sauce-mayo.svg", unlockDay:3 },
      { id:"sot-ngot", name:"Sốt ngọt", shortName:"Ngọt", image:"./assets/ui/sauce-sweet.svg", unlockDay:6 },
      { id:"sot-mix", name:"Sốt mix", shortName:"Mix", image:"./assets/ui/sauce-mix.svg", unlockDay:9 }
    ]),
    UPGRADES: Object.freeze([
      { id:"fryerCapacity", name:"Thêm ô chảo", icon:"🍳", description:"Mỗi cấp mở thêm một ô chiên độc lập.", maxLevel:3, baseCost:110000, scale:1.72 },
      { id:"fasterFryer", name:"Bếp lửa lớn", icon:"🔥", description:"Món chín nhanh hơn 8% ở mỗi cấp.", maxLevel:5, baseCost:90000, scale:1.58 },
      { id:"betterFryer", name:"Chảo chống cháy", icon:"⏳", description:"Kéo dài thời gian sẵn sàng thêm 18% mỗi cấp.", maxLevel:5, baseCost:85000, scale:1.55 },
      { id:"trayCapacity", name:"Khay lớn", icon:"🍽️", description:"Mỗi cấp chứa thêm một món; cấp cao nhận được đơn nhóm.", maxLevel:8, baseCost:75000, scale:1.48 },
      { id:"customerComfort", name:"Ghế chờ mát", icon:"🪭", description:"Khách kiên nhẫn hơn 10% ở mỗi cấp.", maxLevel:5, baseCost:80000, scale:1.58 },
      { id:"betterStall", name:"Quầy sạch đẹp", icon:"✨", description:"Tiền boa tăng thêm 12% mỗi cấp.", maxLevel:5, baseCost:105000, scale:1.6 },
      { id:"premiumSauce", name:"Sốt nhà làm", icon:"🌶️", description:"Giá trị mỗi đơn tăng thêm 5% mỗi cấp.", maxLevel:4, baseCost:95000, scale:1.64 },
      { id:"advertisement", name:"Biển quảng cáo", icon:"📣", description:"Khách mới ghé nhanh hơn 6% mỗi cấp.", maxLevel:4, baseCost:70000, scale:1.62 }
    ])
  };

  CVVH.Config.dailyCustomerTarget = function (day, eventId, random) {
    const exact = [0, 8, 10, 12, 14, 16];
    if (day <= 5) return exact[Math.max(1, day)];
    const rng = random || Math.random;
    return SPECIAL_EVENTS.has(eventId) ? 18 + Math.floor(rng() * 3) : 16 + Math.floor(rng() * 3);
  };
  CVVH.Config.menuSegmentForDay = function (day) {
    return day >= 15 ? 6 : day >= 12 ? 5 : day >= 9 ? 4 : day >= 6 ? 3 : day >= 3 ? 2 : 1;
  };
  CVVH.Config.foodById = function (id) { return CVVH.Config.FOODS.find(function (food) { return food.id === id; }); };
  CVVH.Config.sauceById = function (id) { return CVVH.Config.SAUCES.find(function (sauce) { return sauce.id === id; }); };
  CVVH.Config.drinkById = function (id) { return CVVH.Config.DRINKS.find(function (drink) { return drink.id === id; }); };
})();
