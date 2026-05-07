(function () {
    "use strict";
  
    function renderChoiceGame(root, config) {
      const { shuffle, award, miss } = window.SDGAMES.shared;
  
      let questions = [];
      let idx = 0;
      let score = 0;
      let usedHint = false;
      const total = config.total || 10;
  
      function prepare() {
        questions = window.SDGAMES.getAIQuestions(
          { game: config.game, type: "choice" },
          total
        );
      }
  
      function draw() {
        const item = questions[idx];
  
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">${config.icon} ${config.title}</h2>
          <div class="text-muted mb-2">${config.desc}</div>
  
          <div class="game-box">
            <div class="d-flex justify-content-between flex-wrap gap-2">
              <div class="text-muted">${config.subject} • Soal <b>${idx + 1}/${questions.length}</b></div>
              <div class="fw-bold">Skor: ${score}</div>
            </div>
  
            <hr class="my-3">
  
            <div class="fw-semibold mb-3" style="font-size:22px; line-height:1.35;">
              ${item.q}
            </div>
  
            <div class="tap-target d-flex gap-2 flex-wrap">
              ${shuffle(item.opts).map(o => `
                <button class="btn btn-outline-primary game-btn" data-o="${o}">
                  ${o}
                </button>
              `).join("")}
            </div>
  
            <div class="d-flex gap-2 mt-3 flex-wrap">
              <button class="btn btn-outline-primary game-btn" id="hint">💡 Hint</button>
              <button class="btn btn-outline-primary game-btn" id="skip">Lewati</button>
              <button class="btn btn-outline-secondary game-btn" id="reset">🔁 Ulang</button>
            </div>
  
            <div id="msg" class="mt-2"></div>
          </div>
        `;
  
        const msg = root.querySelector("#msg");
  
        root.querySelectorAll("[data-o]").forEach((btn) => {
          btn.onclick = () => {
            const ok = btn.dataset.o === item.a;
  
            if (ok) {
              score++;
              award(usedHint ? 1 : 2, config.correctMsg);
              msg.innerHTML = `<div class="alert alert-success py-2 mb-0"><b>Benar ✅</b><div class="small">${item.explain}</div></div>`;
            } else {
              miss(`Belum tepat 😄 Jawabannya: ${item.a}`);
              msg.innerHTML = `<div class="alert alert-danger py-2 mb-0"><b>Salah ❌</b><div class="small">${item.explain}</div></div>`;
            }
  
            setTimeout(next, 750);
          };
        });
  
        root.querySelector("#hint").onclick = () => {
          usedHint = true;
          msg.innerHTML = `<div class="alert alert-warning py-2 mb-0"><b>Hint 💡</b><div class="small">${item.hint}</div></div>`;
        };
  
        root.querySelector("#skip").onclick = () => {
          miss(`Lewat dulu ya 😉 Jawabannya: ${item.a}`);
          next();
        };
  
        root.querySelector("#reset").onclick = restart;
      }
  
      function next() {
        usedHint = false;
        idx++;
        if (idx >= questions.length) return finish();
        draw();
      }
  
      function finish() {
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">${config.icon} ${config.title}</h2>
          <div class="game-box">
            <div class="fw-bold">Selesai! 🎉</div>
            <div class="text-muted">Skor kamu: <b>${score}/${questions.length}</b></div>
            <button class="btn btn-primary game-btn mt-2" id="again">🔁 Main Lagi dengan Soal Baru</button>
          </div>
        `;
  
        root.querySelector("#again").onclick = restart;
      }
  
      function restart() {
        idx = 0;
        score = 0;
        usedHint = false;
        prepare();
        draw();
      }
  
      restart();
    }
  
    window.SDGAMES.renderChoiceGame = renderChoiceGame;
  })();