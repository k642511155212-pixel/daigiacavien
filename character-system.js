(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  const INITIAL_UNLOCKS = Object.freeze(["khanh","nhan","trang","tran","quy","chu-sau"]);
  const KNOWLEDGE = Object.freeze({
    quy:{trang:"best_friend",tran:"best_friend",vu:"stranger"},
    trang:{quy:"best_friend",tran:"best_friend",thuy:"friend"},
    tran:{quy:"best_friend",trang:"best_friend",thuy:"friend"},
    "phuoc-nguyen":{"anh-quan":"best_friend"},
    "anh-quan":{"phuoc-nguyen":"best_friend"},
    duong:{thuy:"classmate","thay-tung":"teacher",khanh:"friend"},
    thuy:{duong:"classmate",thao:"crush",trang:"friend",tran:"friend"},
    vu:{han:"crush",duong:"friend"},
    han:{vu:"schoolmate"},
    an:{khanh:"friend"},
    nhan:{"thay-tung":"teacher"},
    "thay-tung":{duong:"student",thuy:"student"}
  });

  const BOOK = Object.freeze({
    khanh:{trait:"BIG APPETITE",tagline:"Một phần lớn chỉ là màn khởi động.",description:"Nhà phê bình ẩm thực tự phong, mũm mĩm, ăn khỏe và boa rất hậu hĩnh khi hài lòng."},
    nhan:{trait:"DATA TASTER",tagline:"Du học sinh từ Hong Kong. Cần đủ dữ liệu trước khi kết luận.",description:"Nữ du học sinh điềm tĩnh, hài khô và đang nghiêm túc ‘nghiên cứu’ đồ ăn vặt Việt Nam."},
    trang:{trait:"BEST FRIEND",tagline:"Một phần của bộ ba Quý–Trang–Trân.",description:"Thẳng thắn, trách nhiệm và luôn biết hai bạn thân đang giấu gì."},
    tran:{trait:"SECRET KEEPER?",tagline:"Bí mật thường tồn tại khoảng ba phút.",description:"Lém lỉnh, tinh ý, bạn thân lâu năm của Quý và Trang."},
    quy:{trait:"ONE MINUTE LEFT",tagline:"Lúc nào cũng còn đúng một phút.",description:"Bạn thân của Trang và Trân. Quý không quen Vũ."},
    an:{trait:"FULL COURT",tagline:"Tóc xoăn, bóng rổ và một cái bụng sau giờ tập.",description:"Nam sinh bóng rổ chính hiệu, năng lượng cao và thường gọi phần hơi lớn."},
    duong:{trait:"TECH TALK",tagline:"Học IT. Hay hỏi hôm nay có bạn nào xinh ghé.",description:"Bạn cùng lớp Thủy, thích code, đồ chiên và dữ liệu xã hội hoàn toàn vô hại."},
    thuy:{trait:"VERY SUBTLE",tagline:"Nam sinh IT nói nhớ cá viên. Không ai còn tin.",description:"Bạn cùng lớp Dương. Thủy siêu thích chị Thảo và nghĩ mình giấu khá tốt. Thủy không giấu tốt."},
    vu:{trait:"HÂN ĐÂU RỒI?",tagline:"Bình thường tự nhiên, cho tới khi nhắc Hân.",description:"Vũ có một câu hỏi lặp lại đáng ngờ: Hân đâu rồi?"},
    han:{trait:"QUIETLY SHARP",tagline:"Không hề ngây thơ như Vũ tưởng.",description:"Điềm tĩnh, thân thiện, tinh ý và có câu chuyện riêng ngoài Vũ."},
    hoc:{trait:"STUDY PENDING",tagline:"Tên là Học. Việc học thường bắt đầu sau khi ăn.",description:"Thông minh, trì hoãn và rất tỉnh bơ."},
    "phuoc-nguyen":{trait:"ACADEMIC WEAPON",tagline:"Học giỏi, hài hước, troll bạn bằng vẻ mặt cực tỉnh.",description:"Phước Nguyên học rất giỏi và là bạn thân của Anh Quân."},
    "anh-quan":{trait:"DAMAGE CONTROL",tagline:"Bạn thân của Phước Nguyên. Luôn cảnh báo trước khi biết có chuyện gì.",description:"Thoải mái, nhanh trí, đỡ miếng rất tốt và không chịu thua Nguyên."},
    "thien-an":{trait:"TOUGH OUTSIDE",tagline:"Nói cộc, làm việc tốt rồi coi như không có gì.",description:"Thiên Ân có vibe giang hồ nhưng thực chất cực kỳ tốt bụng."},
    "hoang-linh":{trait:"DRUM ROLL",tagline:"Tay trống đội âm nhạc. Mọi mặt bàn đều có nguy cơ thành trống.",description:"Năng lượng cao, thích gõ nhịp và báo trước các buổi diễn của trường."},
    tho:{trait:"FOOD SAFETY",tagline:"Thơ tới ăn thôi. Thảo vẫn tự giác hoảng.",description:"Nữ công an hư cấu tham gia công tác an toàn thực phẩm, sau thành khách quen."},
    "thay-minh":{trait:"JUST INSPECTING",tagline:"Thầy chỉ quan sát khu vực thôi.",description:"Hiệu trưởng hư cấu, nghiêm túc nhưng bí mật thích đồ ăn đường phố."},
    "co-lan":{trait:"EXACTLY ON TIME",tagline:"Cô quay lại sau đúng bảy phút.",description:"Phó hiệu trưởng hư cấu, cực kỳ chính xác và có tổ chức."},
    "thay-phong":{trait:"PROBABILITY",tagline:"Thấp là bao nhiêu phần trăm?",description:"Giáo viên Toán hư cấu, thích định lượng mọi thứ."},
    "co-linh":{trait:"NOT TOO SPICY",tagline:"Spicy, but not too spicy nha.",description:"Giáo viên tiếng Anh hư cấu, vui vẻ và gần gũi."},
    "thay-tung":{trait:"EAT THEN DEBUG",tagline:"Code lỗi à? Ăn xong sửa.",description:"Giáo viên Tin hư cấu, hiểu mọi câu đùa của Dương và Thủy."},
    "co-huong":{trait:"WAITING PARENT",tagline:"Cô chỉ đứng chờ con thôi…",description:"Phụ huynh thân thiện, đứng chờ rồi thành khách quen."},
    "chu-thanh":{trait:"ONE EXCEPTION",tagline:"Món chiên không tốt… cho chú hai phần.",description:"Phụ huynh nghiêm ngoài mặt nhưng luôn có một ngoại lệ."},
    "chu-sau":{trait:"RUSH FORECAST",tagline:"Chút nữa Khánh tới cho coi.",description:"Bảo vệ trường hư cấu, biết nhịp cả khu phố."},
    "chi-hong":{trait:"MARKET RESEARCH",tagline:"Đối thủ chứ có phải kẻ thù đâu.",description:"Chủ quầy kế bên, cạnh tranh vui vẻ rồi thành đồng minh."},
    "bac-tu":{trait:"LOCAL REGULAR",tagline:"Khúc này bác rành.",description:"Khách địa phương hiền, biết mọi thay đổi quanh khu phố."},
    "anh-bon-ba-bay":{trait:"4:37",tagline:"Một vị khách luôn đến gần cùng một giờ.",description:"Cựu học sinh bí ẩn với câu chuyện riêng về khu phố."}
  });

  const UNLOCK_RULES = Object.freeze({
    an:function(s,d){return d>=2;},
    "co-huong":function(s,d){return d>=2;},
    "bac-tu":function(s,d){return d>=2;},
    duong:function(s,d){return d>=2;},
    thuy:function(s,d){return d>=2 && s.stats.totalCustomersServed>=2;},
    "phuoc-nguyen":function(s,d){return d>=3;},
    "anh-quan":function(s,d){return d>=3 && (s.characterVisits["phuoc-nguyen"]||0)>=1;},
    hoc:function(s,d){return d>=3;},
    vu:function(s,d){return d>=3;},
    "thien-an":function(s,d){return d>=4;},
    han:function(s,d){return d>=4 && (Number(s.story.flags.vuAskedAboutHan||0)>=2 || d>=7);},
    tho:function(s,d,r){return d>=4 && (r>=63 || d>=7);},
    "co-lan":function(s,d){return d>=4;},
    "thay-phong":function(s,d){return d>=4;},
    "co-linh":function(s,d){return d>=4;},
    "hoang-linh":function(s,d){return d>=5;},
    "thay-tung":function(s,d){return d>=5;},
    "thay-minh":function(s,d,r){return d>=6 && r>=64;},
    "chu-thanh":function(s,d){return d>=6;},
    "chi-hong":function(s,d,r){return d>=7 && (r>=66 || s.stats.totalCustomersServed>=20);},
    "anh-bon-ba-bay":function(s,d){return d>=8;}
  });

  const PRE_DIALOGUE = Object.freeze({
    khanh:[["Hôm nay em giảm ăn.","Chị không tin."],["Một xiên chỉ là lời chào.","Rồi em chào vừa thôi."],["Em tới đánh giá chất lượng định kỳ.","Đánh giá bằng mấy phần?"]],
    nhan:[["Ở Hong Kong cũng có fish ball, nhưng kiểu này khác.","Khác sao?"],["Em cần thử thêm vài lần mới kết luận.","Nghe giống lý do để ăn tiếp."],["Em đang thu thập thêm dữ liệu.","Dữ liệu tính theo xiên hả?"]],
    duong:[["Nay có bạn nào xinh ghé quán không chị?","Em tới ăn hay tới thống kê?"],["Hôm nay tình hình sao chị?","Cá viên còn nhiều."],["Có dữ liệu gì mới không chị?","Dữ liệu món ăn thì có."]],
    thuy:[["Chị Thảo hôm nay đẹp quá.","Hôm qua em cũng nói vậy."],["Chị ăn tối chưa?","Em tới ăn mà ngày nào cũng hỏi chị ăn chưa vậy?"],["Em ghé vì nhớ— nhớ cá viên.","Ờ."],["Em có thể phụ chị không? Em biết code.","Chị đang cần người biết chiên."],["Mai chị có bán không?","Có. Em hỏi để ăn hay để gặp chị?"]],
    vu:[["Chị, Hân có ghé chưa?","Em hỏi để làm gì?"],["Hân đâu rồi chị?","Chưa tới."],["Hôm nay—","Hân chưa tới."],["Hân đâu rồi?","Mới đi hai phút."],["Em có hỏi Hân đâu.","Ừ."]],
    han:[["Hôm nay em tới vì đồ ăn nha chị.","Chị có hỏi gì đâu."],["Ở đây ồn mà dễ chịu ghê.","Quầy vỉa hè mà yên mới lạ."],["Nãy Vũ có ghé không chị?","Có."],["Nó hỏi em chứ gì?","Em biết mà."]],
    trang:[["Trân tới chưa chị?","Sao ba đứa không nhắn group?"],["Quý lại nói còn một phút hả chị?","Nó nói câu đó từ năm phút trước."],["Ba đứa em có group mà không ai đọc.","Chị bắt đầu hiểu rồi."]],
    tran:[["Lát Trang hỏi thì chị đừng nói em ăn trước nha.","Chị đang bán đồ hay giữ bí mật vậy?"],["Chuyện này đừng lên group nha chị.","Chị còn không ở trong group."],["Em không giấu gì hết.","Chị chưa hỏi mà."]],
    quy:[["Chị làm nhanh, em còn đúng một phút!","Em nói câu đó mỗi ngày."],["Trang với Trân tới chưa chị?","Ba đứa có group mà?"],["Em không trễ, đồng hồ chạy sớm.","Rồi vừa chạy vừa order đi."]],
    an:[["Chị làm phần lớn nha, em mới tập xong.","Lại phần lớn."],["Hôm nay chạy muốn xỉu.","Vậy ăn nhẹ thôi."],["Em đốt calo rồi.","Ừ, chị hiểu lý do tiếp theo rồi."]],
    "phuoc-nguyen":[["Chị, em vừa được điểm cao.","Chúc mừng."],["Nếu Quân tới chị nói em chưa ghé nha.","Chị không nhận dịch vụ alibi."],["Em đang giải lao có chiến lược.","Chiến lược có order chưa?"]],
    "anh-quan":[["Chị đừng tin lời Nguyên.","Nó nói gì?"],["Nguyên có tới chưa chị?","Em hỏi hơi có kinh nghiệm đó."],["Em cảnh báo trước thôi.","Chị chưa biết phải đề phòng gì luôn."]],
    "thien-an":[["Gì nhanh nhất.","Hôm nay nói chuyện dễ thương ghê."],["Mưa thì chị kéo đồ vô đi.","Ủa em giúp chị hả?"],["Con Homi đâu?","Em nhớ Homi hả?"]],
    "hoang-linh":[["Cốc cốc cốc— em đang giữ nhịp.","Đừng đánh trống lên quầy chị."],["Tối nay tụi em diễn đó chị.","Vậy ăn cho có sức."],["Rehearsal xong em đói ghê.","Tempo order trước đi em."]],
    hoc:[["Em đang nạp năng lượng để học.","Học chưa?"],["Ăn xong em học thiệt.","Chị nghe câu này hôm qua rồi."],["Tên em là Học thôi mà.","Chị hiểu rồi."]],
    tho:[["Chào em. Chị kiểm tra một chút.","...dạ."],["Hôm nay chị tới ăn.","Em có giấy tờ đầy đủ!"],["Dầu này dùng lâu rồi đó em.","Em thay sau mẻ này ạ."]],
    "thay-minh":[["Thầy chỉ quan sát khu vực thôi.","Dạ."],["...cho thầy một phần.","Em biết ngay mà."]],
    "co-lan":[["Cô quay lại sau bảy phút.","Đúng bảy phút luôn hả cô?"],["Bảy phút rồi.","Cô đúng giờ thiệt."]],
    "thay-phong":[["Xác suất món của thầy bị cháy là bao nhiêu?","Thấp ạ."],["Thấp là bao nhiêu phần trăm?","Thầy order trước giúp em."]],
    "co-linh":[["Spicy but not too spicy nha.","Dạ, em hiểu chữ not rồi cô."]],
    "thay-tung":[["Dương nói code lỗi.","Thầy coi giúp chưa ạ?"],["Ăn xong sửa.","Thầy trò giống nhau ghê."]],
    "co-huong":[["Cô chỉ đứng chờ con thôi.","Dạ."],["Thôi cho cô một phần.","Em biết ngay mà."]],
    "chu-thanh":[["Mấy món chiên ăn nhiều không tốt.","Dạ."],["...cho chú hai phần.","Một phần cho con chú đúng không?"]],
    "chu-sau":[["Chút nữa Khánh tới cho coi.","Chú đoán lần nào cũng đúng."],["Chiều coi bộ mưa à nghen.","Vậy con kéo bạt sớm."]],
    "chi-hong":[["Chị đang nghiên cứu thị trường.","Mấy ngày liên tục rồi đó chị."],["Khách khó lắm đó em.","Vậy chị thử thêm một phần đi."]]
  });

  const POST_CORRECT = Object.freeze({
    khanh:["Ngon cỡ Poseidon.","Được. Khởi động xong.","Hôm nay phong độ tốt.","Ăn vậy mới đáng.","Em công nhận phần này."],
    nhan:["Dữ liệu lần này rất thuyết phục."], duong:["Response time tốt đó chị.","Đúng output rồi."],
    thuy:["Chị làm gì cũng nhanh hết á.","Ngon lắm chị. Chị nhớ ăn tối nha."],
    vu:["Đúng món rồi. À... Hân chưa tới hả chị?"], han:["Ngon lắm chị."],
    "phuoc-nguyen":["Tối ưu ghê chị."], "anh-quan":["Lần này không liên quan Nguyên. Ngon."],
    "thien-an":["Ừ. Ngon."], "hoang-linh":["Tempo đẹp."], an:["Pha này vào rổ."],
    hoc:["Ngon. Giờ em hết lý do chưa học rồi."], tho:["Ổn. Gọn và đúng món."]
  });
  const POST_WRONG = Object.freeze({
    khanh:["Sai món không đáng sợ. Phần ít mới đáng sợ."], nhan:["Kết quả không khớp đầu vào."],
    duong:["Sai output rồi chị."], thuy:["Không sao đâu chị, mình làm lại nha."], vu:["...em không gọi cái này."],
    han:["Hình như đơn này không phải của em."], "phuoc-nguyen":["Đáp án này lệch đề rồi chị."],
    "anh-quan":["Pha này chắc Nguyên đổi đề."], "thien-an":["Không đúng. Làm lại được."],
    "hoang-linh":["Pha này lệch nhịp rồi chị."], an:["Pha này lệch rổ rồi chị."], hoc:["Sai món rồi chị."], tho:["Mình đối chiếu lại nhé."]
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
    INITIAL_UNLOCKS.forEach(function(id){ if (CVVH.Characters.getById(id) && !save.unlockedCharacters.includes(id)) save.unlockedCharacters.push(id); });
    return save;
  }

  function seedForProgress(day, reputation) {
    const mock = {stats:{totalCustomersServed:Math.max(0,(day-1)*8)},story:{flags:{vuAskedAboutHan:day>=4?2:0}},characterVisits:{"phuoc-nguyen":day>=4?1:0}};
    const ids = INITIAL_UNLOCKS.slice();
    Object.keys(UNLOCK_RULES).forEach(function(id){ if (CVVH.Characters.getById(id) && UNLOCK_RULES[id](mock,day,reputation)) ids.push(id); });
    return Array.from(new Set(ids));
  }

  function updateUnlocks(save, day, reputation) {
    ensure(save);
    const unlocked = [];
    Object.keys(UNLOCK_RULES).forEach(function(id){
      if (CVVH.Characters.getById(id) && !save.unlockedCharacters.includes(id) && UNLOCK_RULES[id](save,day,reputation)) {
        save.unlockedCharacters.push(id);
        save.characterBook[id] = save.characterBook[id] || {unlockedAtDay:day,updated:true};
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

  function eligible(save, day, eventId, excludedIds) {
    ensure(save);
    const excluded = new Set(excludedIds || []);
    return save.unlockedCharacters.map(function(id){return CVVH.Characters.getById(id);}).filter(function(character){
      if (!character || excluded.has(character.id)) return false;
      if (character.id === "anh-bon-ba-bay") return day>=8 && (eventId === "rain" || Math.random()<.22);
      return true;
    });
  }

  function chooseCharacter(save, day, event, random, options) {
    const rng = random || Math.random;
    const pool = eligible(save,day,event.id,(options&&options.exclude)||[]);
    if (!pool.length) return CVVH.Characters.getById("trang") || CVVH.Characters.all[0];
    const recent = save.story.lastVisitors.slice(-3);
    const weighted = pool.map(function(character){
      let weight = (save.characterVisits[character.id]||0)===0 ? 1.75 : 1;
      if (recent.includes(character.id)) weight *= .28;
      if (character.id === "khanh") weight *= 1.6;
      if (character.id === "vu" && !save.unlockedCharacters.includes("han")) weight *= 2;
      if (character.id === "han" && (save.characterVisits.han||0)<2) weight *= 1.7;
      if (character.id === "phuoc-nguyen" && !save.unlockedCharacters.includes("anh-quan")) weight *= 1.6;
      if (event.id === "exams" && character.id === "hoc") weight *= 1.8;
      if (event.id === "rain" && character.id === "chu-sau") weight *= 1.4;
      return {character:character,weight:weight};
    });
    let roll = rng()*weighted.reduce(function(sum,item){return sum+item.weight;},0);
    for (const item of weighted){ roll-=item.weight; if(roll<=0) return item.character; }
    return weighted[weighted.length-1].character;
  }

  function orderSignature(order){return order.items.slice().sort().join("+")+"|"+order.sauce+"|"+(order.drink||"none");}

  function generateOrder(save, character, day, availableFoods, maxItems, random, tutorialOrder, specialKhanh) {
    ensure(save);
    const rng = random || Math.random;
    if (tutorialOrder) return {items:["ca-vien"],sauce:"tuong-ot",drink:"none"};
    const validFoods = (availableFoods||[]).filter(function(food){return CVVH.Config.isFoodUnlocked(food.id,day);});
    const pool = validFoods.length ? validFoods : CVVH.Config.getUnlockedFoods(day);
    const history = save.recentOrders[character.id] || [];
    let candidate;
    for (let attempt=0; attempt<12; attempt+=1) {
      candidate = CVVH.Orders.generate(day,pool,maxItems,rng,false);
      let desired = candidate.items.length;
      if (character.id === "khanh") {
        const minKhanh = specialKhanh ? Math.min(maxItems, Math.max(4, Math.min(7,maxItems))) : Math.min(maxItems,3);
        desired = Math.max(desired,minKhanh);
      } else if (character.id === "an" && rng()>.35) desired = Math.min(maxItems,Math.max(desired,2));
      else if (character.portionSizeWeight === "group" && rng()>.55) desired = Math.min(maxItems,Math.max(desired,3));
      while (candidate.items.length<desired && pool.length) candidate.items.push(pool[Math.floor(rng()*pool.length)].id);
      const unlockedSauces = CVVH.Config.getUnlockedSauces(day);
      if (character.preferredSauce && CVVH.Config.isSauceUnlocked(character.preferredSauce,day) && rng()<.28) candidate.sauce = character.preferredSauce;
      if (!unlockedSauces.some(function(s){return s.id===candidate.sauce;})) candidate.sauce = unlockedSauces[0].id;
      if (character.id === "khanh" && candidate.drink === "none") {
        const drinks = CVVH.Config.getUnlockedDrinks(day).filter(function(drink){return drink.id!=="none";});
        if (drinks.length && rng()<(specialKhanh?.94:.72)) candidate.drink = drinks[Math.floor(rng()*drinks.length)].id;
      }
      candidate = CVVH.Orders.sanitize(candidate,day,pool,maxItems,rng);
      if (!history.includes(orderSignature(candidate))) break;
    }
    return candidate;
  }

  function recordOrder(save, characterId, order){ensure(save);const h=save.recentOrders[characterId]||[];h.push(orderSignature(order));save.recentOrders[characterId]=h.slice(-5);}
  function recordVisit(save, characterId){
    ensure(save); save.characterVisits[characterId]=(save.characterVisits[characterId]||0)+1;
    save.story.lastVisitors.push(characterId); save.story.lastVisitors=save.story.lastVisitors.slice(-5);
    save.characterBook[characterId]=save.characterBook[characterId]||{unlockedAtDay:save.currentDay,updated:false};
    save.characterBook[characterId].visits=save.characterVisits[characterId];
    if(characterId==="khanh") save.story.flags.lastKhanhDay=save.currentDay;
  }

  function pickIndex(save,key,length){const prev=Number(save.story.dialogueSeen[key]);let i=Math.floor(Math.random()*length);if(length>1&&i===prev)i=(i+1)%length;save.story.dialogueSeen[key]=i;return i;}
  function line(speaker,text,avatar){return {speaker:speaker,text:text,avatar:avatar||(speaker==="Thảo"?"./assets/ui/cart.svg":"")};}

  function preOrderDialogue(save, character, event) {
    ensure(save);
    const visits=save.characterVisits[character.id]||0;
    let pool=PRE_DIALOGUE[character.id];
    if(character.id==="trang"&&save.story.flags.tranAteFirst&&!save.story.flags.thaoCoveredForTran){save.story.flags.thaoCoveredForTran=true;return [line("Trang","Trân tới chưa chị?",character.avatar),line("Thảo","...chưa."),line("Thảo","Chị vừa nói dối vì tình bạn.")];}
    if(character.id==="anh-quan"&&save.story.flags.nguyenAskedThaoToLie){save.story.flags.quanCaughtNguyenLie=true;return [line("Anh Quân","Nguyên có tới chưa chị?",character.avatar),line("Thảo","...chưa."),line("Anh Quân","Nó mới gửi em hình cá viên.",character.avatar)];}
    if(character.id==="duong"&&(save.characterVisits.thuy||0)>0&&Math.random()<.28){return [line("Dương","Thủy lại ghé đây chưa chị?",character.avatar),line("Thảo","Rồi."),line("Dương","Em biết ngay.",character.avatar)];}
    if(character.id==="thuy"&&(save.characterVisits.duong||0)>0&&Math.random()<.24){return [line("Thủy","Dương có qua không chị?",character.avatar),line("Thảo","Có. Nó nói xấu em."),line("Thủy","Em biết ngay.",character.avatar)];}
    if(!pool||!pool.length){
      let context=event.id==="rain"?"rain":event.id==="exams"?"exams":event.id==="graduation"?"graduation":(visits<=1?"firstVisit":"normal");
      if((save.relationships[character.id]||0)>=22&&character.dialogue.highRelationship&&Math.random()<.32)context="highRelationship";
      return [line(character.name,CVVH.Characters.pickDialogue(character,context,save),character.avatar),line("Thảo","Rồi, vừa kể vừa order nha.")];
    }
    let index=visits<=1?0:pickIndex(save,character.id+":pre",pool.length);
    if(character.id==="vu"){
      const progress=Number(save.story.flags.vuAskedAboutHan||0);index=progress<pool.length?progress:1+pickIndex(save,character.id+":vu-late",pool.length-1);
      save.story.flags.vuAskedAboutHan=progress+1;save.story.activeThreads.vuHan=Math.min(7,progress+1);
    }
    if(character.id==="tran")save.story.flags.tranAteFirst=true;
    if(character.id==="phuoc-nguyen"&&index===1)save.story.flags.nguyenAskedThaoToLie=true;
    if(character.id==="thuy")save.story.activeThreads.thuyThao=Math.min(6,Math.ceil(visits/2));
    if(character.id==="tho")save.story.flags.foodSafetyProgress=Math.min(5,Number(save.story.flags.foodSafetyProgress||0)+1);
    if(character.id==="chi-hong")save.story.flags.rivalProgress=Math.min(5,Number(save.story.flags.rivalProgress||0)+1);
    const chosen=pool[index];return [line(character.name,chosen[0],character.avatar),line("Thảo",chosen[1])];
  }

  function postServiceDialogue(save, character, correct, patienceRatio) {
    ensure(save); const map=correct?POST_CORRECT:POST_WRONG; const pool=map[character.id]; let text;
    if(pool&&pool.length) text=pool[pickIndex(save,character.id+(correct?":post-ok":":post-wrong"),pool.length)];
    else { const context=correct?(patienceRatio>.7?"fastService":patienceRatio<.3?"slowService":"normal"):"wrongOrder"; text=CVVH.Characters.pickDialogue(character,context,save); }
    const lines=[line(character.name,text,character.avatar)]; if(!correct) lines.push(line("Thảo","Biết rồi, để chị làm lại.")); return lines;
  }

  function bonusOrderDialogue(character){return [line(character.name,"Chị... làm thêm phần nữa được không?",character.avatar),line("Thảo","Em vừa ăn xong mà?"),line(character.name,"Đó là phần trước.",character.avatar)];}
  function recordService(save,characterId,correct,fast){ensure(save);const item=save.characterBook[characterId]=save.characterBook[characterId]||{};item.correctOrders=Number(item.correctOrders||0)+(correct?1:0);item.wrongOrders=Number(item.wrongOrders||0)+(correct?0:1);item.fastOrders=Number(item.fastOrders||0)+(correct&&fast?1:0);item.updated=true;}
  function unlockDetails(id){const c=CVVH.Characters.getById(id);const b=BOOK[id]||{};return{id:id,name:c?c.name:id,avatar:c?c.avatar:"./assets/ui/cart.svg",tagline:b.tagline||(c?c.personality:"Một gương mặt mới."),trait:b.trait||"REGULAR STORY"};}
  function bookEntries(save){ensure(save);return CVVH.Characters.all.map(function(c){const points=Number(save.relationships[c.id]||0);const b=BOOK[c.id]||{};return{character:c,unlocked:save.unlockedCharacters.includes(c.id),visits:Number(save.characterVisits[c.id]||0),points:points,stage:CVVH.Characters.stage(points),stageLabel:CVVH.Characters.stageLabel(CVVH.Characters.stage(points)),trait:b.trait||"REGULAR STORY",tagline:b.tagline||c.runningJoke,description:b.description||c.personality};});}

  CVVH.CharacterSystem={INITIAL_UNLOCKS:INITIAL_UNLOCKS,KNOWLEDGE:KNOWLEDGE,ensure:ensure,seedForProgress:seedForProgress,updateUnlocks:updateUnlocks,knows:knows,eligible:eligible,chooseCharacter:chooseCharacter,generateOrder:generateOrder,recordOrder:recordOrder,recordVisit:recordVisit,preOrderDialogue:preOrderDialogue,postServiceDialogue:postServiceDialogue,bonusOrderDialogue:bonusOrderDialogue,recordService:recordService,unlockDetails:unlockDetails,bookEntries:bookEntries,orderSignature:orderSignature};
})();
