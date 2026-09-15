(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  CVVH.Config = {
    SAVE_KEY: "caVienViaHeSave_v1",
    VERSION: 2,
    BALANCE: Object.freeze({
      startingMoney: 300000,
      startingReputation: 60,
      dayDuration: 75,
      firstSpawnDelay: 800,
      wrongOrderPenalty: 2000,
      leaveReputation: 3,
      wrongReputation: 2,
      correctReputation: 1.2,
      burntReputation: 0.35,
      rawStageMs: 450,
      maxTrayHardLimit: 12
    }),
    FOODS: Object.freeze([
      { id: "ca-vien", name: "Cá viên", shortName: "Cá viên", image: "./assets/food/ca-vien.svg", cost: 3000, price: 12000, cookTime: 4300, burnTime: 3900, unlockDay: 1 },
      { id: "xuc-xich", name: "Xúc xích", shortName: "Xúc xích", image: "./assets/food/xuc-xich.svg", cost: 3500, price: 14000, cookTime: 5200, burnTime: 3600, unlockDay: 1 },
      { id: "bo-vien", name: "Bò viên", shortName: "Bò viên", image: "./assets/food/bo-vien.svg", cost: 3200, price: 13000, cookTime: 4700, burnTime: 3500, unlockDay: 1 },
      { id: "pho-mai", name: "Phô mai viên", shortName: "Phô mai", image: "./assets/food/pho-mai.svg", cost: 4500, price: 17000, cookTime: 3900, burnTime: 2700, unlockDay: 2 },
      { id: "ho-lo", name: "Hồ lô", shortName: "Hồ lô", image: "./assets/food/ho-lo.svg", cost: 4000, price: 16000, cookTime: 5000, burnTime: 3400, unlockDay: 3 },
      { id: "tom-vien", name: "Tôm viên", shortName: "Tôm viên", image: "./assets/food/tom-vien.svg", cost: 4800, price: 18500, cookTime: 4700, burnTime: 3000, unlockDay: 4 },
      { id: "dau-hu", name: "Đậu hũ", shortName: "Đậu hũ", image: "./assets/food/dau-hu.svg", cost: 2600, price: 10500, cookTime: 3600, burnTime: 2500, unlockDay: 5 },
      { id: "khoai-tay", name: "Khoai tây", shortName: "Khoai tây", image: "./assets/food/khoai-tay.svg", cost: 2800, price: 11000, cookTime: 4100, burnTime: 3200, unlockDay: 5 }
    ]),
    SAUCES: Object.freeze([
      { id: "tuong-ot", name: "Tương ớt", shortName: "Ớt", image: "./assets/ui/sauce-chili.svg", unlockDay: 1 },
      { id: "tuong-ca", name: "Tương cà", shortName: "Cà", image: "./assets/ui/sauce-ketchup.svg", unlockDay: 1 },
      { id: "mayonnaise", name: "Mayonnaise", shortName: "Mayo", image: "./assets/ui/sauce-mayo.svg", unlockDay: 2 },
      { id: "sot-ngot", name: "Sốt ngọt", shortName: "Ngọt", image: "./assets/ui/sauce-sweet.svg", unlockDay: 3 },
      { id: "sot-mix", name: "Sốt mix", shortName: "Mix", image: "./assets/ui/sauce-mix.svg", unlockDay: 4 }
    ]),
    UPGRADES: Object.freeze([
      { id: "fryerCapacity", name: "Thêm ô chảo", icon: "🍳", description: "Mỗi cấp mở thêm một ô chiên độc lập.", maxLevel: 3, baseCost: 110000, scale: 1.72 },
      { id: "fasterFryer", name: "Bếp lửa lớn", icon: "🔥", description: "Món chín nhanh hơn 8% ở mỗi cấp.", maxLevel: 5, baseCost: 90000, scale: 1.58 },
      { id: "betterFryer", name: "Chảo chống cháy", icon: "⏳", description: "Kéo dài thời gian Sẵn sàng thêm 18% mỗi cấp.", maxLevel: 5, baseCost: 85000, scale: 1.55 },
      { id: "trayCapacity", name: "Khay lớn", icon: "🍽️", description: "Mỗi cấp chứa thêm một món đã chiên; cấp cao nhận được đơn nhóm.", maxLevel: 8, baseCost: 75000, scale: 1.48 },
      { id: "customerComfort", name: "Ghế chờ mát", icon: "🪭", description: "Khách kiên nhẫn hơn 10% ở mỗi cấp.", maxLevel: 5, baseCost: 80000, scale: 1.58 },
      { id: "betterStall", name: "Quầy sạch đẹp", icon: "✨", description: "Tiền boa tăng thêm 12% mỗi cấp.", maxLevel: 5, baseCost: 105000, scale: 1.6 },
      { id: "premiumSauce", name: "Sốt nhà làm", icon: "🌶️", description: "Giá trị mỗi đơn tăng thêm 5% mỗi cấp.", maxLevel: 4, baseCost: 95000, scale: 1.64 },
      { id: "advertisement", name: "Biển quảng cáo", icon: "📣", description: "Khách mới ghé nhanh hơn 6% mỗi cấp.", maxLevel: 4, baseCost: 70000, scale: 1.62 }
    ])
  };

  CVVH.Config.foodById = function (id) { return CVVH.Config.FOODS.find(function (food) { return food.id === id; }); };
  CVVH.Config.sauceById = function (id) { return CVVH.Config.SAUCES.find(function (sauce) { return sauce.id === id; }); };
})();
