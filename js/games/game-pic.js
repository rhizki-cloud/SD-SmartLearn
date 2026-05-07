(function () {
  "use strict";

  function renderTebakGambar(root) {
    const { award, miss } = window.SDGAMES.shared;

    let questions = [];
    let idx = 0;
    let score = 0;
    const total = 10;

    function prepare() {
      questions = window.SDGAMES.pickQuestions("pic", total);

      if (!questions || !questions.length) {
        root.innerHTML = `
          <div class="alert alert-warning">
            Bank soal Tebak Gambar belum terbaca. Pastikan <b>game-question-banks.js</b>
            dipanggil sebelum <b>game-pic.js</b>.
          </div>
        `;
        return false;
      }

      return true;
    }

    function makeOptions(answer) {
      const allAnswers = (window.SDGAMES.questionBanks?.pic || [])
        .map(x => x.answer)
        .filter(x => String(x) !== String(answer));

      const wrongOptions = shuffleArray(allAnswers).slice(0, 3);

      return shuffleArray([answer, ...wrongOptions]);
    }

    function draw() {
      const item = questions[idx];
      if (!item) return finish();

      const opts = makeOptions(item.answer);

      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">🖼️ Tebak Gambar</h2>
        <div class="text-muted mb-2">Tebak gambar dari bank soal.</div>

        <div class="game-box">
          <div class="d-flex justify-content-between">
            <div class="text-muted">
              ${item.category || "Gambar"} • Soal <b>${idx + 1}/${questions.length}</b>
            </div>
            <div class="fw-bold">Skor: ${score}</div>
          </div>

          <hr class="my-3">

          <div class="game-big" style="font-size:58px;">
            ${(item.combo || []).join(" ")}
          </div>

          <div class="tap-target d-flex gap-2 mt-3 flex-wrap">
            ${opts.map(o => `
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
          const correct = String(item.answer);

          if (val === correct) {
            score++;
            award(2, "Benar! Tebakan hebat 🖼️");

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
        msg.innerHTML = `
          <div class="alert alert-warning py-2 mb-0">
            💡 ${item.hint || "Perhatikan gambar dan kategorinya."}
          </div>
        `;
      };

      root.querySelector("#skip").onclick = () => {
        miss(`Lewat dulu ya 😉 Jawabannya: ${item.answer}`);
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
        <h2 class="h4 mb-2" style="font-weight:900;">🖼️ Tebak Gambar</h2>

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
        <h2 class="h4 mb-2" style="font-weight:900;">🖼️ Tebak Gambar</h2>

        <div class="game-box text-center">
          <div class="fs-1">🖼️</div>
          <div class="fw-bold fs-4">Siap tebak gambar?</div>
          <div class="text-muted mt-1">
            Soal akan diambil acak dari bank Tebak Gambar.
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

      if (prepare()) draw();
    }

    function shuffleArray(arr) {
      return (arr || []).slice().sort(() => Math.random() - 0.5);
    }

    drawStart();
  }

  window.SDGAMES.renderTebakGambar = renderTebakGambar;
})();