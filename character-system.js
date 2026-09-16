(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  const INITIAL_UNLOCKS = Object.freeze(["khanh","nhan","trang","tran","quy","chu-sau"]);
  const KNOWLEDGE = Object.freeze({
    "phuoc-nguyen":{ "anh-quan":"best_friend" },
    "anh-quan":{ "phuoc-nguyen":"best_friend" },
    quy:{ trang:"best_friend", tran:"best_friend", vu:"stranger" },
    trang:{ quy:"best_friend", tran:"best_friend", thuy:"friend" },
    tran:{ quy:"best_friend", trang:"best_friend", thuy:"friend" },
    vu:{ han:"crush", duong:"friend" },
    han:{ vu:"schoolmate" },
    duong:{ thuy:"classmate", vu:"friend", "thay-tung":"teacher" },
    thuy:{ duong:"classmate", thao:"crush" },
    nhan:{ "thay-tung":"teacher" },
    "thien-an":{ homi:"soft_spot", "hoang-linh":"friend" },
    "hoang-linh":{ "thien-an":"friend", homi:"rhythm-fan" }
  });

  const BOOK = Object.freeze({
    khanh:{ trait:"BIG APPETITE", tagline:"Em không ăn nhiều. Em chỉ ăn đủ.", description:"Nhà phê bình ẩm thực tự phong; đơn lớn, kiên nhẫn lâu và boa rất hào phóng." },
    nhan:{ trait:"DATA TASTER", tagline:"Cần đủ mẫu trước khi kết luận.", description:"Nữ du học sinh Hong Kong, điềm tĩnh và thích quan sát ẩm thực Biên Hòa." },
    "phuoc-nguyen":{ trait:"ACADEMIC WEAPON", tagline:"Đứng đầu lớp, chọn sốt vẫn cần suy nghĩ.", description:"Học rất giỏi, hài khô và là bạn thân lâu năm của Anh Quân." },
    "anh-quan":{ trait:"DAMAGE CONTROL", tagline:"Best Friend Duty đang hoạt động.", description:"Thoải mái, nhanh trí; chuyên kéo Phước Nguyên ra khỏi bàn học đúng lúc." },
    "thien-an":{ trait:"TOUGH OUTSIDE", tagline:"Mặt lạnh, lòng không lạnh.", description:"Ít nói và trông dữ, nhưng Homi luôn làm lộ phần dịu dàng của Thiên Ân." },
    "hoang-linh":{ trait:"DRUM ROLL", tagline:"Một hai ba bốn — tới lượt gọi món.", description:"Tay trống đầy năng lượng; đôi khi kéo cả một ngày hội nhạc tới đầu hẻm." },
    an:{ trait:"FULL COURT", tagline:"Phần vừa của người mới tập xong.", description:"Nam sinh tóc xoăn chơi bóng rổ, kỷ luật, thân thiện và luôn đói sau buổi tập." },
    duong:{ trait:"TECH TALK", tagline:"Học IT và hay hỏi hôm nay có ai xinh ghé.", description:"Bạn cùng lớp Thủy; vui tính, xã giao và dùng đồ chiên để restore system." },
    thuy:{ trait:"OBVIOUS CRUSH", tagline:"Ai cũng biết em thích chị Thảo.", description:"Nam sinh IT hiền, bạn cùng lớp Dương, thường viện cớ ghé quầy để gặp Thảo." },
    han:{ trait:"QUIETLY SHARP", tagline:"Tự chọn đường đi của mình.", description:"Điềm tĩnh, độc lập và có câu chuyện riêng ngoài việc Vũ thích mình." },
    vu:{ trait:"HÂN ĐÂU RỒI?", tagline:"Hệ thống mất ổn định khi nhắc Hân.", description:"Tranh biện tốt, riêng chủ đề Hân thì thường quên hết luận điểm." },
    quy:{ trait:"ONE MINUTE LEFT", tagline:"Lúc nào cũng còn đúng một phút.", description:"Bạn thân Trang và Trân; rất quen chạy trễ và không quen Vũ từ trước." },
    trang:{ trait:"BEST FRIEND", tagline:"Một phần của bộ ba Quý–Trang–Trân.", description:"Thẳng thắn, nhanh nhẹn và luôn biết hai bạn thân đang giấu chuyện gì." },
    tran:{ trait:"SECRET KEEPER?", tagline:"Bí mật tồn tại khoảng ba phút.", description:"Lém lỉnh, tình cảm và hay ăn trước khi gọi hội bạn." },
    hoc:{ trait:"STUDY PENDING", tagline:"Tên là Học. Học sau khi ăn.", description:"Tinh nghịch, hay trì hoãn nhưng nghiêm túc hơn trong tuần thi." },
    tho:{ trait:"FOOD SAFETY", tagline:"Hôm nay chị chỉ tới ăn.", description:"Cán bộ kiểm tra hư cấu, chuyên nghiệp và dần thành khách quen." },
    "thay-minh":{ trait:"JUST INSPECTING", tagline:"Thầy chỉ quan sát khu vực thôi.", description:"Hiệu trưởng hư cấu, trang trọng và bí mật thích đồ ăn đường phố." },
    "co-lan":{ trait:"EXACTLY ON TIME", tagline:"Cô quay lại sau đúng bảy phút.", description:"Phó hiệu trưởng hư cấu, chính xác và rất có tổ chức." },
    "thay-phong":{ trait:"PROBABILITY", tagline:"Thấp là bao nhiêu phần trăm?", description:"Giáo viên Toán hư cấu, đánh giá mọi thứ bằng xác suất." },
    "co-linh":{ trait:"NOT TOO SPICY", tagline:"Spicy, but not too spicy.", description:"Giáo viên tiếng Anh hư cấu, vui vẻ và tinh tế." },
    "thay-tung":{ trait:"EAT THEN DEBUG", tagline:"Code lỗi à? Ăn xong sửa.", description:"Giáo viên Tin hư cấu, ít lời và hiểu học sinh." },
    "co-huong":{ trait:"WAITING PARENT", tagline:"Cô chỉ đứng chờ con thôi…", description:"Phụ huynh thân thiện, nói chờ nhưng thường mua hai phần." },
    "chu-thanh":{ trait:"ONE EXCEPTION", tagline:"Món chiên không tốt… cho chú hai phần.", description:"Phụ huynh nghiêm ngoài mặt nhưng thương con." },
    "chu-sau":{ trait:"RUSH FORECAST", tagline:"Chút nữa Khánh chạy tới cho coi.", description:"Bảo vệ trường hư cấu, thuộc nhịp cả khu phố." },
    "chi-hong":{ trait:"MARKET RESEARCH", tagline:"Đối thủ chứ không phải kẻ thù.", description:"Chủ quầy bên cạnh, cạnh tranh vui vẻ rồi hợp tác." },
    "bac-tu":{ trait:"NEIGHBORHOOD MEMORY", tagline:"Khúc đường này thay đổi nhiều.", description:"Người trong xóm hay mua mang về cho cháu." },
    "anh-bon-ba-bay":{ trait:"4:37 SHARP", tagline:"Anh tới sớm một phút.", description:"Cựu học sinh kín tiếng, xuất hiện gần đúng 4:37." },
    homi:{ trait:"STALL MASCOT", tagline:"Gâu! Quầy mở rồi.", description:"Corgi trực quầy, phản ứng với khách và thời tiết; không bao giờ gọi hay ăn đồ chiên." }
  });

  const UNLOCK_RULES = Object.freeze({
    "phuoc-nguyen":function (s,d) { return d >= 2; },
    duong:function (s,d) { return d >= 2; },
    "co-huong":function (s,d) { return d >= 2; },
    "bac-tu":function (s,d) { return d >= 2; },
    "anh-quan":function (s,d) { return d >= 3 && ((s.characterVisits["phuoc-nguyen"] || 0) >= 1 || d >= 4); },
    vu:function (s,d) { return d >= 3; },
    hoc:function (s,d) { return d >= 3; },
    thuy:function (s,d) { return d >= 4; },
    "thien-an":function (s,d) { return d >= 5; },
    "co-lan":function (s,d) { return d >= 5; },
    "co-linh":function (s,d) { return d >= 5; },
    "thay-phong":function (s,d) { return d >= 5; },
    an:function (s,d) { return d >= 6; },
    "thay-tung":function (s,d) { return d >= 6; },
    tho:function (s,d,r) { return d >= 6 && (r >= 64 || d >= 8); },
    "hoang-linh":function (s,d) { return d >= 8; },
    han:function (s,d) { return d >= 8 && (Number(s.story.flags.vuAskedAboutHan || 0) >= 2 || d >= 10); },
    "thay-minh":function (s,d,r) { return d >= 9 && r >= 66; },
    "chu-thanh":function (s,d) { return d >= 9; },
    "chi-hong":function (s,d,r) { return d >= 9 && (r >= 66 || s.stats.totalCustomersServed >= 20); },
    homi:function (s,d) { return d >= 10 && ((s.characterVisits["thien-an"] || 0) >= 1 || d >= 12); },
    "anh-bon-ba-bay":function (s,d) { return d >= 13; }
  });

  const PRE_DIALOGUE = Object.freeze({
    khanh:[["Hôm nay em giảm ăn.","Thiệt?"],["Một xiên chỉ là lời chào.","Rồi em chào vừa thôi."],["Em tới đánh giá định kỳ.","Đánh giá bằng mấy phần?"],["Phần này là phần thường hả chị?","Em gọi trước đi rồi biết."],["Em vừa ăn mà vẫn thấy đây là khởi đầu.","Khởi đầu thứ mấy hôm nay?"]],
    nhan:[["Ở Hong Kong cũng có fish ball, nhưng kiểu này khác.","Khác sao?"],["Em cần thêm một mẫu.","Nghe giống lý do ăn tiếp."],["Hôm nay em thu thập dữ liệu.","Dữ liệu tính theo xiên hả?"],["Biên Hòa nóng hơn em tưởng.","Đồ ăn thì sao?"],["Sốt ở đây rất Việt Nam.","Vậy thử thêm nha."]],
    "phuoc-nguyen":[["Em giải xong đề rồi.","Vậy giải tiếp bài toán chọn món."],["Anh Quân bảo em nghỉ năm phút.","Bạn tốt đó."],["Điểm mười không giúp chọn sốt.","Chọn bằng khẩu vị đi em."],["Em tới đúng giờ.","Hiếm hơn điểm mười hả?"],["Anh Quân sắp tới dọn tình huống.","Em lại gây gì rồi?"]],
    "anh-quan":[["Phước Nguyên có nói gì nghiêm trọng không?","Chưa, nó chỉ chọn sốt lâu."],["Em tới làm damage control.","Đổi lại một phần nha."],["Bạn em đang học quá nhiều.","Kéo nó đi ăn đúng rồi."],["Best Friend Duty hôm nay bận.","Vừa làm nhiệm vụ vừa order."],["Nó đứng đầu lớp, em đứng đầu đội cứu hộ.","Chị ghi nhận."]],
    "thien-an":[["Đừng cho Homi ăn đồ chiên.","Chị biết, để nước sạch thôi."],["Nó nhìn vậy thôi, anh không mềm lòng đâu.","Tai anh đỏ kìa."],["Cho anh phần nóng.","Rồi, ít nói nhiều món."],["Homi đâu rồi? Anh hỏi để coi quầy thôi.","Ừ."],["Hoàng Linh đánh trống nghe tới đây.","Anh nghe kỹ ghê."]],
    "hoang-linh":[["Mai tụi em diễn đầu hẻm nha.","Vậy mai quầy chuẩn bị đông."],["Một hai ba bốn— tới lượt em.","Vừa gõ vừa order nha."],["Chảo kêu đúng tempo đó.","Em đừng sample tiếng chảo nha."],["Homi vẫy đuôi đúng nhịp.","Fan đầu tiên của em đó."],["Cho em phần giòn nhất.","Có âm thanh luôn."]],
    an:[["Em vừa tập full court xong.","Vậy phần vừa của em là mấy món?"],["Hôm nay ném rổ ổn lắm chị.","Tự thưởng đi."],["Em gọi vừa đủ thôi.","Chị đã chuẩn bị khay."],["Hoàng Linh gõ nhịp cổ vũ vui ghê.","Đội em thích là được."],["Cho em phần phục hồi.","Đúng bài sau tập."]],
    duong:[["Nay có bạn nào xinh ghé không chị?","Em tới ăn hay thống kê?"],["Em đang restore system.","Restore xong nhớ trả tiền."],["Thủy đâu rồi chị?","Em nhắn bạn cùng lớp đi."],["Hôm nay server ổn không?","Chảo vẫn chạy."],["Em tới ăn thôi, thiệt.","Chị có hỏi đâu."]],
    thuy:[["Chị Thảo hôm nay đẹp quá.","Hôm qua em cũng nói vậy."],["Em ghé vì nhớ— nhớ cá viên.","Ờ."],["Dương nói em lộ quá.","Nó nói đúng."],["Mai chị có bán không?","Em tới ăn hay gặp chị?"],["Tóc chị khác một chút đúng không?","Em nhìn quầy hay nhìn chị?"]],
    vu:[["Chị, Hân có ghé chưa?","Em hỏi để làm gì?"],["Hân đâu rồi chị?","Chưa tới."],["Hôm nay—","Hân chưa tới."],["Em có hỏi Hân đâu.","Ừ."],["Em sẽ nói thẳng.","Không cần ba luận điểm nha."]],
    han:[["Hôm nay em tự chọn một món mới.","Được, không ai chọn giùm em."],["Em nộp hồ sơ ngành em thích rồi.","Vậy ăn mừng trước đi."],["Ở đây ồn mà dễ chịu.","Quầy vỉa hè mà."],["Vũ có ghé thì cũng kệ nó.","Chị chưa nhắc Vũ."],["Em biết mình muốn gì rồi.","Vậy là tốt."]],
    "thay-phong":[["Xác suất món bị cháy là bao nhiêu?","Thấp ạ."],["Thấp là bao nhiêu phần trăm?","Thầy gọi món trước đi ạ."]],
    "co-linh":[["Spicy but not too spicy nha.","Dạ, em hiểu chữ not rồi cô."]],
    "thay-tung":[["Dương nói code lỗi.","Thầy coi giúp chưa ạ?"],["Ăn xong sửa.","Hai thầy trò giống nhau ghê."]],
    "chu-sau":[["Chút nữa Khánh chạy tới cho coi.","Chú đoán lần nào cũng đúng."],["Chiều coi bộ mưa à nghen.","Vậy con kéo bạt sớm."]]
  });

  const POST_CORRECT = Object.freeze({
    khanh:["Ngon cỡ Poseidon.","Được. Khởi động xong.","Phần này đạt chuẩn Khánh."],
    nhan:["Dữ liệu lần này thuyết phục.","Em cần thêm mẫu để xác nhận."],
    "phuoc-nguyen":["Đáp án đúng và giòn.","Anh Quân sẽ duyệt phần này."],
    "anh-quan":["Damage controlled.","Best Friend Duty hoàn thành."],
    "thien-an":["Gọn. Được.","Homi mà ngửi thấy chắc chạy ra."],
    "hoang-linh":["Chuẩn tempo!","Giòn đúng nhịp."],
    an:["Đủ sức chạy full court.","Đúng phần phục hồi."],
    duong:["Response time tốt.","Đúng output rồi."],
    thuy:["Ngon lắm chị. Chị nhớ ăn tối nha.","Chị làm gì cũng nhanh."],
    vu:["Đúng món rồi. À… Hân chưa tới hả?"],
    han:["Ngon lắm chị. Hôm nay em chọn đúng."],
    quy:["Cứu em một buổi đúng giờ!"]
  });
  const POST_WRONG = Object.freeze({
    khanh:["Sai món không đáng sợ. Phần ít mới đáng sợ."],
    "phuoc-nguyen":["Kết quả chưa khớp đề bài."],
    "anh-quan":["Tình huống này cần damage control."],
    "thien-an":["Không đúng. Làm lại giúp anh."],
    "hoang-linh":["Lệch nhịp rồi chị."],
    an:["Sai chiến thuật rồi chị."],
    nhan:["Dữ liệu không khớp đơn em gọi."],
    duong:["Sai output rồi chị."],
    thuy:["Không sao, mình làm lại nha chị."],
    han:["Hình như đơn này không phải của em."]
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
    const mock = { stats:{ totalCustomersServed:Math.max(0,(day - 1) * 8) }, characterVisits:{ "phuoc-nguyen":2, "thien-an":2 }, story:{ flags:{ vuAskedAboutHan:day >= 8 ? 2 : 0 } } };
    const ids = INITIAL_UNLOCKS.slice();
    Object.keys(UNLOCK_RULES).forEach(function (id) {
      if (UNLOCK_RULES[id](mock, day, reputation)) ids.push(id);
    });
    return Array.from(new Set(ids));
  }

  function updateUnlocks(save, day, reputation) {
    ensure(save);
    const unlocked = [];
    Object.keys(UNLOCK_RULES).forEach(function (id) {
      if (!save.unlockedCharacters.includes(id) && UNLOCK_RULES[id](save, day, reputation)) {
        save.unlockedCharacters.push(id);
        save.characterBook[id] = save.characterBook[id] || { unlockedAtDay:day, updated:true };
        if (id === "homi") save.story.flags.homiUnlocked = true;
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
      if (!character || character.id === "khanh") return false;
      if (character.id === "anh-bon-ba-bay") return day >= 13 && (eventId === "rain" || Math.random() < .22);
      return true;
    });
  }

  function chooseCharacter(save, day, event, random) {
    const rng = random || Math.random;
    const pool = eligible(save, day, event.id);
    if (!pool.length) return CVVH.Characters.getById("nhan");
    const recent = save.story.lastVisitors.slice(-3);
    const weighted = pool.map(function (character) {
      let weight = (save.characterVisits[character.id] || 0) === 0 ? 2 : 1;
      if (recent.includes(character.id)) weight *= .22;
      if (character.id === "vu" && !save.unlockedCharacters.includes("han")) weight *= 1.8;
      if (event.id === "exams" && ["hoc","phuoc-nguyen"].includes(character.id)) weight *= 1.8;
      if (event.id === "music-event" && character.id === "hoang-linh") weight *= 2.2;
      if (event.id === "sports" && character.id === "an") weight *= 2;
      return { character:character, weight:weight };
    });
    let roll = rng() * weighted.reduce(function (sum,item) { return sum + item.weight; },0);
    for (const item of weighted) { roll -= item.weight; if (roll <= 0) return item.character; }
    return weighted[weighted.length - 1].character;
  }

  function chooseVisitor(save, day, event, random) {
    const rng = random || Math.random;
    if (day >= 4 && rng() >= CVVH.Config.BALANCE.namedCustomerRate) {
      const variants = CVVH.Characters.genericVariants;
      return variants[Math.floor(rng() * variants.length)];
    }
    return chooseCharacter(save, day, event, rng);
  }

  function orderSignature(order) {
    return order.items.slice().sort().join("+") + "|" + order.sauce + "|" + (order.drink || "none");
  }

  function generateOrder(save, character, day, availableFoods, maxItems, random, tutorialOrder) {
    ensure(save);
    const rng = random || Math.random;
    if (tutorialOrder) return { items:["ca-vien"], sauce:"tuong-ot", drink:"none" };
    if (!character || character.isMascot) throw new Error("Mascot cannot place food orders.");
    const history = character.isGeneric ? [] : (save.recentOrders[character.id] || []);
    let candidate = null;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      candidate = CVVH.Orders.generate(day, availableFoods, maxItems, rng, false);
      let desired = candidate.items.length;
      if (character.id === "khanh") desired = Math.min(maxItems, Math.max(desired, 3 + (rng() > .58 ? 1 : 0) + (rng() > .84 ? 1 : 0)));
      else if (character.id === "an") desired = Math.min(maxItems, Math.max(desired, 2 + (rng() > .65 ? 1 : 0)));
      else if (character.portionSizeWeight === "group") desired = Math.min(maxItems, Math.max(desired, 3));
      else if (character.portionSizeWeight === "large" || character.portionSizeWeight === "athlete") desired = Math.min(maxItems, Math.max(desired, 2));
      while (candidate.items.length < desired) candidate.items.push(availableFoods[Math.floor(rng() * availableFoods.length)].id);
      if (character.preferredSauce && CVVH.Config.SAUCES.some(function (s) { return s.id === character.preferredSauce && s.unlockDay <= day; }) && rng() < .28) candidate.sauce = character.preferredSauce;
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
    if (!CVVH.Characters.getById(characterId)) return;
    const history = save.recentOrders[characterId] || [];
    history.push(orderSignature(order));
    save.recentOrders[characterId] = history.slice(-5);
  }

  function recordVisit(save, characterId) {
    ensure(save);
    if (!CVVH.Characters.getById(characterId)) return;
    save.characterVisits[characterId] = (save.characterVisits[characterId] || 0) + 1;
    save.story.lastVisitors.push(characterId);
    save.story.lastVisitors = save.story.lastVisitors.slice(-5);
    save.characterBook[characterId] = save.characterBook[characterId] || { unlockedAtDay:save.currentDay, updated:false };
    save.characterBook[characterId].visits = save.characterVisits[characterId];
  }

  function pickIndex(save,key,length) {
    const previous = Number(save.story.dialogueSeen[key]);
    let index = Math.floor(Math.random() * length);
    if (length > 1 && index === previous) index = (index + 1) % length;
    save.story.dialogueSeen[key] = index;
    return index;
  }
  function line(speaker,text,avatar) { return { speaker:speaker, text:text, avatar:avatar || (speaker === "Thảo" ? "./assets/ui/cart.svg" : "") }; }

  function preOrderDialogue(save, character, event) {
    ensure(save);
    if (character.isGeneric) return [line(character.name,CVVH.Characters.pickDialogue(character,"normal",save),character.avatar),line("Thảo","Rồi, mình xem đơn nha.")];
    const pool = PRE_DIALOGUE[character.id];
    const visits = save.characterVisits[character.id] || 0;
    if (character.id === "phuoc-nguyen") save.story.flags.phuocMentionedQuan = true;
    if (character.id === "anh-quan") { save.story.flags.quanDamageControl = true; save.story.activeThreads.bestFriendDuty = 1; }
    if (character.id === "thien-an") save.story.activeThreads.homiSoftSide = Math.min(5,Number(save.story.activeThreads.homiSoftSide || 0) + 1);
    if (character.id === "hoang-linh" && !save.story.flags.musicEventDay) save.story.flags.musicEventDay = save.currentDay + 1;
    if (character.id === "vu") save.story.flags.vuAskedAboutHan = Number(save.story.flags.vuAskedAboutHan || 0) + 1;
    if (character.id === "thuy") save.story.activeThreads.thuyThao = Math.min(5,Math.ceil((visits + 1) / 2));
    if (!pool || !pool.length) {
      const context = event.id === "rain" ? "rain" : event.id === "exams" ? "exams" : visits <= 1 ? "firstVisit" : "normal";
      return [line(character.name,CVVH.Characters.pickDialogue(character,context,save),character.avatar),line("Thảo","Rồi, vừa kể vừa order nha.")];
    }
    const chosen = pool[visits <= 1 ? 0 : pickIndex(save,character.id + ":pre",pool.length)];
    return [line(character.name,chosen[0],character.avatar),line("Thảo",chosen[1])];
  }

  function postServiceDialogue(save, character, correct, patienceRatio) {
    ensure(save);
    const pool = (correct ? POST_CORRECT : POST_WRONG)[character.id];
    let text;
    if (pool && pool.length) text = pool[pickIndex(save,character.id + (correct ? ":post-ok" : ":post-wrong"),pool.length)];
    else {
      const context = correct ? (patienceRatio > .7 ? "fastService" : patienceRatio < .3 ? "slowService" : "normal") : "wrongOrder";
      text = CVVH.Characters.pickDialogue(character,context,save);
    }
    const lines = [line(character.name,text,character.avatar)];
    if (!correct) lines.push(line("Thảo","Biết rồi, để chị làm lại."));
    return lines;
  }
  function bonusOrderDialogue(character) {
    return [line(character.name,"Chị… làm thêm phần nữa được không?",character.avatar),line("Thảo","Em vừa ăn xong mà?"),line(character.name,"Đó là phần trước.",character.avatar)];
  }
  function recordService(save,characterId,correct,fast) {
    ensure(save);
    if (!CVVH.Characters.getById(characterId)) return;
    const item = save.characterBook[characterId] = save.characterBook[characterId] || {};
    item.correctOrders = Number(item.correctOrders || 0) + (correct ? 1 : 0);
    item.wrongOrders = Number(item.wrongOrders || 0) + (correct ? 0 : 1);
    item.fastOrders = Number(item.fastOrders || 0) + (correct && fast ? 1 : 0);
    item.updated = true;
  }
  function unlockDetails(id) {
    const character = CVVH.Characters.getCollectibleById(id);
    const book = BOOK[id] || {};
    return { id:id, name:character ? character.name : id, avatar:character ? character.avatar : "./assets/ui/cart.svg", tagline:book.tagline || character.personality, trait:book.trait || "REGULAR STORY" };
  }
  function bookEntries(save) {
    ensure(save);
    return CVVH.Characters.all.concat([CVVH.Characters.mascot]).map(function (character) {
      const unlocked = save.unlockedCharacters.includes(character.id);
      const points = Number(save.relationships[character.id] || 0);
      const meta = BOOK[character.id] || {};
      return { id:character.id, unlocked:unlocked, name:character.name, avatar:character.avatar, description:meta.description || character.personality, trait:meta.trait || character.runningJoke, visits:Number(save.characterVisits[character.id] || 0), points:points, stage:CVVH.Characters.stage(points), stars:character.isMascot ? (unlocked ? 5 : 0) : points >= 40 ? 5 : points >= 22 ? 4 : points >= 10 ? 3 : points >= 4 ? 2 : points > 0 ? 1 : 0 };
    });
  }

  CVVH.CharacterSystem = {
    INITIAL_UNLOCKS:INITIAL_UNLOCKS, KNOWLEDGE:KNOWLEDGE, ensure:ensure, seedForProgress:seedForProgress,
    updateUnlocks:updateUnlocks, knows:knows, eligible:eligible, chooseCharacter:chooseCharacter, chooseVisitor:chooseVisitor,
    generateOrder:generateOrder, recordOrder:recordOrder, recordVisit:recordVisit,
    preOrderDialogue:preOrderDialogue, postServiceDialogue:postServiceDialogue, bonusOrderDialogue:bonusOrderDialogue,
    recordService:recordService, unlockDetails:unlockDetails, bookEntries:bookEntries, orderSignature:orderSignature
  };
})();
