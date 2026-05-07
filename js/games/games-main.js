// js/games/games-main.js
window.SDGAMES = window.SDGAMES || {};

(function () {
  "use strict";

  const cards = document.querySelectorAll(".game-card[data-game]");

  const panels = {
    math: document.getElementById("game-math"),
    scramble: document.getElementById("game-scramble"),
    truefalse: document.getElementById("game-truefalse"),
    mapel: document.getElementById("game-mapel"),
    cerita: document.getElementById("game-cerita"),
    cepat: document.getElementById("game-cepat"),
  
    memory: document.getElementById("game-memory"),
    puzzle: document.getElementById("game-puzzle"),
    pic: document.getElementById("game-pic"),
    catchstar: document.getElementById("game-catchstar"),
    monster: document.getElementById("game-monster"),
    balloon: document.getElementById("game-balloon")
  };
  
  const names = {
    math: "Math Quiz",
    scramble: "Acak Kata",
    truefalse: "Benar / Salah",
    mapel: "Jelajah Mapel",
    cerita: "Soal Cerita",
    cepat: "Cepat Tepat",
  
    memory: "Memory Card",
    puzzle: "Puzzle Angka",
    pic: "Tebak Gambar",
    catchstar: "Tangkap Bintang",
    monster: "Pukul Monster",
    balloon: "Balon Angka"
  };
  
  const renderers = {
    math: window.SDGAMES.renderMathQuiz,
    scramble: window.SDGAMES.renderScramble,
    truefalse: window.SDGAMES.renderTrueFalse,
    mapel: window.SDGAMES.renderMapel,
    cerita: window.SDGAMES.renderCerita,
    cepat: window.SDGAMES.renderCepat,
  
    memory: window.SDGAMES.renderMemory,
    puzzle: window.SDGAMES.renderPuzzleAngka,
    pic: window.SDGAMES.renderTebakGambar,
    catchstar: window.SDGAMES.renderCatchStar,
    monster: window.SDGAMES.renderMonster,
    balloon: window.SDGAMES.renderBalloon
  };
  const rendered = {};

  function showGame(id) {
    Object.values(panels).forEach((p) => {
      if (p) p.style.display = "none";
    });

    cards.forEach((c) => {
      c.classList.toggle("active", c.dataset.game === id);
    });

    const panel = panels[id];
    if (!panel) return;

    panel.style.display = "";

    if (!rendered[id]) {
      const render = renderers[id];

      if (typeof render === "function") {
        render(panel);
        rendered[id] = true;
      } else {
        panel.innerHTML = `
          <div class="alert alert-warning mb-0">
            Game <b>${names[id] || id}</b> belum punya file render.
          </div>
        `;
      }
    }

    window.SDAPP?.mascot?.say?.(`Yuk main ${names[id] || id} 😄🎮`, "wow");
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => showGame(card.dataset.game));
  });

  document.getElementById("resetGameScore")?.addEventListener("click", () => {
    window.SDGAMES.shared?.resetGameScore?.();
  });

  showGame(document.querySelector(".game-card.active")?.dataset.game || "math");
})();
