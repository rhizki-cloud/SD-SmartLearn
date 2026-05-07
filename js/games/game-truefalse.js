(function () {
  "use strict";

  function renderTrueFalse(root) {
    const { award, miss } = window.SDGAMES.shared;

    let questions = [];
    let idx = 0;
    let score = 0;
    const total = 10;

    function prepare() {
      questions = window.SDGAMES.pickQuestions("truefalse", total);

      if (!questions || !questions.length) {
        root.innerHTML = `
          <div class="alert alert-warning">
            Bank soal Benar/Salah belum terbaca. Pastikan <b>game-question-banks.js</b>
            dipanggil sebelum <b>game-truefalse.js</b>.
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
        <h2 class="h4 mb-2" style="font-weight:900;">✅❌ Benar / Salah</h2>
        <div class="text-muted mb-2">Soal benar/salah acak dari bank soal.</div>

        <div class="game-box">
          <div class="d-flex justify-content-between">
            <div class="text-muted">Soal <b>${idx + 1}/${questions.length}</b></div>
            <div class="fw-bold">Skor: ${score}</div>
          </div>

          <hr class="my-3">

          <div class="game-big" style="font-size:26px; line-height:1.35;">
            ${item.q}
          </div>

          <div class="d-flex gap-2 mt-3 flex-wrap">
            <button class="btn btn-success game-btn" id="trueBtn">✅ Benar</button>
            <button class="btn btn-danger game-btn" id="falseBtn">❌ Salah</button>
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

      function answer(value) {
        const correct = Boolean(item.a);

        if (value === correct) {
          score++;
          award(2, "Benar! ✅");

          msg.innerHTML = `
            <div class="alert alert-success py-2 mb-0">
              Benar ✅ ${item.explain || ""}
            </div>
          `;
        } else {
          miss(`Belum tepat 😄 Jawabannya: ${correct ? "Benar" : "Salah"}`);

          msg.innerHTML = `
            <div class="alert alert-danger py-2 mb-0">
              Salah ❌ ${item.explain || `Jawaban yang benar adalah ${correct ? "Benar" : "Salah"}.`}
            </div>
          `;
        }

        setTimeout(next, 700);
      }

      root.querySelector("#trueBtn").onclick = () => answer(true);
      root.querySelector("#falseBtn").onclick = () => answer(false);

      root.querySelector("#hint").onclick = () => {
        msg.innerHTML = `
          <div class="alert alert-warning py-2 mb-0">
            💡 ${item.hint || "Baca pernyataannya pelan-pelan."}
          </div>
        `;
        window.SDAPP?.fx?.tap?.();
      };

      root.querySelector("#skip").onclick = () => {
        miss(`Lewat dulu ya 😉 Jawabannya: ${item.a ? "Benar" : "Salah"}`);
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
        <h2 class="h4 mb-2" style="font-weight:900;">✅❌ Benar / Salah</h2>

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
        <h2 class="h4 mb-2" style="font-weight:900;">✅❌ Benar / Salah</h2>

        <div class="game-box text-center">
          <div class="fs-1">✅❌</div>
          <div class="fw-bold fs-4">Siap pilih benar atau salah?</div>
          <div class="text-muted mt-1">
            Soal akan diambil acak dari bank Benar/Salah.
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

    drawStart();
  }

  window.SDGAMES.renderTrueFalse = renderTrueFalse;
})();