(function () {
  "use strict";

  function renderMathQuiz(root) {
    const { award, miss } = window.SDGAMES.shared;

    let questions = [];
    let idx = 0;
    let score = 0;
    let usedHint = false;
    const total = 12;

    function prepare() {
      questions = window.SDGAMES.pickQuestions("math", total);

      if (!questions || !questions.length) {
        root.innerHTML = `
          <div class="alert alert-warning">
            Bank soal Math belum terbaca. Pastikan <b>game-question-banks.js</b>
            sudah dipanggil sebelum <b>game-math.js</b>.
          </div>
        `;
        return false;
      }

      return true;
    }

    function draw() {
      const item = questions[idx];
      if (!item) return finish();

      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">➕ Math Quiz</h2>
        <div class="text-muted mb-2">Soal matematika acak dari bank soal.</div>

        <div class="game-box">
          <div class="d-flex justify-content-between">
            <div class="text-muted">
              Matematika • Soal <b>${idx + 1}/${questions.length}</b>
            </div>
            <div class="fw-bold">Skor: ${score}</div>
          </div>

          <hr class="my-3">

          <div class="fw-semibold mb-3" style="font-size:28px;">
            ${item.q}
          </div>

          <div class="tap-target d-flex gap-2 flex-wrap">
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

          <div id="msg" class="mt-2"></div>
        </div>
      `;

      const msg = root.querySelector("#msg");

      root.querySelectorAll("[data-o]").forEach((btn) => {
        btn.onclick = () => {
          const val = String(btn.dataset.o);
          const correct = String(item.a);

          if (val === correct) {
            score++;
            award(usedHint ? 1 : 2, "Benar! Jago matematika ➕");

            msg.innerHTML = `
              <div class="alert alert-success py-2 mb-0">
                Benar ✅ ${item.explain || ""}
              </div>
            `;
          } else {
            miss(`Belum tepat 😄 Jawabannya: ${correct}`);

            msg.innerHTML = `
              <div class="alert alert-danger py-2 mb-0">
                Salah ❌ ${item.explain || `Jawaban yang benar adalah ${correct}.`}
              </div>
            `;
          }

          setTimeout(next, 700);
        };
      });

      root.querySelector("#hint").onclick = () => {
        usedHint = true;
        msg.innerHTML = `
          <div class="alert alert-warning py-2 mb-0">
            💡 ${item.hint || "Coba hitung pelan-pelan ya."}
          </div>
        `;
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
        <h2 class="h4 mb-2" style="font-weight:900;">➕ Math Quiz</h2>

        <div class="game-box text-center">
          <div class="fw-bold fs-4">Selesai! 🎉</div>
          <div class="text-muted mt-1">
            Skor: <b>${score}/${questions.length}</b>
          </div>

          <button class="btn btn-primary game-btn mt-3" id="again">
            🔁 Main Lagi dengan Soal Baru
          </button>
        </div>
      `;

      root.querySelector("#again").onclick = restart;
    }

    function drawStart() {
      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">➕ Math Quiz</h2>

        <div class="game-box text-center">
          <div class="fs-1">➕</div>
          <div class="fw-bold fs-4">Siap latihan matematika?</div>
          <div class="text-muted mt-1">
            Soal akan diambil acak dari bank soal Math.
          </div>

          <button class="btn btn-primary game-btn mt-3" id="start">
            Mulai
          </button>
        </div>
      `;

      root.querySelector("#start").onclick = restart;
    }

    function restart() {
      idx = 0;
      score = 0;
      usedHint = false;

      if (prepare()) draw();
    }

    function shuffleArray(arr) {
      return (arr || []).slice().sort(() => Math.random() - 0.5);
    }

    drawStart();
  }

  window.SDGAMES.renderMathQuiz = renderMathQuiz;
})();