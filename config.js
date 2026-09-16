(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  const FOODS = [
    { id:"ca-vien", name:"Cá viên", shortName:"Cá viên", image:"./assets/food/ca-vien.svg", cost:3000, price:12000, cookTime:4300, burnTime:3900, unlockDay:1 },
    { id:"xuc-xich", name:"Xúc xích", shortName:"Xúc xích", image:"./assets/food/xuc-xich.svg", cost:3500, price:14000, cookTime:5200, burnTime:3600, unlockDay:1 },
    { id:"bo-vien", name:"Bò viên", shortName:"Bò viên", image:"./assets/food/bo-vien.svg", cost:3200, price:13000, cookTime:4700, burnTime:3500, unlockDay:1 },
    { id:"pho-mai", name:"Phô mai viên", shortName:"Phô mai", image:"./assets/food/pho-mai.svg", cost:4500, price:17000, cookTime:3900, burnTime:2700, unlockDay:2 },
    { id:"ho-lo", name:"Hồ lô", shortName:"Hồ lô", image:"./assets/food/ho-lo.svg", cost:4000, price:16000, cookTime:5000, burnTime:3400, unlockDay:4 },
    { id:"tom-vien", name:"Tôm viên", shortName:"Tôm viên", image:"./assets/food/tom-vien.svg", cost:4800, price:18500, cookTime:4700, burnTime:3000, unlockDay:5 },
    { id:"muc-vien", name:"Mực viên", shortName:"Mực viên", image:"./assets/food/muc-vien.svg", cost:4200, price:16500, cookTime:4800, burnTime:3100, unlockDay:6 },
    { id:"ca-vien-pho-mai", name:"Cá viên phô mai", shortName:"Cá phô mai", image:"./assets/food/ca-vien-pho-mai.svg", cost:5000, price:19500, cookTime:4400, burnTime:2800, unlockDay:7 },
    { id:"ha-cao-chien", name:"Há cảo chiên", shortName:"Há cảo", image:"./assets/food/ha-cao-chien.svg", cost:4300, price:17500, cookTime:4700, burnTime:2900, unlockDay:8 },
    { id:"thanh-cua", name:"Thanh cua", shortName:"Thanh cua", image:"./assets/food/thanh-cua.svg", cost:3700, price:15000, cookTime:3900, burnTime:2600, unlockDay:9 },
    { id:"ca-vien-trung-cut", name:"Cá viên trứng cút", shortName:"Cá trứng cút", image:"./assets/food/ca-vien-trung-cut.svg", cost:5200, price:20500, cookTime:5100, burnTime:3000, unlockDay:10 },
    { id:"ca-vien-trung-muoi", name:"Cá viên trứng muối", shortName:"Cá trứng muối", image:"./assets/food/ca-vien-trung-muoi.svg", cost:5500, price:21500, cookTime:4900, burnTime:2900, unlockDay:11 },
    { id:"cha-ca", name:"Chả cá", shortName:"Chả cá", image:"./assets/food/cha-ca.svg", cost:3900, price:15500, cookTime:4500, burnTime:3300, unlockDay:12 },
    { id:"banh-gao-chien", name:"Bánh gạo chiên", shortName:"Bánh gạo", image:"./assets/food/banh-gao-chien.svg", cost:3500, price:14500, cookTime:4200, burnTime:3000, unlockDay:13 },
    { id:"dau-hu", name:"Đậu hũ", shortName:"Đậu hũ", image:"./assets/food/dau-hu.svg", cost:2600, price:10500, cookTime:3600, burnTime:2500, unlockDay:14 },
    { id:"khoai-tay", name:"Khoai tây", shortName:"Khoai tây", image:"./assets/food/khoai-tay.svg", cost:2800, price:11000, cookTime:4100, burnTime:3200, unlockDay:14 }
  ];

  const DRINKS = [
    { id:"none", name:"Không gọi nước", shortName:"Không nước", image:"./assets/drinks/no-drink.svg", cost:0, price:0, unlockDay:1 },
    { id:"tra-chanh", name:"Trà chanh", shortName:"Trà chanh", image:"./assets/drinks/tra-chanh.svg", cost:3500, price:12000, unlockDay:3 },
    { id:"tra-dao", name:"Trà đào", shortName:"Trà đào", image:"./assets/drinks/tra-dao.svg", cost:4500, price:16000, unlockDay:3 },
    { id:"tra-tac", name:"Trà tắc", shortName:"Trà tắc", image:"./assets/drinks/tra-tac.svg", cost:3800, price:13000, unlockDay:5 },
    { id:"tra-vai", name:"Trà vải", shortName:"Trà vải", image:"./assets/drinks/tra-vai.svg", cost:4800, price:17000, unlockDay:7 }
  ];

  const SAUCES = [
    { id:"tuong-ot", name:"Tương ớt", shortName:"Ớt", image:"./assets/ui/sauce-chili.svg", unlockDay:1 },
    { id:"tuong-ca", name:"Tương cà", shortName:"Cà", image:"./assets/ui/sauce-ketchup.svg", unlockDay:1 },
    { id:"mayonnaise", name:"Mayonnaise", shortName:"Mayo", image:"./assets/ui/sauce-mayo.svg", unlockDay:2 },
    { id:"sot-ngot", name:"Sốt ngọt", shortName:"Ngọt", image:"./assets/ui/sauce-sweet.svg", unlockDay:4 },
    { id:"sot-mix", name:"Sốt mix", shortName:"Mix", image:"./assets/ui/sauce-mix.svg", unlockDay:6 }
  ];

  CVVH.Config = {
    SAVE_KEY:"caVienViaHeSave_v1",
    VERSION:4,
    GAME_VERSION:"2026.09.16-CLEAN-STORY-v4",
    BALANCE:Object.freeze({
      startingMoney:300000,
      startingReputation:60,
      dayDuration:90,
      dailyCustomerBase:8,
      dailyCustomerMax:18,
      firstSpawnDelay:800,
      wrongOrderPenalty:2000,
      leaveReputation:3,
      wrongReputation:2,
      correctReputation:1.2,
      burntReputation:.35,
      rawStageMs:450,
      maxTrayHardLimit:12
    }),
    FOODS:Object.freeze(FOODS),
    DRINKS:Object.freeze(DRINKS),
    SAUCES:Object.freeze(SAUCES),
    UPGRADES:Object.freeze([
      { id:"fryerCapacity", name:"Thêm ô chảo", icon:"🍳", description:"Mỗi cấp mở thêm một ô chiên độc lập.", maxLevel:3, baseCost:110000, scale:1.72 },
      { id:"fasterFryer", name:"Bếp lửa lớn", icon:"🔥", description:"Món chín nhanh hơn 8% ở mỗi cấp.", maxLevel:5, baseCost:90000, scale:1.58 },
      { id:"betterFryer", name:"Chảo chống cháy", icon:"⏳", description:"Kéo dài thời gian Sẵn sàng thêm 18% mỗi cấp.", maxLevel:5, baseCost:85000, scale:1.55 },
      { id:"trayCapacity", name:"Khay lớn", icon:"🍽️", description:"Mỗi cấp chứa thêm một món đã chiên; cấp cao nhận được đơn nhóm.", maxLevel:8, baseCost:75000, scale:1.48 },
      { id:"customerComfort", name:"Ghế chờ mát", icon:"🪭", description:"Khách kiên nhẫn hơn 10% ở mỗi cấp.", maxLevel:5, baseCost:80000, scale:1.58 },
      { id:"betterStall", name:"Quầy sạch đẹp", icon:"✨", description:"Tiền boa tăng thêm 12% mỗi cấp.", maxLevel:5, baseCost:105000, scale:1.6 },
      { id:"premiumSauce", name:"Sốt nhà làm", icon:"🌶️", description:"Giá trị mỗi đơn tăng thêm 5% mỗi cấp.", maxLevel:4, baseCost:95000, scale:1.64 },
      { id:"advertisement", name:"Biển quảng cáo", icon:"📣", description:"Khách mới ghé nhanh hơn 6% mỗi cấp.", maxLevel:4, baseCost:70000, scale:1.62 }
    ])
  };

  CVVH.Config.foodById = function (id) { return FOODS.find(function (item) { return item.id === id; }); };
  CVVH.Config.drinkById = function (id) { return DRINKS.find(function (item) { return item.id === id; }); };
  CVVH.Config.sauceById = function (id) { return SAUCES.find(function (item) { return item.id === id; }); };
  CVVH.Config.getUnlockedFoods = function (day) { return FOODS.filter(function (item) { return item.unlockDay <= day; }); };
  CVVH.Config.getUnlockedDrinks = function (day) { return DRINKS.filter(function (item) { return item.unlockDay <= day; }); };
  CVVH.Config.getUnlockedSauces = function (day) { return SAUCES.filter(function (item) { return item.unlockDay <= day; }); };
  CVVH.Config.isFoodUnlocked = function (id, day) { const item = CVVH.Config.foodById(id); return Boolean(item && item.unlockDay <= day); };
  CVVH.Config.isDrinkUnlocked = function (id, day) { const item = CVVH.Config.drinkById(id); return Boolean(item && item.unlockDay <= day); };
  CVVH.Config.isSauceUnlocked = function (id, day) { const item = CVVH.Config.sauceById(id); return Boolean(item && item.unlockDay <= day); };
  CVVH.Config.dailyCustomerTarget = function (day) {
    const d = Math.max(1, Number(day) || 1);
    if (d <= 5) return 8 + (d - 1) * 2;
    return 16 + ((d * 7) % 3); // 16–18, deterministic and stable per day.
  };
})();
