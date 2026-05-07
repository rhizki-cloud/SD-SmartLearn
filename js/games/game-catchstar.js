(function () {
    "use strict";
  
    function renderCatchStar(root) {
      const { award, miss } = window.SDGAMES.shared;
  
      let score = 0;
      let combo = 0;
      let best = Number(localStorage.getItem("sd_catchstar_best") || "0");
      let time = 30;
      let running = false;
      let timer = null;
      let spawnTimer = null;
      let level = 1;
  
      const items = [
        { icon: "⭐", point: 1, type: "good" },
        { icon: "🌟", point: 2, type: "good" },
        { icon: "💎", point: 4, type: "bonus" },
        { icon: "⚡", point: 0, type: "time" },
        { icon: "💣", point: -3, type: "bad" }
      ];
  
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
        localStorage.setItem("sd_catchstar_best", String(best));
  
        if (score > 0) {
          award(Math.max(1, Math.floor(score / 8)), "Tangkap Bintang selesai! ⭐");
        } else {
          miss("Belum dapat bintang, coba lagi ya 😄");
        }
  
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">⭐ Tangkap Bintang</h2>
  
          <div class="game-box text-center catch-result">
            <div class="catch-big">🏁</div>
            <div class="fw-bold fs-4">Waktu habis!</div>
  
            <div class="catch-result-grid mt-3">
              <div class="catch-mini-stat">
                <b>${score}</b>
                <span>Skor</span>
              </div>
              <div class="catch-mini-stat">
                <b>${best}</b>
                <span>Rekor</span>
              </div>
              <div class="catch-mini-stat">
                <b>Lv ${level}</b>
                <span>Level</span>
              </div>
            </div>
  
            <button class="btn btn-primary game-btn mt-3" id="csAgain">
              🔁 Main Lagi
            </button>
          </div>
        `;
  
        root.querySelector("#csAgain").onclick = start;
      }
  
      function drawStart() {
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">⭐ Tangkap Bintang</h2>
          <div class="text-muted mb-2">Game refreshing: cepat, seru, dan penuh kejutan!</div>
  
          <div class="game-box text-center catch-start">
            <div class="catch-big">⭐</div>
            <div class="fw-bold fs-4">Siap tangkap bintang?</div>
            <div class="text-muted mt-1">
              Tangkap ⭐, ambil 💎, hindari 💣, dan kumpulkan combo!
            </div>
  
            <div class="catch-rules mt-3">
              <span>⭐ +1</span>
              <span>🌟 +2</span>
              <span>💎 +4</span>
              <span>⚡ +3 detik</span>
              <span>💣 -3</span>
            </div>
  
            <button class="btn btn-primary game-btn mt-3" id="csStart">
              ▶️ Mulai
            </button>
          </div>
        `;
  
        root.querySelector("#csStart").onclick = start;
      }
  
      function drawGame() {
        root.innerHTML = `
          <h2 class="h4 mb-2" style="font-weight:900;">⭐ Tangkap Bintang</h2>
  
          <div class="game-box">
            <div class="catch-hud">
              <div>⏱️ <b id="csTime">${time}s</b></div>
              <div>⭐ <b id="csScore">${score}</b></div>
              <div>🔥 <b id="csCombo">${combo}x</b></div>
              <div>🏆 <b>${best}</b></div>
            </div>
  
            <div id="csArena" class="catch-arena">
              <div class="catch-cloud c1">☁️</div>
              <div class="catch-cloud c2">☁️</div>
              <div class="catch-cloud c3">☁️</div>
            </div>
  
            <div class="small text-muted mt-2">
              Level naik otomatis saat skor bertambah. Semakin tinggi level, item makin cepat hilang!
            </div>
          </div>
        `;
      }
  
      function updateHUD() {
        const timeEl = root.querySelector("#csTime");
        const scoreEl = root.querySelector("#csScore");
        const comboEl = root.querySelector("#csCombo");
  
        if (timeEl) timeEl.textContent = `${time}s`;
        if (scoreEl) scoreEl.textContent = score;
        if (comboEl) comboEl.textContent = `${combo}x`;
      }
  
      function pickItem() {
        const r = Math.random();
  
        if (r < 0.08) return items[4]; // bomb
        if (r < 0.18) return items[3]; // time
        if (r < 0.30) return items[2]; // diamond
        if (r < 0.55) return items[1]; // big star
        return items[0]; // star
      }
  
      function spawnLoop() {
        if (!running) return;
  
        spawnItem();
  
        const speed = Math.max(380, 950 - level * 70);
        spawnTimer = setTimeout(spawnLoop, speed);
      }
  
      function spawnItem() {
        const arena = root.querySelector("#csArena");
        if (!arena || !running) return;
  
        const item = pickItem();
        const btn = document.createElement("button");
  
        btn.type = "button";
        btn.className = `catch-item catch-${item.type}`;
        btn.textContent = item.icon;
  
        btn.style.left = `${Math.random() * 84}%`;
        btn.style.top = `${Math.random() * 72}%`;
  
        const life = Math.max(850, 1900 - level * 120);
        const removeTimer = setTimeout(() => {
          if (!btn.isConnected) return;
          btn.classList.add("missed");
          setTimeout(() => btn.remove(), 220);
  
          if (item.type === "good" || item.type === "bonus") {
            combo = 0;
            updateHUD();
          }
        }, life);
  
        btn.onclick = () => {
          if (!running) return;
  
          clearTimeout(removeTimer);
  
          handleItem(item, btn);
          btn.remove();
        };
  
        arena.appendChild(btn);
      }
  
      function handleItem(item, btn) {
        if (item.type === "bad") {
          score = Math.max(0, score + item.point);
          combo = 0;
          popText(btn, "💥 -3");
          window.SDAPP?.fx?.wrong?.();
        } else if (item.type === "time") {
          time += 3;
          combo++;
          popText(btn, "⏱️ +3s");
          window.SDAPP?.fx?.tap?.();
        } else {
          combo++;
          const comboBonus = combo > 0 && combo % 5 === 0 ? 3 : 0;
          score += item.point + comboBonus;
  
          popText(btn, comboBonus ? `+${item.point + comboBonus} 🔥` : `+${item.point}`);
          window.SDAPP?.fx?.tap?.();
        }
  
        level = Math.min(10, Math.floor(score / 12) + 1);
        updateHUD();
      }
  
      function popText(btn, text) {
        const arena = root.querySelector("#csArena");
        if (!arena) return;
  
        const pop = document.createElement("div");
        pop.className = "catch-pop";
        pop.textContent = text;
        pop.style.left = btn.style.left;
        pop.style.top = btn.style.top;
  
        arena.appendChild(pop);
  
        setTimeout(() => pop.remove(), 650);
      }
  
      drawStart();
    }
  
    window.SDGAMES.renderCatchStar = renderCatchStar;
  })();