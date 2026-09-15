(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};

  class TutorialManager {
    constructor(onComplete) {
      this.onComplete = onComplete;
      this.active = false;
      this.index = 0;
      this.steps = [
        { title: "Khách vừa gọi món!", text: "Nhìn bong bóng phía trên: khách đầu tiên muốn 1 cá viên kèm tương ớt.", target: ".customer-card", action: "next" },
        { title: "Cho cá viên vào chảo", text: "Bấm nguyên liệu Cá viên. Trò chơi sẽ tự tìm một ô chảo trống.", target: "[data-food-id='ca-vien']", action: "fry:ca-vien" },
        { title: "Chờ món chín", text: "Theo dõi nhãn và thanh tiến độ. Khi món chuyển sang SẴN SÀNG, hãy lấy ra thật nhanh.", target: ".fryer-slot:not(.empty)", action: "ready" },
        { title: "Lấy món ra khay", text: "Bấm vào ô chảo đang phát sáng để chuyển cá viên sang khay phục vụ.", target: ".fryer-slot.ready", action: "collect" },
        { title: "Thêm tương ớt", text: "Bấm chai Tương ớt. Viền xanh cho biết sốt đã được chọn.", target: "[data-sauce-id='tuong-ot']", action: "sauce:tuong-ot" },
        { title: "Phục vụ khách", text: "Chọn vị khách đầu tiên, rồi bấm PHỤC VỤ. Món và sốt phải khớp hoàn toàn.", target: "#serve-btn", action: "served" }
      ];
      this.overlay = document.getElementById("tutorial-overlay");
      this.title = document.getElementById("tutorial-title");
      this.text = document.getElementById("tutorial-text");
      this.progress = document.getElementById("tutorial-progress");
      this.nextButton = document.getElementById("tutorial-next-btn");
      this.skipButton = document.getElementById("tutorial-skip-btn");
      this.nextButton.addEventListener("click", () => this.notify("next"));
      this.skipButton.addEventListener("click", () => this.complete(true));
    }

    start() { this.active = true; this.index = 0; this.overlay.hidden = false; this.render(); }

    render() {
      if (!this.active) { this.overlay.hidden = true; return; }
      const step = this.steps[this.index];
      this.title.textContent = step.title;
      this.text.textContent = step.text;
      this.progress.textContent = "Hướng dẫn " + (this.index + 1) + "/" + this.steps.length;
      this.nextButton.hidden = step.action !== "next";
      this.applyHighlight();
    }

    applyHighlight() {
      document.querySelectorAll(".tutorial-highlight").forEach(function (element) { element.classList.remove("tutorial-highlight"); });
      if (!this.active) return;
      const step = this.steps[this.index];
      window.requestAnimationFrame(function () {
        const target = document.querySelector(step.target);
        if (target) target.classList.add("tutorial-highlight");
      });
    }

    refreshHighlight() { this.applyHighlight(); }

    notify(action) {
      if (!this.active) return;
      const step = this.steps[this.index];
      if (step.action !== action) return;
      if (this.index >= this.steps.length - 1) { this.complete(false); return; }
      this.index += 1;
      this.render();
    }

    complete(skipped) {
      if (!this.active) return;
      this.active = false;
      document.querySelectorAll(".tutorial-highlight").forEach(function (element) { element.classList.remove("tutorial-highlight"); });
      this.overlay.hidden = true;
      if (typeof this.onComplete === "function") this.onComplete(Boolean(skipped));
    }
  }

  CVVH.TutorialManager = TutorialManager;
})();
