// js/games/game-puzzle.js
window.SDGAMES = window.SDGAMES || {};

(function () {
  "use strict";

  const { award, miss, clamp, randInt, shuffle, safeText, getGrade, stopTimer } = window.SDGAMES.shared;

  

function renderPuzzleAngka(root) {
    const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];

    function isSolvable(arr) {
      const a = arr.filter((x) => x !== 0);
      let inv = 0;
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
      return inv % 2 === 0;
    }

    function shufflePuzzle() {
      let arr;
      do {
        arr = goal.slice().sort(() => Math.random() - 0.5);
      } while (!isSolvable(arr) || arr.join(",") === goal.join(","));
      return arr;
    }

    let board = shufflePuzzle();
    let moves = 0;

    function neighborsOfZero() {
      const zi = board.indexOf(0);
      const r = Math.floor(zi / 3), c = zi % 3;
      const n = [];
      const cand = [
        { r: r - 1, c },
        { r: r + 1, c },
        { r, c: c - 1 },
        { r, c: c + 1 },
      ];
      cand.forEach(({ r, c }) => {
        if (r >= 0 && r < 3 && c >= 0 && c < 3) n.push(r * 3 + c);
      });
      return n;
    }

    function moveTile(i) {
      const zi = board.indexOf(0);
      const movables = neighborsOfZero();
      if (!movables.includes(i)) {
        miss("Yang bisa digeser cuma yang dekat kotak kosong 😉");
        return;
      }

      board[zi] = board[i];
      board[i] = 0;
      moves++;

      if (board.join(",") === goal.join(",")) {
        award(5, "Puzzle selesai!");
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">🧩 Puzzle Angka</h2>
          <div class="game-box">
            <div class="fw-bold">Kamu Menang! 🏆</div>
            <div class="text-muted">Langkah: <b>${moves}</b></div>
            <button class="btn btn-primary game-btn mt-2" id="npAgain">🔀 Main Lagi</button>
          </div>
        `;
        root.querySelector("#npAgain").onclick = () => {
          board = shufflePuzzle();
          moves = 0;
          draw();
        };
        return;
      }

      draw();
    }

    function draw() {
      const movables = neighborsOfZero();

      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">🧩 Puzzle Angka</h2>
        <div class="text-muted mb-2">Klik angka yang dekat kotak kosong untuk menggeser.</div>
        <div class="game-box">
          <div class="d-flex justify-content-between">
            <div class="text-muted">Susun 1–8</div>
            <div class="fw-bold">Langkah: ${moves}</div>
          </div>

          <div class="np-grid mt-3" style="grid-template-columns:repeat(3,minmax(60px,1fr))">
            ${board.map((v, i) => {
              if (v === 0) return `<div class="np-tile empty" data-i="${i}" aria-hidden="true"></div>`;
              const mv = movables.includes(i) ? "movable" : "";
              return `<button class="np-tile ${mv}" data-i="${i}" style="pointer-events:auto; position:relative; z-index:2;">${v}</button>`;
            }).join("")}
          </div>

          <div class="d-flex gap-2 mt-3 flex-wrap">
            <button class="btn btn-outline-primary game-btn" id="npReset">🔀 Acak</button>
          </div>
        </div>
      `;

      root.querySelectorAll("[data-i]").forEach((el) => {
        el.onclick = () => {
          const i = Number(el.getAttribute("data-i"));
          if (board[i] === 0) return;
          moveTile(i);
        };
      });

      root.querySelector("#npReset").onclick = () => {
        board = shufflePuzzle();
        moves = 0;
        draw();
      };
    }

    draw();
  }

  window.SDGAMES.renderPuzzleAngka = renderPuzzleAngka;
})();
