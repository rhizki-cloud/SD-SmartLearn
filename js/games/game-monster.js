(function () {
  "use strict";

  function renderMonster(root) {
    const { award, miss } = window.SDGAMES.shared;

    let score = 0;
    let combo = 0;
    let time = 30;
    let level = 1;
    let best = Number(localStorage.getItem("sd_monster_best") || "0");
    let running = false;
    let timer = null;
    let spawnTimer = null;

    function start() {
      score = 0;
      combo = 0;
      time = 30;
      level = 1;
      running = true;
      drawGame();

      timer = setInterval(() => {
        time--;
        updateHUD();
        if (time <= 0) finish();
      }, 1000);

      spawnLoop();
    }

    function finish() {
      running = false;
      clearInterval(timer);
      clearTimeout(spawnTimer);

      best = Math.max(best, score);
      localStorage.setItem("sd_monster_best", String(best));

      if (score > 0) award(Math.max(1, Math.floor(score / 7)), "Monster kalah! 👾");
      else miss("Belum kena monster, coba lagi ya 😄");

      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">👾 Pukul Monster</h2>
        <div class="game-box text-center">
          <div style="font-size:64px;">🏁</div>
          <div class="fw-bold fs-4">Selesai!</div>

          <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
            <div class="kid-chip">⭐ Skor ${score}</div>
            <div class="kid-chip">🏆 Rekor ${best}</div>
            <div class="kid-chip">🔥 Combo ${combo}</div>
            <div class="kid-chip">Lv ${level}</div>
          </div>

          <button class="btn btn-primary game-btn mt-3" id="again">🔁 Main Lagi</button>
        </div>
      `;

      root.querySelector("#again").onclick = start;
    }

    function drawStart() {
      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">👾 Pukul Monster</h2>
        <div class="game-box text-center">
          <div style="font-size:72px;">👾</div>
          <div class="fw-bold fs-4">Pukul monster sebanyak mungkin!</div>
          <div class="text-muted mt-1">
            Klik 👾 dan 👑. Hindari 💣. Ambil ❤️ untuk tambah waktu.
          </div>

          <div class="d-flex justify-content-center flex-wrap gap-2 mt-3">
            <span class="kid-chip">👾 +1</span>
            <span class="kid-chip">👑 +3</span>
            <span class="kid-chip">❤️ +3 detik</span>
            <span class="kid-chip">💣 -5</span>
          </div>

          <button class="btn btn-primary game-btn mt-3" id="start">▶️ Mulai</button>
        </div>
      `;

      root.querySelector("#start").onclick = start;
    }

    function drawGame() {
      root.innerHTML = `
        <h2 class="h4 mb-2" style="font-weight:900;">👾 Pukul Monster</h2>

        <div class="game-box">
          <div class="monster-hud">
            <div>⏱️ <b id="mTime">${time}s</b></div>
            <div>⭐ <b id="mScore">${score}</b></div>
            <div>🔥 <b id="mCombo">${combo}x</b></div>
            <div>Lv <b id="mLevel">${level}</b></div>
          </div>

          <div id="monsterArena" class="monster-arena">
            <div class="monster-bg m1">🌙</div>
            <div class="monster-bg m2">☁️</div>
            <div class="monster-bg m3">✨</div>
          </div>

          <div class="small text-muted mt-2">
            Semakin tinggi level, monster makin cepat hilang.
          </div>
        </div>
      `;
    }

    function updateHUD() {
      const t = root.querySelector("#mTime");
      const s = root.querySelector("#mScore");
      const c = root.querySelector("#mCombo");
      const l = root.querySelector("#mLevel");

      if (t) t.textContent = `${time}s`;
      if (s) s.textContent = score;
      if (c) c.textContent = `${combo}x`;
      if (l) l.textContent = level;
    }

    function pickItem() {
      const r = Math.random();
      if (r < 0.12) return { icon: "💣", type: "bomb", point: -5 };
      if (r < 0.22) return { icon: "❤️", type: "time", point: 0 };
      if (r < 0.34) return { icon: "👑", type: "boss", point: 3 };
      return { icon: "👾", type: "monster", point: 1 };
    }

    function spawnLoop() {
      if (!running) return;
      spawnItem();

      const delay = Math.max(360, 920 - level * 65);
      spawnTimer = setTimeout(spawnLoop, delay);
    }

    function spawnItem() {
      const arena = root.querySelector("#monsterArena");
      if (!arena || !running) return;

      const item = pickItem();
      const btn = document.createElement("button");

      btn.type = "button";
      btn.className = `monster-item monster-${item.type}`;
      btn.textContent = item.icon;
      btn.style.left = `${Math.random() * 84}%`;
      btn.style.top = `${Math.random() * 74}%`;

      const life = Math.max(650, 1700 - level * 100);

      const lifeTimer = setTimeout(() => {
        if (!btn.isConnected) return;

        btn.classList.add("monster-miss");
        setTimeout(() => btn.remove(), 220);

        if (item.type === "monster" || item.type === "boss") {
          combo = 0;
          updateHUD();
        }
      }, life);

      btn.onclick = () => {
        clearTimeout(lifeTimer);
        handleHit(item, btn);
        btn.remove();
      };

      arena.appendChild(btn);
    }

    function handleHit(item, btn) {
      if (item.type === "bomb") {
        score = Math.max(0, score + item.point);
        combo = 0;
        pop(btn, "💥 -5");
        window.SDAPP?.fx?.wrong?.();
      } else if (item.type === "time") {
        time += 3;
        combo++;
        pop(btn, "❤️ +3s");
        window.SDAPP?.fx?.tap?.();
      } else {
        combo++;
        const bonus = combo > 0 && combo % 5 === 0 ? 3 : 0;
        score += item.point + bonus;
        pop(btn, bonus ? `+${item.point + bonus} 🔥` : `+${item.point}`);
        window.SDAPP?.fx?.tap?.();
      }

      level = Math.min(10, Math.floor(score / 10) + 1);
      updateHUD();
    }

    function pop(btn, text) {
      const arena = root.querySelector("#monsterArena");
      if (!arena) return;

      const el = document.createElement("div");
      el.className = "monster-pop";
      el.textContent = text;
      el.style.left = btn.style.left;
      el.style.top = btn.style.top;

      arena.appendChild(el);
      setTimeout(() => el.remove(), 650);
    }

    drawStart();
  }

  window.SDGAMES.renderMonster = renderMonster;
})();