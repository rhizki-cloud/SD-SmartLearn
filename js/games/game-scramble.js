(function () {
  "use strict";

  function renderScramble(root) {
    const { award, miss } = window.SDGAMES.shared;

    let questions = [];
    let idx = 0;
    let score = 0;
    const total = 10;

    function prepare() {
      questions = window.SDGAMES.pickQuestions("scramble", total);

      if (!questions || !questions.length) {
        root.innerHTML = `
          <div class="alert alert-warning">
            Bank soal Acak Kata belum terbaca. Pastikan <b>game-question-banks.js</b>
            dipanggil sebelum <b>game-scramble.js</b>.
          </div>
        `;
        return false;
      }

      return true;
    }

    function scrambleWord(word) {
      const arr = String(word || "").split("");

      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      const result = arr.join("");
      return result === word ? arr.reverse().join("") : result;
    }

    function draw() {
      const item = questions[idx];
      if (!item) return finish();

      const word = String(item.word || "").toUpperCase();
      const scrambled = scrambleWord(word);

      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">🔤 Acak Kata</h2>
        <div class="text-muted mb-2">Susun huruf dari bank soal Acak Kata.</div>

        <div class="game-box">
          <div class="d-flex justify-content-between">
            <div class="text-muted">
              Bahasa Indonesia • Soal <b>${idx + 1}/${questions.length}</b>
            </div>
            <div class="fw-bold">Skor: ${score}</div>
          </div>

          <hr class="my-3">

          <div class="game-big" style="letter-spacing:6px;">${scrambled}</div>

          <input
            class="form-control mt-3"
            id="ans"
            placeholder="Ketik jawaban..."
            autocomplete="off"
            autocapitalize="characters"
          >

          <div class="d-flex gap-2 mt-3 flex-wrap">
            <button class="btn btn-primary game-btn" id="check">Cek</button>
            <button class="btn btn-outline-primary game-btn" id="hint">💡 Hint</button>
            <button class="btn btn-outline-primary game-btn" id="skip">Lewati</button>
            <button class="btn btn-outline-secondary game-btn" id="reset">🔁 Ulang</button>
          </div>

          <div id="msg" class="mt-2"></div>
        </div>
      `;

      const input = root.querySelector("#ans");
      const msg = root.querySelector("#msg");

      function check() {
        const val = String(input.value || "").trim().toUpperCase();

        if (!val) {
          msg.innerHTML = `
            <div class="alert alert-warning py-2 mb-0">
              Ketik jawaban dulu ya 😄
            </div>
          `;
          return;
        }

        if (val === word) {
          score++;
          award(2, "Benar! Kata tersusun 🔤");

          msg.innerHTML = `
            <div class="alert alert-success py-2 mb-0">
              Benar ✅ ${item.explain || `Jawaban yang benar adalah ${word}.`}
            </div>
          `;
        } else {
          miss(`Belum tepat 😄 Jawabannya: ${word}`);

          msg.innerHTML = `
            <div class="alert alert-danger py-2 mb-0">
              Salah ❌ ${item.explain || `Jawaban yang benar adalah ${word}.`}
            </div>
          `;
        }

        setTimeout(next, 700);
      }

      root.querySelector("#check").onclick = check;

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") check();
      });

      root.querySelector("#hint").onclick = () => {
        msg.innerHTML = `
          <div class="alert alert-warning py-2 mb-0">
            💡 ${item.hint || `Kata ini memiliki ${word.length} huruf.`}
          </div>
        `;
        input.focus();
      };

      root.querySelector("#skip").onclick = () => {
        miss(`Lewat dulu ya 😉 Jawabannya: ${word}`);
        next();
      };

      root.querySelector("#reset").onclick = restart;

      setTimeout(() => input.focus(), 50);
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
        <h2 class="h4 mb-2" style="font-weight:900;">🔤 Acak Kata</h2>

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
        <h2 class="h4 mb-2" style="font-weight:900;">🔤 Acak Kata</h2>

        <div class="game-box text-center">
          <div class="fs-1">🔤</div>
          <div class="fw-bold fs-4">Siap susun kata?</div>
          <div class="text-muted mt-1">
            Kata akan diambil acak dari bank soal Acak Kata.
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

  window.SDGAMES.renderScramble = renderScramble;
})();