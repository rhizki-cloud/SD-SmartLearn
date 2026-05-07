(function () {
    "use strict";
  
    function renderCerita(root) {
      const { award, miss } = window.SDGAMES.shared;
  
      let questions = [];
      let idx = 0;
      let score = 0;
      const total = 10;
  
      function prepare() {
        questions = window.SDGAMES.pickQuestions("cerita", total);
  
        if (!questions || !questions.length) {
          root.innerHTML = `
            <div class="alert alert-warning">
              Bank soal Soal Cerita belum terbaca. Pastikan <b>game-question-banks.js</b>
              dipanggil sebelum <b>game-cerita.js</b>.
            </div>
          `;
          return false;
        }
  
        return true;
      }
  
      function restart() {
        idx = 0;
        score = 0;
  
        if (prepare()) draw();
      }
  
      function draw() {
        const item = questions[idx];
        if (!item) return finish();
  
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">📖 Soal Cerita</h2>
          <div class="text-muted mb-2">Baca soal baik-baik lalu pilih jawaban.</div>
  
          <div class="game-box">
            <div class="d-flex justify-content-between">
              <div>Soal <b>${idx + 1}/${questions.length}</b></div>
              <div>Skor: <b>${score}</b></div>
            </div>
  
            <hr>
  
            <div class="fw-bold fs-5 mb-3">${item.q}</div>
  
            <div class="d-flex gap-2 flex-wrap">
              ${shuffleArray(item.opts).map(o => `
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
  
            <div id="storyMsg" class="mt-2"></div>
          </div>
        `;
  
        const msg = root.querySelector("#storyMsg");
  
        root.querySelectorAll("[data-o]").forEach(btn => {
          btn.onclick = () => {
            const val = String(btn.dataset.o);
            const correct = String(item.a);
  
            if (val === correct) {
              score++;
              award(2, "Benar! Kamu teliti 📖");
  
              if (msg) {
                msg.innerHTML = `
                  <div class="alert alert-success py-2 mb-0">
                    Benar ✅ ${item.explain || ""}
                  </div>
                `;
              }
            } else {
              miss(`Jawabannya: ${correct}`);
  
              if (msg) {
                msg.innerHTML = `
                  <div class="alert alert-danger py-2 mb-0">
                    Salah ❌ ${item.explain || `Jawaban yang benar adalah ${correct}.`}
                  </div>
                `;
              }
            }
  
            setTimeout(next, 700);
          };
        });
  
        root.querySelector("#hint").onclick = () => {
          if (msg) {
            msg.innerHTML = `
              <div class="alert alert-warning py-2 mb-0">
                💡 ${item.hint || "Baca kata kunci pada soal, lalu hitung pelan-pelan."}
              </div>
            `;
          }
  
          window.SDAPP?.fx?.tap?.();
        };
  
        root.querySelector("#skip").onclick = () => {
          miss(`Lewat dulu ya 😉 Jawabannya: ${item.a}`);
          next();
        };
  
        root.querySelector("#reset").onclick = restart;
      }
  
      function next() {
        idx++;
  
        if (idx >= questions.length) {
          finish();
          return;
        }
  
        draw();
      }
  
      function finish() {
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">📖 Soal Cerita</h2>
          <div class="game-box text-center">
            <div class="fw-bold fs-4">Selesai 🎉</div>
            <div>Skor: <b>${score}/${questions.length}</b></div>
            <button class="btn btn-primary game-btn mt-3" id="again">Main Lagi dengan Soal Baru</button>
          </div>
        `;
  
        root.querySelector("#again").onclick = restart;
      }
  
      function drawStart() {
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">📖 Soal Cerita</h2>
          <div class="game-box text-center">
            <div class="fs-1">📖</div>
            <div class="fw-bold fs-4">Siap membaca soal cerita?</div>
            <div class="text-muted mt-1">Soal diambil acak dari bank Soal Cerita.</div>
            <button class="btn btn-primary game-btn mt-3" id="start">Mulai</button>
          </div>
        `;
  
        root.querySelector("#start").onclick = restart;
      }
  
      function shuffleArray(arr) {
        return arr.slice().sort(() => Math.random() - 0.5);
      }
  
      drawStart();
    }
  
    window.SDGAMES.renderCerita = renderCerita;
  })();