(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  const CHAPTERS = Object.freeze([
    { id:"chapter-1", from:1, to:2, title:"300 nghìn cuối cùng", subtitle:"Một chiếc xe cũ và một lần làm lại" },
    { id:"chapter-2", from:3, to:5, title:"Quán mới trước cổng trường", subtitle:"Những gương mặt bắt đầu quay lại" },
    { id:"chapter-3", from:6, to:8, title:"15 phút ra chơi", subtitle:"Mười lăm phút dài như một trận đấu" },
    { id:"chapter-4", from:9, to:11, title:"Quầy bên kia đường", subtitle:"Đối thủ không nhất thiết là kẻ xấu" },
    { id:"chapter-5", from:12, to:14, title:"Mùa thi", subtitle:"Đồ chiên nóng cho những cái đầu nóng" },
    { id:"chapter-6", from:15, to:17, title:"Ngày tốt nghiệp", subtitle:"Một khúc đường, nhiều lời tạm biệt" },
    { id:"endless", from:18, to:999, title:"Biên Hòa không ngủ", subtitle:"Chế độ vô tận đã mở" }
  ]);

  const EVENTS = Object.freeze({
    normal:{ id:"normal", label:"Ngày thường", spawnScale:1, patienceScale:1, groupChance:0 },
    "recess-rush":{ id:"recess-rush", label:"Giờ ra chơi", spawnScale:.7, patienceScale:.92, groupChance:.12 },
    dismissal:{ id:"dismissal", label:"Tan trường", spawnScale:.78, patienceScale:1, groupChance:.08 },
    rain:{ id:"rain", label:"Mưa chiều", spawnScale:1.28, patienceScale:1.18, groupChance:0 },
    exams:{ id:"exams", label:"Tuần thi", spawnScale:.92, patienceScale:.9, groupChance:.05 },
    sports:{ id:"sports", label:"Hội thao", spawnScale:.68, patienceScale:1.08, groupChance:.3 },
    club:{ id:"club", label:"Ngày CLB", spawnScale:.76, patienceScale:1.05, groupChance:.24 },
    valentine:{ id:"valentine", label:"Lễ Valentine", spawnScale:.82, patienceScale:1.1, groupChance:.14 },
    graduation:{ id:"graduation", label:"Tốt nghiệp", spawnScale:.74, patienceScale:1.2, groupChance:.22 },
    "food-street":{ id:"food-street", label:"Đua phố ăn vặt", spawnScale:.6, patienceScale:.9, groupChance:.2 }
  });

  const avatar = function (id) { const person = CVVH.Characters.getById(id); return person ? person.avatar : "./assets/ui/cart.svg"; };
  const scenes = {
    intro:{ id:"intro", title:"300 nghìn cuối cùng", lines:[
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Công việc làm ăn xa nhà thất bại. Tôi quay về Biên Hòa với đúng 300.000đ và một chiếc xe cá viên cũ trong sân." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"“Thôi thì còn bao nhiêu vốn bỏ vô cá viên hết vậy.” Nghe không giống kế hoạch kinh doanh lắm, nhưng ít nhất nó là một khởi đầu." },
      { name:"Chú Sáu", avatar:avatar("chu-sau"), text:"Bán gần đây hả con? Chiều học sinh tan đông lắm. Giữ sạch, bán tử tế là tụi nhỏ nhớ à." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Chiếc chảo nhỏ nóng lên. Ngày đầu tiên của quầy Cá Viên Vỉa Hè bắt đầu." }
    ]},
    chapter2:{ id:"chapter2", title:"Quán mới trước cổng trường", lines:[
      { name:"Gia Huy", avatar:avatar("gia-huy"), text:"Chị ơi, đây có phải quầy bí mật mấy anh chị khối trên hay nói không?" },
      { name:"Trâm", avatar:avatar("tram"), text:"Không bí mật nữa. Em đã đưa vào danh sách ăn xế của lớp rồi." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Từ hôm đó, tôi bắt đầu nhớ tên khách trước cả khi nhớ đơn của họ." }
    ]},
    chapter3:{ id:"chapter3", title:"15 phút ra chơi", lines:[
      { name:"Chú Sáu", avatar:avatar("chu-sau"), text:"Sắp ra chơi đó. Chú báo trước rồi nghen." },
      { name:"Quý", avatar:avatar("quy"), text:"Chị làm nhanh, em còn đúng một phút!" },
      { name:"Khánh", avatar:avatar("khanh"), text:"Một phút đủ để gọi món, không đủ để ăn nghiêm túc." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Mười lăm phút sau đó dài hơn cả một buổi bán bình thường." }
    ]},
    rival:{ id:"rival", title:"Quầy bên kia đường", lines:[
      { name:"Chị Hồng", avatar:avatar("chi-hong"), text:"Mới bán hả? Khúc này khách khó lắm đó." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Dạ." },
      { name:"Chị Hồng", avatar:avatar("chi-hong"), text:"...cho chị một phần cá viên coi thử. Chị đang nghiên cứu thị trường." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Cuộc cạnh tranh bắt đầu bằng một phần cá viên và kết thúc bằng việc chị ấy ghé ba ngày liên tục." }
    ]},
    foodRush:{ id:"foodRush", title:"Food Street Rush", lines:[
      { name:"Chị Hồng", avatar:avatar("chi-hong"), text:"Hôm nay thi coi quầy nào bán nhanh hơn nha." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Chơi luôn." },
      { name:"Thầy Minh", avatar:avatar("thay-minh"), text:"Thầy không tham gia cạnh tranh thương mại. Cho thầy một phần bên này, mai thầy qua bên kia." }
    ]},
    exams:{ id:"exam-scene", title:"Mùa thi", lines:[
      { name:"Hân", avatar:avatar("han"), text:"Em sợ kết quả không đủ để học ngành em muốn." },
      { name:"Cô Thảo", avatar:avatar("co-thao"), text:"One test doesn't define you. Ăn trước, rồi mình xem từng lựa chọn." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Mùa thi làm đơn hàng ít đi một chút, nhưng câu chuyện ở quầy lại nhiều hơn." }
    ]},
    cooperation:{ id:"cooperation", title:"Hai quầy, một cơn đông", lines:[
      { name:"Chị Hồng", avatar:avatar("chi-hong"), text:"Bên chị hết đồ chiên rồi. Khách cần cá viên chị chỉ qua đây. Đổi lại em thiếu bánh tráng thì gọi chị." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Không thi nữa hả chị?" },
      { name:"Chị Hồng", avatar:avatar("chi-hong"), text:"Mai thi tiếp. Hôm nay sống sót trước đã." }
    ]},
    graduation:{ id:"graduation", title:"Ngày tốt nghiệp", lines:[
      { name:"Trâm", avatar:avatar("tram"), text:"Lần này không đặt cho lớp. Mọi người tự gọi món cuối cùng ở quầy." },
      { name:"Khánh", avatar:avatar("khanh"), text:"“Cuối cùng” nghe nhỏ quá. Cho em hai phần." },
      { name:"Hân", avatar:avatar("han"), text:"Mai không còn tan học ở đây nữa... nhưng tụi em vẫn quay lại được mà." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Từ 300.000đ và một chiếc xe cũ, quầy đã thành điểm hẹn mà chẳng bảng kế hoạch nào dự đoán được." }
    ]},
    endless:{ id:"endless", title:"Biên Hòa không ngủ", lines:[
      { name:"Chị Hồng", avatar:avatar("chi-hong"), text:"Mai đừng tưởng chị nhường khách nha." },
      { name:"Người bán", avatar:"./assets/ui/cart.svg", text:"Em cũng đâu có tính nhường." },
      { name:"Chị Hồng", avatar:avatar("chi-hong"), text:"Vậy được." },
      { name:"Người kể chuyện", avatar:"./assets/ui/cart.svg", text:"Cốt truyện chính đã hoàn thành. Chế độ vô tận mở với ngày càng đông khách và mọi sự kiện luân phiên." }
    ]}
  };

  function chapterForDay(day) { return CHAPTERS.find(function (chapter) { return day >= chapter.from && day <= chapter.to; }) || CHAPTERS[CHAPTERS.length - 1]; }

  function eventForDay(day) {
    if (day === 9 || day === 10) return EVENTS["food-street"];
    if (day >= 15 && day <= 17) return EVENTS.graduation;
    if (day >= 12 && day <= 14) return EVENTS.exams;
    if (day % 11 === 0) return EVENTS.valentine;
    if (day % 7 === 0) return EVENTS.sports;
    if (day % 6 === 0) return EVENTS["recess-rush"];
    if (day % 5 === 0) return EVENTS.club;
    if (day % 4 === 0) return EVENTS.rain;
    if (day % 3 === 0) return EVENTS.dismissal;
    return EVENTS.normal;
  }

  function sceneForDay(day, save) {
    let scene = null;
    if (!save.story.introSeen) scene = scenes.intro;
    else if (day === 3) scene = scenes.chapter2;
    else if (day === 6) scene = scenes.chapter3;
    else if (day === 9) scene = scenes.rival;
    else if (day === 10) scene = scenes.foodRush;
    else if (day === 12) scene = scenes.exams;
    else if (day === 14) scene = scenes.cooperation;
    else if (day === 15) scene = scenes.graduation;
    else if (day === 18) scene = scenes.endless;
    if (!scene || save.story.seenScenes.includes(scene.id)) return null;
    return scene;
  }

  function markScene(save, scene) {
    if (!save.story.seenScenes.includes(scene.id)) save.story.seenScenes.push(scene.id);
    if (scene.id === "intro") save.story.introSeen = true;
    const chapter = chapterForDay(save.currentDay);
    if (!save.story.chaptersCompleted.includes(chapter.id) && save.currentDay > chapter.to) save.story.chaptersCompleted.push(chapter.id);
  }

  function relationshipGain(save, characterId, points) {
    const before = Number(save.relationships[characterId]) || 0;
    const beforeStage = CVVH.Characters.stage(before);
    const after = before + Math.max(0, points || 0);
    save.relationships[characterId] = after;
    const afterStage = CVVH.Characters.stage(after);
    return { points: after, beforeStage: beforeStage, stage: afterStage, leveled: beforeStage !== afterStage };
  }

  function dialogueContext(customer, type) {
    if (type) return type;
    if (customer.patienceRatio() > .7) return "fastService";
    if (customer.patienceRatio() < .3) return "slowService";
    return "normal";
  }

  const crossTalks = [
    { ids:["khanh","duong"], line:"Dương: “Mày mới ăn mà?” — Khánh: “Đó là chuyện của phần trước.”" },
    { ids:["quy","thay-minh"], line:"Thầy Minh: “Em đang vội à?” — Quý: “...dạ không ạ.”" },
    { ids:["quy","co-lan"], line:"Quý: “Cô không họp hả cô?” — Cô Lan: “Có. Cô cũng phải ăn.”" },
    { ids:["thay-phong","co-mai"], line:"Thầy Phong: “Sốt quá nhiều.” — Cô Mai: “Đó gọi là cảm xúc.”" },
    { ids:["chi-hong","thay-minh"], line:"Chị Hồng: “Thầy ăn bên này hả?” — Thầy Minh: “Thầy không tham gia cạnh tranh thương mại.”" },
    { ids:["vu","han"], line:"Vũ đang định nói gì đó thì Hân tới. Ba luận điểm của Vũ tự nhiên biến mất." }
  ];

  function crossTalk(customers) {
    if (customers.length < 2 || Math.random() > .2) return null;
    const ids = customers.map(function (customer) { return customer.characterId; });
    const match = crossTalks.find(function (talk) { return talk.ids.every(function (id) { return ids.includes(id); }); });
    return match ? match.line : null;
  }

  class StoryManager {
    constructor() {
      this.modal = CVVH.UI.byId("story-modal"); this.nextButton = CVVH.UI.byId("story-next-btn"); this.choices = CVVH.UI.byId("story-choices");
      this.nextButton.addEventListener("click", () => this.next());
    }
    show(scene, done) { this.scene = scene; this.done = done; this.index = 0; this.modal.hidden = false; this.render(); }
    render() {
      const line = this.scene.lines[this.index];
      CVVH.UI.byId("story-title").textContent = this.scene.title; CVVH.UI.byId("story-name").textContent = line.name; CVVH.UI.byId("story-text").textContent = line.text;
      CVVH.UI.byId("story-avatar").src = line.avatar; CVVH.UI.byId("story-avatar").alt = "Chân dung " + line.name;
      this.choices.textContent = ""; this.nextButton.textContent = this.index === this.scene.lines.length - 1 ? "Mở quầy" : "Tiếp";
    }
    next() { CVVH.Audio.play("click"); if (this.index < this.scene.lines.length - 1) { this.index += 1; this.render(); return; } this.modal.hidden = true; if (this.done) this.done(this.scene); }
  }

  CVVH.Story = { CHAPTERS:CHAPTERS, EVENTS:EVENTS, chapterForDay:chapterForDay, eventForDay:eventForDay, sceneForDay:sceneForDay, markScene:markScene, relationshipGain:relationshipGain, dialogueContext:dialogueContext, crossTalk:crossTalk, StoryManager:StoryManager };
})();
