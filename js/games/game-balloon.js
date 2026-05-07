(function () {
  "use strict";

  function renderBalloon(root) {
    const { award, miss } = window.SDGAMES.shared;

    let questions = [];
    let score = 0;
    let round = 0;
    let streak = 0;
    let level = 1;
    let best = Number(localStorage.getItem("sd_balloon_best") || "0");

    const total = 12;

    function prepare() {
      questions = window.SDGAMES.pickQuestions("balloon", total);

      if (!questions || !questions.length) {
        root.innerHTML = `
          <div class="alert alert-warning">
            Bank soal Balon Angka belum terbaca. Pastikan <b>game-question-banks.js</b>
            dipanggil sebelum <b>game-balloon.js</b>.
          </div>
        `;
        return false;
      }

      return true;
    }

    function start() {
      score = 0;
      round = 0;
      streak = 0;
      level = 1;

      if (prepare()) nextRound();
    }

    function nextRound() {
      round++;
      level = Math.min(10, Math.floor(score / 8) + 1);
      draw();
    }

    function getCurrentQuestion() {
      return questions[round - 1];
    }

    function draw() {
      const item = getCurrentQuestion();
      if (!item) return finish();

      const opts = shuffleArray(item.opts || []);

      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">🎈 Balon Angka</h2>

        <div class="game-box">
          <div class="balloon-hud">
            <div>Ronde <b>${round}/${questions.length}</b></div>
            <div>⭐ <b>${score}</b></div>
            <div>🔥 <b>${streak}x</b></div>
            <div>Lv <b>${level}</b></div>
          </div>

          <div class="balloon-target mt-3">
            ${item.q}
          </div>

          <div class="balloon-arena mt-3">
            ${opts.map((o, i) => `
              <button
                class="balloon-item balloon-${i}"
                data-value="${o}"
                style="animation-delay:${i * 0.08}s"
              >
                <span class="balloon-emoji">${balloonEmoji(item.mode, o)}</span>
                <b>${o}</b>
              </button>
            `).join("")}
          </div>

          <div class="small text-muted mt-2">
            Jawaban benar menaikkan streak. Salah membuat streak kembali 0.
          </div>

          <div id="balloonMsg" class="mt-2"></div>
        </div>
      `;

      const msg = root.querySelector("#balloonMsg");

      root.querySelectorAll("[data-value]").forEach((btn) => {
        btn.onclick = () => {
          const val = String(btn.dataset.value);
          const correct = String(item.a);

          if (val === correct) {
            streak++;
            const bonus = streak > 0 && streak % 4 === 0 ? 3 : 0;
            score += 2 + bonus;

            btn.classList.add("balloon-pop-good");
            window.SDAPP?.fx?.tap?.();

            if (msg) {
              msg.innerHTML = `
                <div class="alert alert-success py-2 mb-0">
                  Benar ✅ ${item.explain || ""}
                </div>
              `;
            }
          } else {
            streak = 0;
            score = Math.max(0, score - 1);

            btn.classList.add("balloon-pop-bad");
            miss(`Balon salah 😄 Jawabannya: ${correct}`);

            if (msg) {
              msg.innerHTML = `
                <div class="alert alert-danger py-2 mb-0">
                  Salah ❌ ${item.explain || `Jawaban yang benar adalah ${correct}.`}
                </div>
              `;
            }
          }

          setTimeout(() => {
            if (round >= questions.length) return finish();
            nextRound();
          }, 520);
        };
      });
    }

    function balloonEmoji(mode, value) {
      if (mode === "color") {
        const map = {
          Merah: "🔴",
          Biru: "🔵",
          Kuning: "🟡",
          Hijau: "🟢",
          Ungu: "🟣",
          Pink: "🌸"
        };

        return map[value] || "🎈";
      }

      return "🎈";
    }

    function finish() {
      best = Math.max(best, score);
      localStorage.setItem("sd_balloon_best", String(best));

      if (score > 0) {
        award(Math.max(1, Math.floor(score / 8)), "Balon selesai 🎈");
      } else {
        miss("Belum dapat skor, coba lagi ya 😄");
      }

      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">🎈 Balon Angka</h2>

        <div class="game-box text-center">
          <div style="font-size:70px;">🏁</div>
          <div class="fw-bold fs-4">Selesai 🎉</div>

          <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
            <div class="kid-chip">⭐ Skor ${score}</div>
            <div class="kid-chip">🏆 Rekor ${best}</div>
            <div class="kid-chip">🔥 Streak ${streak}</div>
          </div>

          <button class="btn btn-primary game-btn mt-3" id="again">🔁 Main Lagi dengan Soal Baru</button>
        </div>
      `;

      root.querySelector("#again").onclick = start;
    }

    function drawStart() {
      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">🎈 Balon Angka</h2>

        <div class="game-box text-center">
          <div style="font-size:74px;">🎈</div>
          <div class="fw-bold fs-4">Pecahkan balon yang tepat!</div>
          <div class="text-muted mt-1">
            Soal diambil acak dari bank soal Balon Angka.
          </div>

          <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
            <span class="kid-chip">🔢 Angka</span>
            <span class="kid-chip">➕ Hitung</span>
            <span class="kid-chip">🎨 Warna</span>
            <span class="kid-chip">🔥 Streak</span>
          </div>

          <button class="btn btn-primary game-btn mt-3" id="start">▶️ Mulai</button>
        </div>
      `;

      root.querySelector("#start").onclick = start;
    }

    function shuffleArray(arr) {
      return arr.slice().sort(() => Math.random() - 0.5);
    }

    drawStart();
  }

  window.SDGAMES.renderBalloon = renderBalloon;
})();