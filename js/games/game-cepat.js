(function () {
    "use strict";
  
    function renderCepat(root) {
      const { award, miss } = window.SDGAMES.shared;
  
      let questions = [];
      let idx = 0;
      let time = 20;
      let score = 0;
      let timer = null;
      const total = 20;
  
      function prepare() {
        questions = window.SDGAMES.pickQuestions("cepat", total);
  
        if (!questions || !questions.length) {
          root.innerHTML = `
            <div class="alert alert-warning">
              Bank soal Cepat Tepat belum terbaca. Pastikan <b>game-question-banks.js</b>
              dipanggil sebelum <b>game-cepat.js</b>.
            </div>
          `;
          return false;
        }
  
        return true;
      }
  
      function start() {
        clearInterval(timer);
  
        idx = 0;
        time = 20;
        score = 0;
  
        if (!prepare()) return;
  
        draw();
  
        timer = setInterval(() => {
          time--;
  
          const el = root.querySelector("#fastTime");
          if (el) el.textContent = `${time}s`;
  
          if (time <= 0) finish();
        }, 1000);
      }
  
      function draw() {
        const current = questions[idx];
        if (!current) return finish();
  
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">⚡ Cepat Tepat</h2>
          <div class="text-muted mb-2">Jawab cepat sebelum waktu habis!</div>
  
          <div class="game-box">
            <div class="d-flex justify-content-between">
              <div>⏱️ <b id="fastTime">${time}s</b></div>
              <div>Skor: <b>${score}</b></div>
            </div>
  
            <hr>
  
            <div class="fw-bold fs-2 mb-3">${current.q}</div>
  
            <div class="d-flex gap-2 flex-wrap">
              ${shuffleArray(current.opts).map(o => `
                <button class="btn btn-outline-primary game-btn" data-o="${o}">
                  ${o}
                </button>
              `).join("")}
            </div>
  
            <div id="fastMsg" class="mt-2"></div>
          </div>
        `;
  
        const msg = root.querySelector("#fastMsg");
  
        root.querySelectorAll("[data-o]").forEach(btn => {
          btn.onclick = () => {
            const val = String(btn.dataset.o);
            const correct = String(current.a);
  
            if (val === correct) {
              score++;
              window.SDAPP?.fx?.tap?.();
  
              if (msg) {
                msg.innerHTML = `
                  <div class="alert alert-success py-2 mb-0">
                    Benar ✅ ${current.explain || ""}
                  </div>
                `;
              }
            } else {
              miss(`Ups salah 😄 Jawabannya: ${correct}`);
  
              if (msg) {
                msg.innerHTML = `
                  <div class="alert alert-danger py-2 mb-0">
                    Salah ❌ ${current.explain || `Jawaban yang benar adalah ${correct}.`}
                  </div>
                `;
              }
            }
  
            setTimeout(nextQuestion, 300);
          };
        });
      }
  
      function nextQuestion() {
        idx++;
  
        if (idx >= questions.length) {
          idx = 0;
          questions = window.SDGAMES.pickQuestions("cepat", total);
        }
  
        draw();
      }
  
      function finish() {
        clearInterval(timer);
  
        if (score > 0) {
          award(Math.max(1, Math.floor(score / 4)), "Cepat tepat selesai ⚡");
        } else {
          miss("Belum dapat skor, coba lagi ya 😄");
        }
  
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">⚡ Cepat Tepat</h2>
          <div class="game-box text-center">
            <div class="fw-bold fs-4">Waktu habis! ⏰</div>
            <div>Skor kamu: <b>${score}</b></div>
            <button class="btn btn-primary game-btn mt-3" id="again">Main Lagi dengan Soal Baru</button>
          </div>
        `;
  
        root.querySelector("#again").onclick = start;
      }
  
      function drawStart() {
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">⚡ Cepat Tepat</h2>
          <div class="game-box text-center">
            <div class="fs-1">⚡</div>
            <div class="fw-bold fs-4">Siap tantangan cepat?</div>
            <div class="text-muted mt-1">Soal diambil acak dari bank soal Cepat Tepat.</div>
            <button class="btn btn-primary game-btn mt-3" id="start">Mulai</button>
          </div>
        `;
  
        root.querySelector("#start").onclick = start;
      }
  
      function shuffleArray(arr) {
        return arr.slice().sort(() => Math.random() - 0.5);
      }
  
      drawStart();
    }
  
    window.SDGAMES.renderCepat = renderCepat;
  })();