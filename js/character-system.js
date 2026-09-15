(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  const INITIAL_UNLOCKS = Object.freeze(["khanh", "nhan", "trang", "tran", "quy", "chu-sau"]);
  const KNOWLEDGE = Object.freeze({
    quy:{ trang:"best_friend", tran:"best_friend", vu:"stranger" },
    trang:{ quy:"best_friend", tran:"best_friend", thuy:"friend" },
    tran:{ quy:"best_friend", trang:"best_friend", thuy:"friend" },
    vu:{ han:"crush", duong:"friend" },
    han:{ vu:"schoolmate", an:"friend" },
    duong:{ vu:"friend", khanh:"friend", "thay-tung":"teacher" },
    thuy:{ trang:"friend", tran:"friend", duong:"classmate", thao:"crush" },
    nhan:{ "thay-tung":"teacher" }
  });

  const BOOK = Object.freeze({
    khanh:{ trait:"BIG APPETITE", tagline:"Em không ăn nhiều. Em chỉ ăn đủ.", description:"Nhà phê bình ẩm thực tự phong; mỗi phần lớn chỉ là màn khởi động." },
    nhan:{ trait:"DATA TASTER", tagline:"Du học sinh từ Hong Kong. Cần đủ dữ liệu trước khi kết luận.", description:"Điềm tĩnh, hài khô và thích so sánh fish ball giữa Việt Nam với Hong Kong." },
    trang:{ trait:"BEST FRIEND", tagline:"Một phần của bộ ba Quý–Trang–Trân.", description:"Thẳng thắn, nhanh nhẹn và luôn biết hai bạn thân đang giấu chuyện gì." },
    tran:{ trait:"SECRET KEEPER?", tagline:"Bí mật thường tồn tại được khoảng ba phút.", description:"Lém lỉnh, tình cảm và là bạn thân lâu năm của Quý với Trang." },
    quy:{ trait:"ONE MINUTE LEFT", tagline:"Lúc nào cũng còn đúng một phút.", description:"Bạn thân của Trang và Trân. Không quen Vũ, nhưng rất quen chạy trễ." },
    thuy:{ trait:"OBVIOUS CRUSH", tagline:"Nam sinh IT nói nhớ cá viên. Không ai còn tin.", description:"Bạn cùng lớp của Dương, hiền và tốt bụng. Thủy rất thích chị Thảo; Thủy nghĩ mình giấu khá tốt. Thủy không giấu tốt." },
    duong:{ trait:"TECH TALK", tagline:"Học IT. Hay hỏi hôm nay có bạn nào xinh ghé.", description:"Vui tính, thích code, đồ chiên và những dữ liệu xã hội hoàn toàn vô hại." },
    vu:{ trait:"HÂN ĐÂU RỒI?", tagline:"Bình thường khá tự nhiên, cho tới khi ai đó nhắc Hân.", description:"Nói chuyện tự tin, riêng chủ đề Hân thì hệ thống thường mất ổn định." },
    han:{ trait:"QUIETLY SHARP", tagline:"??? customer approaching…", description:"Điềm tĩnh, thân thiện, tinh ý và có câu chuyện riêng ngoài Vũ." },
    hoc:{ trait:"STUDY PENDING", tagline:"Tên là Học. Việc học thường bắt đầu sau khi ăn.", description:"Tinh nghịch, hay trì hoãn nhưng có thể nghiêm túc đáng ngạc nhiên trong tuần thi." },
    tho:{ trait:"FOOD SAFETY", tagline:"Cán bộ kiểm tra hư cấu. Mức hoảng của Thảo: ██████████", description:"Chuyên nghiệp, lịch sự và dần trở thành khách quen của quầy." },
    "thay-minh":{ trait:"JUST INSPECTING", tagline:"Thầy chỉ quan sát khu vực thôi.", description:"Hiệu trưởng hư cấu, trang trọng và bí mật rất thích đồ ăn đường phố." },
    "co-lan":{ trait:"EXACTLY ON TIME", tagline:"Cô quay lại sau đúng bảy phút.", description:"Phó hiệu trưởng hư cấu, chính xác, có tổ chức và quan tâm học sinh." },
    "thay-phong":{ trait:"PROBABILITY", tagline:"Thấp là bao nhiêu phần trăm?", description:"Giáo viên Toán hư cấu, đánh giá mọi thứ bằng xác suất." },
    "co-mai":{ trait:"POETIC TASTE", tagline:"Mỗi phần ăn đều có thể là một buổi chiều tháng ba.", description:"Giáo viên Văn hư cấu, giàu hình ảnh và quan sát tinh tế." },
    "co-linh":{ trait:"NOT TOO SPICY", tagline:"Spicy, but not too spicy nha.", description:"Giáo viên tiếng Anh hư cấu, vui vẻ và giúp học sinh bớt sợ nói sai." },
    "thay-khoi":{ trait:"FRY LAB", tagline:"Chiếc chảo là một phòng thí nghiệm nhỏ.", description:"Giáo viên Hóa hư cấu, tò mò về phản ứng nâu hóa và dầu chiên." },
    "thay-tung":{ trait:"EAT THEN DEBUG", tagline:"Code lỗi à? Ăn xong sửa.", description:"Giáo viên Tin hư cấu, ít lời và hiểu mọi câu đùa lập trình." },
    "co-huong":{ trait:"WAITING PARENT", tagline:"Cô chỉ đứng chờ con thôi…", description:"Phụ huynh thân thiện, từ người đứng chờ trở thành khách quen." },
    "chu-thanh":{ trait:"ONE EXCEPTION", tagline:"Mấy món chiên ăn nhiều không tốt… cho chú hai phần.", description:"Phụ huynh nghiêm ngoài mặt nhưng luôn mua thêm phần cho con." },
    "chu-sau":{ trait:"RUSH FORECAST", tagline:"Chút nữa Khánh chạy tới cho coi.", description:"Bảo vệ trường hư cấu, biết nhịp sinh hoạt của cả khu phố." },
    "chi-hong":{ trait:"MARKET RESEARCH", tagline:"Đối thủ chứ có phải kẻ thù đâu.", description:"Chủ quầy bên cạnh, cạnh tranh vui vẻ rồi dần hợp tác với Thảo." }
  });

  const UNLOCK_RULES = Object.freeze({
    tram:function (s,d) { return d >= 2; },
    an:function (s,d) { return d >= 2; },
    "gia-huy":function (s,d) { return d >= 2; },
    "co-huong":function (s,d) { return d >= 2; },
    "bac-tu":function (s,d) { return d >= 2; },
    duong:function (s,d) { return d >= 2; },
    thuy:function (s,d) { return d >= 2 && s.stats.totalCustomersServed >= 2; },
    vu:function (s,d) { return d >= 3; },
    my:function (s,d) { return d >= 3; },
    hoc:function (s,d) { return d >= 3; },
    han:function (s,d) { return d >= 4 && (Number(s.story.flags.vuAskedAboutHan || 0) >= 2 || d >= 8); },
    tho:function (s,d,r) { return d >= 4 && (r >= 64 || d >= 8); },
    "co-lan":function (s,d) { return d >= 4; },
    "thay-phong":function (s,d) { return d >= 4; },
    "co-mai":function (s,d) { return d >= 4; },
    "co-linh":function (s,d) { return d >= 4; },
    "co-thao":function (s,d) { return d >= 5; },
    "thay-khoi":function (s,d) { return d >= 5; },
    "thay-tung":function (s,d) { return d >= 5; },
    "thay-minh":function (s,d,r) { return d >= 6 && r >= 66; },
    "chu-thanh":function (s,d) { return d >= 6; },
    "chi-hong":function (s,d,r) { return d >= 7 && (r >= 68 || s.stats.totalCustomersServed >= 12); },
    "anh-bon-ba-bay":function (s,d) { return d >= 8; }
  });

  const PRE_DIALOGUE = Object.freeze({
    nhan:[
      ["Ở Hong Kong cũng có fish ball, nhưng kiểu này khác.", "Khác sao?"],
      ["Em cần thử thêm vài lần mới kết luận.", "Nghe giống lý do để ăn tiếp."],
      ["Hôm nay em thu thập thêm một mẫu.", "Quầy chị không xuất báo cáo đâu nha."],
      ["Biên Hòa nóng hơn em tưởng, đồ ăn thì đáng thử hơn em tưởng.", "Rồi, nhà nghiên cứu gọi món đi."],
      ["Em cần đủ dữ liệu.", "Dữ liệu tính theo xiên hả?"]
    ],
    duong:[
      ["Nay có bạn nào xinh ghé quán không chị?", "Em tới ăn hay tới thống kê?"],
      ["Hôm nay tình hình sao chị?", "Cá viên còn nhiều."],
      ["Có dữ liệu gì mới không chị?", "Dữ liệu món ăn thì có."],
      ["Em tới ăn thôi nha. Thiệt.", "Chị có hỏi đâu."],
      ["Em đang restore system bằng đồ chiên.", "Restore xong nhớ trả tiền."]
    ],
    thuy:[
      ["Chị Thảo hôm nay đẹp quá.", "Hôm qua em cũng nói vậy."],
      ["Chị ăn tối chưa?", "Em tới mua cho em mà ngày nào cũng hỏi chị ăn chưa vậy?"],
      ["Em ghé vì nhớ— nhớ cá viên.", "Ờ."],
      ["Em mới tới hồi trưa mà giờ lại đói.", "Em mới ăn hai phần."],
      ["Tóc chị hôm nay khác một chút đúng không?", "Em quan sát quầy hay quan sát chị vậy?"],
      ["Poster của quầy được nhiều tim lắm chị.", "Cảm ơn trưởng ban truyền thông tự phong."],
      ["Hôm nay CLB em chạy sự kiện tốt lắm.", "Vậy tự thưởng một phần đi."],
      ["Mai chị có bán không?", "Có. Em tới ăn hay tới gặp chị?"]
    ],
    khanh:[
      ["Hôm nay em giảm ăn.", "Thiệt?"],
      ["Chị nói thiệt đi, phần này là phần thường hay phần thử lòng người?", "Em gọi trước rồi chị trả lời."],
      ["Em vừa ăn mà vẫn thấy đây là một khởi đầu mới.", "Khởi đầu thứ mấy hôm nay?"],
      ["Em tới đánh giá chất lượng định kỳ.", "Đánh giá bằng mấy phần?"],
      ["Một xiên chỉ là lời chào.", "Rồi em chào vừa thôi."]
    ],
    hoc:[
      ["Em đang nạp năng lượng để học.", "Vừa kể vừa order."],
      ["Chị đừng hỏi em học chưa.", "Học chưa?"],
      ["Ăn xong em học thiệt.", "Chị nghe câu này hôm qua rồi."],
      ["Em đang tối ưu lịch ôn.", "Tối ưu tới lúc nào mới mở sách?"],
      ["Hôm nay em nghiêm túc.", "Tuần thi có khác."]
    ],
    tho:[
      ["Chào em. Chị kiểm tra một chút.", "...dạ."],
      ["Cho chị một phần.", "Hôm nay không kiểm tra hả chị?"],
      ["Hôm nay chị tới ăn.", "Em có giấy tờ đầy đủ!"],
      ["Dầu này dùng lâu rồi đó em.", "Em thay ngay sau mẻ này ạ."],
      ["Khu chế biến gọn đó.", "Dạ, vậy cho chị một phần luôn nha."]
    ],
    trang:[
      ["Trân tới chưa chị?", "Sao ba đứa không nhắn group?"],
      ["Quý lại nói còn một phút hả chị?", "Nó nói câu đó từ năm phút trước."],
      ["Ba đứa em có group mà không ai đọc.", "Chị bắt đầu hiểu rồi."],
      ["Trân có dặn chị chuyện gì không?", "Quầy chị chỉ nhận order."],
      ["Hôm nay em ăn một mình.", "Câu này chị chưa tin lắm."]
    ],
    tran:[
      ["Lát Trang hỏi thì chị đừng nói em ăn trước nha.", "Chị đang bán đồ ăn hay giữ bí mật vậy?"],
      ["Chuyện này đừng lên group nha chị.", "Chị còn không ở trong group."],
      ["Quý với Trang chưa tới đúng không?", "Em hỏi hơi nhanh đó."],
      ["Em mua mang về cho bạn nên không tính là ăn trước.", "Lý luận sáng tạo ghê."],
      ["Em không giấu gì hết.", "Chị chưa hỏi mà."]
    ],
    quy:[
      ["Chị làm nhanh, em còn đúng một phút!", "Em nói câu đó mỗi ngày."],
      ["Trang với Trân tới chưa chị?", "Ba đứa có group mà?"],
      ["Em không trễ, đồng hồ chạy sớm.", "Rồi vừa chạy vừa order đi."],
      ["Cho em món cầm chạy được.", "Món nào em cũng cầm chạy hết."],
      ["Hôm nay em tới sớm hơn hai giây.", "Tiến bộ đáng ghi nhận."]
    ],
    vu:[
      ["Chị, Hân có ghé chưa?", "Em hỏi để làm gì?"],
      ["Hân đâu rồi chị?", "Chưa tới."],
      ["Hôm nay—", "Hân chưa tới."],
      ["Hân đâu rồi?", "Mới đi hai phút."],
      ["Em có hỏi Hân đâu.", "Ừ." ]
    ],
    han:[
      ["Chị, hôm nay em muốn tự chọn một món mới.", "Được, không ai chọn giùm em hết."],
      ["Em vừa nộp xong hồ sơ ngành em thích.", "Vậy ăn mừng trước đi."],
      ["Ở đây ồn mà dễ chịu ghê.", "Quầy vỉa hè mà yên quá mới lạ."],
      ["Nãy Vũ có ghé không chị?", "Có."],
      ["Nó hỏi em chứ gì?", "Em biết mà." ]
    ],
    "thay-minh":[["Thầy chỉ quan sát khu vực thôi.", "Dạ."], ["...cho thầy một phần.", "Em biết ngay mà."]],
    "co-lan":[["Cho cô ba phần. Cô quay lại sau bảy phút.", "Dạ, đúng bảy phút luôn hả cô?"], ["Bảy phút rồi.", "Cô đúng giờ thiệt."]],
    "thay-phong":[["Xác suất món của thầy bị cháy là bao nhiêu?", "Thấp ạ."], ["Thấp là bao nhiêu phần trăm?", "Thầy gọi món trước giúp em."]],
    "co-mai":[["Cá viên hôm nay vàng đều như một buổi chiều tháng ba.", "Dạ... cô ăn cay không cô?"]],
    "co-linh":[["Cho cô một phần. Spicy but not too spicy nha.", "Dạ, em hiểu chữ not rồi cô."]],
    "thay-khoi":[["Phản ứng nâu hóa hôm nay đều đó.", "Dạ, thầy đừng biến chảo em thành phòng lab nha."]],
    "thay-tung":[["Dương nói code lỗi.", "Thầy coi giúp chưa ạ?"], ["Ăn xong sửa.", "Hai thầy trò giống nhau ghê."]],
    "co-huong":[["Cô đứng chờ con thôi.", "Dạ."], ["Thôi cho cô một phần.", "Em biết ngay mà."]],
    "chu-thanh":[["Mấy món chiên ăn nhiều không tốt.", "Dạ."], ["...cho chú hai phần.", "Một phần cho con chú đúng không?" ]],
    "chu-sau":[["Chút nữa Khánh chạy tới cho coi.", "Chú đoán lần nào cũng đúng."], ["Chiều coi bộ mưa à nghen.", "Vậy con kéo bạt sớm."]],
    "chi-hong":[["Chị đang nghiên cứu thị trường.", "Ba ngày liên tục rồi đó chị."], ["Khách khó lắm đó em.", "Vậy chị thử một phần nữa đi."]]
  });

  const POST_CORRECT = Object.freeze({
    duong:["Response time tốt đó chị.", "Đúng output rồi."],
    nhan:["Dữ liệu lần này rất thuyết phục.", "Em cần thêm mẫu để xác nhận."],
    thuy:["Chị làm gì cũng nhanh hết á.", "Ngon lắm chị. Chị nhớ ăn tối nha."],
    vu:["Đúng món rồi. À... Hân chưa tới hả chị?", "Cảm ơn chị. Em ngồi đây một chút thôi."],
    han:["Ngon lắm chị. Hôm nay em chọn đúng.", "Cảm ơn chị, em đi làm việc của em đây."],
    khanh:["Ngon cỡ Poseidon.", "Được. Khởi động xong.", "Phần này đạt chuẩn Khánh."],
    hoc:["Ngon. Giờ em hết lý do chưa học rồi.", "Ăn xong em học thiệt."],
    tho:["Ổn. Gọn và đúng món.", "Cảm ơn em. Hôm nay chị chỉ là khách."],
    trang:["Đúng rồi chị. Em mang phần này đi tìm hai đứa kia."],
    tran:["Chuẩn. Chị nhớ bí mật nha."],
    quy:["Cứu em một buổi đi học đúng giờ!"]
  });

  const POST_WRONG = Object.freeze({
    duong:["Sai output rồi chị."], nhan:["Kết quả không khớp đầu vào."],
    thuy:["Không sao đâu chị, mình làm lại nha."], vu:["...em không gọi cái này."],
    han:["Hình như đơn này không phải của em."], khanh:["Sai món không đáng sợ. Phần ít mới đáng sợ."],
    hoc:["Sai bài— à, sai món rồi chị."], tho:["Mình đối chiếu lại một lần nhé."],
    trang:["Phần này không nằm trong kế hoạch rồi chị."], tran:["Sai rồi, nhưng đừng lấy cớ kể Trang nha."],
    quy:["Sai rồi chị, mà em cũng không kịp cãi."]
  });

  function ensure(save) {
    if (!Array.isArray(save.unlockedCharacters)) save.unlockedCharacters = INITIAL_UNLOCKS.slice();
    if (!save.characterVisits || typeof save.characterVisits !== "object") save.characterVisits = {};
    if (!save.recentOrders || typeof save.recentOrders !== "object") save.recentOrders = {};
    if (!save.characterBook || typeof save.characterBook !== "object") save.characterBook = {};
    if (!save.story || typeof save.story !== "object") save.story = {};
    if (!save.story.flags || typeof save.story.flags !== "object") save.story.flags = {};
    if (!save.story.activeThreads || typeof save.story.activeThreads !== "object") save.story.activeThreads = {};
    if (!Array.isArray(save.story.lastVisitors)) save.story.lastVisitors = [];
    if (!save.story.dialogueSeen || typeof save.story.dialogueSeen !== "object") save.story.dialogueSeen = {};
    INITIAL_UNLOCKS.forEach(function (id) { if (!save.unlockedCharacters.includes(id)) save.unlockedCharacters.push(id); });
    return save;
  }

  function seedForProgress(day, reputation) {
    const mock = { stats:{ totalCustomersServed:Math.max(0, (day - 1) * 3) }, story:{ flags:{ vuAskedAboutHan:day >= 4 ? 2 : 0 } } };
    const ids = INITIAL_UNLOCKS.slice();
    Object.keys(UNLOCK_RULES).forEach(function (id) { if (CVVH.Characters.getById(id) && UNLOCK_RULES[id](mock, day, reputation)) ids.push(id); });
    return Array.from(new Set(ids));
  }

  function updateUnlocks(save, day, reputation) {
    ensure(save);
    const unlocked = [];
    Object.keys(UNLOCK_RULES).forEach(function (id) {
      if (CVVH.Characters.getById(id) && !save.unlockedCharacters.includes(id) && UNLOCK_RULES[id](save, day, reputation)) {
        save.unlockedCharacters.push(id);
        save.characterBook[id] = save.characterBook[id] || { unlockedAtDay:day, updated:true };
        unlocked.push(id);
      }
    });
    return unlocked;
  }

  function knows(characterId, otherId) {
    if (characterId === otherId) return true;
    const relation = KNOWLEDGE[characterId] && KNOWLEDGE[characterId][otherId];
    if (relation === "stranger") return false;
    if (relation) return true;
    const character = CVVH.Characters.getById(characterId);
    return Boolean(character && character.relations && character.relations.includes(otherId));
  }

  function eligible(save, day, eventId) {
    ensure(save);
    return save.unlockedCharacters.map(function (id) { return CVVH.Characters.getById(id); }).filter(function (character) {
      if (!character) return false;
      if (character.id === "anh-bon-ba-bay") return day >= 8 && (eventId === "rain" || Math.random() < .22);
      return true;
    });
  }

  function chooseCharacter(save, day, event, random) {
    const rng = random || Math.random;
    const pool = eligible(save, day, event.id);
    if (!pool.length) return CVVH.Characters.getById("khanh");
    const last = save.story.lastVisitors[save.story.lastVisitors.length - 1];
    const weighted = pool.map(function (character) {
      let weight = (save.characterVisits[character.id] || 0) === 0 ? 1.8 : 1;
      if (character.id === last) weight *= .18;
      if (character.id === "khanh") weight *= 2.65;
      if (character.id === "vu" && !save.unlockedCharacters.includes("han")) weight *= 2.4;
      if (character.id === "han" && (save.characterVisits.han || 0) < 2) weight *= 2;
      if (character.id === "tho" && Number(save.story.flags.foodSafetyProgress || 0) < 2) weight *= 1.7;
      if (character.id === "chi-hong" && Number(save.story.flags.rivalProgress || 0) < 3) weight *= 1.55;
      if (event.id === "exams" && character.id === "hoc") weight *= 2;
      if (event.id === "rain" && character.id === "chu-sau") weight *= 1.6;
      return { character:character, weight:weight };
    });
    let roll = rng() * weighted.reduce(function (sum, item) { return sum + item.weight; }, 0);
    for (const item of weighted) { roll -= item.weight; if (roll <= 0) return item.character; }
    return weighted[weighted.length - 1].character;
  }

  function orderSignature(order) { return order.items.slice().sort().join("+") + "|" + order.sauce + "|" + (order.drink || "none"); }

  function generateOrder(save, character, day, availableFoods, maxItems, random, tutorialOrder) {
    ensure(save);
    const rng = random || Math.random;
    if (tutorialOrder) return { items:["ca-vien"], sauce:"tuong-ot", drink:"none" };
    const history = save.recentOrders[character.id] || [];
    let candidate = null;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      candidate = CVVH.Orders.generate(day, availableFoods, maxItems, rng, false);
      let desired = candidate.items.length;
      if (character.id === "khanh") desired = Math.min(maxItems, Math.max(desired, 3 + (rng() > .72 ? 1 : 0)));
      else if (character.id === "duong" && rng() > .35) desired = Math.min(maxItems, Math.max(desired, 2));
      else if ((character.portionSizeWeight === "group" || character.id === "co-lan") && rng() > .55) desired = Math.min(maxItems, Math.max(desired, 3));
      while (candidate.items.length < desired) candidate.items.push(availableFoods[Math.floor(rng() * availableFoods.length)].id);
      if (character.preferredSauce && rng() < .28) candidate.sauce = character.preferredSauce;
      if (character.id === "khanh" && candidate.drink === "none" && rng() < .82) {
        const drinks = CVVH.Config.DRINKS.filter(function (drink) { return drink.id !== "none" && drink.unlockDay <= day; });
        if (drinks.length) candidate.drink = drinks[Math.floor(rng() * drinks.length)].id;
      }
      if (!history.includes(orderSignature(candidate))) break;
    }
    return candidate;
  }

  function recordOrder(save, characterId, order) {
    ensure(save);
    const history = save.recentOrders[characterId] || [];
    history.push(orderSignature(order));
    save.recentOrders[characterId] = history.slice(-5);
  }

  function recordVisit(save, characterId) {
    ensure(save);
    save.characterVisits[characterId] = (save.characterVisits[characterId] || 0) + 1;
    save.story.lastVisitors.push(characterId);
    save.story.lastVisitors = save.story.lastVisitors.slice(-5);
    save.characterBook[characterId] = save.characterBook[characterId] || { unlockedAtDay:save.currentDay, updated:false };
    save.characterBook[characterId].visits = save.characterVisits[characterId];
  }

  function pickIndex(save, key, length) {
    const previous = Number(save.story.dialogueSeen[key]);
    let index = Math.floor(Math.random() * length);
    if (length > 1 && index === previous) index = (index + 1) % length;
    save.story.dialogueSeen[key] = index;
    return index;
  }

  function line(speaker, text, avatar) { return { speaker:speaker, text:text, avatar:avatar || (speaker === "Thảo" ? "./assets/ui/cart.svg" : "") }; }

  function preOrderDialogue(save, character, event) {
    ensure(save);
    const visits = save.characterVisits[character.id] || 0;
    let pool = PRE_DIALOGUE[character.id];
    if (character.id === "thuy" && Math.random() > .72) pool = [[CVVH.Characters.pickDialogue(character, event.id === "exams" ? "exams" : "normal", save), "Kể tiếp sau khi gọi món nha em."]];
    if (character.id === "han" && Number(save.story.flags.vuAskedAboutHan || 0) < 2) pool = pool.slice(0, 3);
    if (character.id === "trang" && save.story.flags.tranAteFirst && !save.story.flags.thaoCoveredForTran) {
      save.story.flags.thaoCoveredForTran = true;
      return [line("Trang", "Trân tới chưa chị?", character.avatar), line("Thảo", "...chưa."), line("Thảo", "Chị vừa nói dối vì tình bạn.")];
    }
    if (!pool || !pool.length) {
      let context = event.id === "rain" ? "rain" : event.id === "exams" ? "exams" : event.id === "graduation" ? "graduation" : (visits <= 1 ? "firstVisit" : "normal");
      if ((save.relationships[character.id] || 0) >= 22 && character.dialogue.highRelationship && Math.random() < .32) context = "highRelationship";
      return [line(character.name, CVVH.Characters.pickDialogue(character, context, save), character.avatar), line("Thảo", "Rồi, vừa kể vừa order nha.")];
    }
    let index = visits <= 1 ? 0 : pickIndex(save, character.id + ":pre", pool.length);
    if (character.id === "vu") {
      const progress = Number(save.story.flags.vuAskedAboutHan || 0);
      index = progress < pool.length ? progress : 2 + pickIndex(save, character.id + ":vu-late", pool.length - 2);
      save.story.flags.vuAskedAboutHan = progress + 1;
      save.story.activeThreads.vuHan = Math.min(7, progress + 1);
    }
    if (character.id === "tran") save.story.flags.tranAteFirst = true;
    if (character.id === "thuy") save.story.activeThreads.thuyThao = Math.min(5, Math.ceil(visits / 2));
    if (character.id === "tho") save.story.flags.foodSafetyProgress = Math.min(5, Number(save.story.flags.foodSafetyProgress || 0) + 1);
    if (character.id === "chi-hong") save.story.flags.rivalProgress = Math.min(5, Number(save.story.flags.rivalProgress || 0) + 1);
    const chosen = pool[index];
    return [line(character.name, chosen[0], character.avatar), line("Thảo", chosen[1])];
  }

  function postServiceDialogue(save, character, correct, patienceRatio) {
    ensure(save);
    const map = correct ? POST_CORRECT : POST_WRONG;
    const pool = map[character.id];
    let text;
    if (pool && pool.length) text = pool[pickIndex(save, character.id + (correct ? ":post-ok" : ":post-wrong"), pool.length)];
    else {
      const context = correct ? (patienceRatio > .7 ? "fastService" : patienceRatio < .3 ? "slowService" : "normal") : "wrongOrder";
      text = CVVH.Characters.pickDialogue(character, context, save);
    }
    const lines = [line(character.name, text, character.avatar)];
    if (!correct) lines.push(line("Thảo", "Biết rồi, để chị làm lại."));
    return lines;
  }

  function bonusOrderDialogue(character) {
    return [
      line(character.name, "Chị... làm thêm phần nữa được không?", character.avatar),
      line("Thảo", "Em vừa ăn xong mà?"),
      line(character.name, "Đó là phần trước.", character.avatar)
    ];
  }

  function recordService(save, characterId, correct, fast) {
    ensure(save);
    const item = save.characterBook[characterId] = save.characterBook[characterId] || {};
    item.correctOrders = Number(item.correctOrders || 0) + (correct ? 1 : 0);
    item.wrongOrders = Number(item.wrongOrders || 0) + (correct ? 0 : 1);
    item.fastOrders = Number(item.fastOrders || 0) + (correct && fast ? 1 : 0);
    item.updated = true;
  }

  function unlockDetails(id) {
    const character = CVVH.Characters.getById(id);
    const book = BOOK[id] || {};
    return { id:id, name:character ? character.name : id, avatar:character ? character.avatar : "./assets/ui/cart.svg", tagline:book.tagline || (character ? character.personality : "Một gương mặt mới ghé quầy."), trait:book.trait || "REGULAR STORY" };
  }

  function bookEntries(save) {
    ensure(save);
    return CVVH.Characters.all.map(function (character) {
      const unlocked = save.unlockedCharacters.includes(character.id);
      const points = Number(save.relationships[character.id] || 0);
      const meta = BOOK[character.id] || {};
      let description = meta.description || character.personality;
      if (character.id === "vu" && Number(save.story.flags.vuAskedAboutHan || 0) < 2) description = "Không rõ tại sao cứ hỏi Hân đâu rồi.";
      if (character.id === "thuy" && points < 10) description = "Một khách hàng rất nhiệt tình. Không ai tin em ấy chỉ tới vì cá viên.";
      return { id:character.id, unlocked:unlocked, name:character.name, avatar:character.avatar, description:description, trait:meta.trait || character.runningJoke, visits:Number(save.characterVisits[character.id] || 0), points:points, stage:CVVH.Characters.stage(points), stars:points >= 40 ? 5 : points >= 22 ? 4 : points >= 10 ? 3 : points >= 4 ? 2 : points > 0 ? 1 : 0 };
    });
  }

  CVVH.CharacterSystem = {
    INITIAL_UNLOCKS:INITIAL_UNLOCKS, KNOWLEDGE:KNOWLEDGE, ensure:ensure, seedForProgress:seedForProgress,
    updateUnlocks:updateUnlocks, knows:knows, eligible:eligible, chooseCharacter:chooseCharacter,
    generateOrder:generateOrder, recordOrder:recordOrder, recordVisit:recordVisit,
    preOrderDialogue:preOrderDialogue, postServiceDialogue:postServiceDialogue, bonusOrderDialogue:bonusOrderDialogue, recordService:recordService,
    unlockDetails:unlockDetails, bookEntries:bookEntries, orderSignature:orderSignature
  };
})();
