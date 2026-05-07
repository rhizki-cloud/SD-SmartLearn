// js/games/game-memory.js
window.SDGAMES = window.SDGAMES || {};

(function () {
  "use strict";

  const { award, miss, clamp, randInt, shuffle, safeText, getGrade, stopTimer } = window.SDGAMES.shared;

  

function renderMemory(root) {
    const emojis = ["🍎", "🍌", "🍇", "🍉", "⭐", "🌈", "🚀", "🎲"];
    const deck = shuffle([...emojis, ...emojis]);

    let open = null;
    let done = new Set();
    let moves = 0;

    function draw() {
      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">🧠 Memory Card</h2>
        <div class="text-muted mb-2">Cari pasangan emoji yang sama.</div>
        <div class="game-box">
          <div class="d-flex justify-content-between">
            <div class="text-muted">Cari pasangan</div>
            <div class="fw-bold">Gerakan: ${moves}</div>
          </div>
          <div class="np-grid mt-3" id="mmGrid" style="grid-template-columns:repeat(4,minmax(58px,1fr))">
            ${deck.map((e, i) => {
              const show = done.has(i) || open === i;
              return `<button class="np-tile ${done.has(i) ? "done" : ""} ${open === i ? "open" : ""}" data-i="${i}" aria-label="kartu" style="pointer-events:auto; position:relative; z-index:2;">${show ? e : "❓"}</button>`;
            }).join("")}
          </div>
        </div>
      `;

      root.querySelectorAll("[data-i]").forEach((el) => {
        el.onclick = () => {
          const i = Number(el.getAttribute("data-i"));
          if (done.has(i) || open === i) return;

          if (open === null) {
            open = i;
            draw();
            return;
          }

          moves++;
          const first = open;
          const second = i;
          open = second;
          draw();

          const ok = deck[first] === deck[second];
          setTimeout(() => {
            if (ok) {
              done.add(first);
              done.add(second);
              award(2, "Pas!");
            } else {
              miss("Belum pas 😄");
            }
            open = null;

            if (done.size === deck.length) {
              award(3, "Selesai!");
              root.innerHTML = `
                <h2 class="h4 mb-2" style="font-weight:900;">🧠 Memory Card</h2>
                <div class="game-box">
                  <div class="fw-bold">Selesai! 🏁</div>
                  <div class="text-muted">Gerakan: <b>${moves}</b></div>
                  <button class="btn btn-primary game-btn mt-2" id="mmAgain">🔁 Main Lagi</button>
                </div>`;
              root.querySelector("#mmAgain").onclick = () => location.reload();
              return;
            }

            draw();
          }, 420);
        };
      });
    }

    draw();
  }

  window.SDGAMES.renderMemory = renderMemory;
})();
