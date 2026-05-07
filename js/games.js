(function () {
  "use strict";

  // ===== GAMES POINTS =====
  let gPoints = Number(localStorage.getItem("sd_game_points") || "0");
  let gStreak = Number(localStorage.getItem("sd_game_streak") || "0");
  const elPts = document.getElementById("gPoints");
  const elStr = document.getElementById("gStreak");

  function syncTop() {
    if (elPts) elPts.textContent = String(gPoints);
    if (elStr) elStr.textContent = String(gStreak);
    localStorage.setItem("sd_game_points", String(gPoints));
    localStorage.setItem("sd_game_streak", String(gStreak));
  }

  function award(points, mood = "proud", msg = "Yeay!") {
    gPoints += points;
    gStreak += 1;
    syncTop();
    window.SDAPP?.level?.addXP?.(points * 2, "Games");
    window.SDAPP?.fx?.yay?.();
    window.SDAPP?.mascot?.say?.(`${msg} +${points}⭐ (Total ${gPoints})`, mood);
  }

  function miss(mood = "oops", msg = "Coba lagi ya 😄") {
    gStreak = 0;
    syncTop();
    window.SDAPP?.mascot?.say?.(msg, mood);
  }

  syncTop();

  // ===== Tab Switcher (unlock all) =====
  const cards = Array.from(document.querySelectorAll(".game-card[data-game]"));
  const panels = Array.from(document.querySelectorAll(".game-panel"));

  function showGame(key) {
    panels.forEach((p) => (p.style.display = "none"));
    cards.forEach((c) => c.classList.remove("active"));

    const panel = document.getElementById("game-" + key);
    if (panel) panel.style.display = "block";

    const card = document.querySelector(`.game-card[data-game="${key}"]`);
    if (card) card.classList.add("active");

    window.SDAPP?.mascot?.say?.(`Yuk main ${key}! 🎮`, "happy");
  }

  cards.forEach((c) => {
    // pastikan ga ada "locked" yang bikin tidak bisa diklik
    c.classList.remove("locked");
    c.addEventListener("click", () => {
      const k = c.getAttribute("data-game");
      if (k) showGame(k);
    });
  });

  // ---------- Math Quiz ----------
  const mathRoot = document.getElementById("mathGame");
  if (mathRoot) {
    let idx = 0,
      score = 0;
    const total = 10;

    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function newQuestion() {
      const a = randInt(1, 30);
      const b = randInt(1, 30);
      const op = Math.random() < 0.5 ? "+" : "-";
      const ans = op === "+" ? a + b : a - b;
      return { text: `${a} ${op} ${b} = ?`, ans };
    }

    let current = newQuestion();

    function render() {
      mathRoot.innerHTML = `
        <div class="d-flex justify-content-between small text-muted mb-2">
          <div>Soal ${idx + 1}/${total}</div>
          <div>Skor: ${score}</div>
        </div>
        <div class="fs-4 fw-bold mb-2">${current.text}</div>
        <div class="input-group">
          <input id="mathAns" class="form-control" inputmode="numeric" placeholder="Jawaban..." />
          <button class="btn btn-primary" id="mathSubmit">Jawab</button>
        </div>
        <div class="small text-muted mt-2">Tip: gunakan angka, lalu klik “Jawab”.</div>
      `;

      const input = mathRoot.querySelector("#mathAns");
      const btn = mathRoot.querySelector("#mathSubmit");

      const submit = () => {
        const val = Number(input.value);
        if (Number.isNaN(val)) return;

        const isCorrect = val === current.ans;
        if (isCorrect) {
          score++;
          award(1, "proud", "Benar!");
          window.SDAPP?.mascotSmartSay?.("game_correct");
        } else {
          miss("oops", `Belum tepat 😄 Jawabannya ${current.ans}`);
          window.SDAPP?.mascotSmartSay?.("game_wrong");
        }

        idx++;
        if (idx >= total) {
          window.SDAPP?.mascotSmartSay?.("game_finish");
          mathRoot.innerHTML = `
            <div class="fw-bold">Selesai! 🎉</div>
            <div>Skor kamu: <span class="fw-bold">${score}</span> / ${total}</div>
            <button class="btn btn-outline-primary mt-2" id="mathRetry">Main lagi</button>
          `;
          mathRoot.querySelector("#mathRetry").onclick = () => {
            idx = 0;
            score = 0;
            current = newQuestion();
            render();
          };
          return;
        }

        current = newQuestion();
        render();
      };

      btn.onclick = submit;
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submit();
      });
      input.focus();
    }

    render();
  }

  // ---------- Word Scramble ----------
  const scrRoot = document.getElementById("scrambleGame");
  if (scrRoot) {
    const words = ["SEKOLAH", "BACA", "GURU", "BOLA", "PETA", "HEWAN", "AIR", "BAJU", "RUMAH", "INDONESIA"];
    let target = pick();
    let score = 0;

    function pick() {
      return words[Math.floor(Math.random() * words.length)];
    }
    function shuffleStr(s) {
      const arr = s.split("");
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join("");
    }

    function render() {
      const scrambled = shuffleStr(target);
      scrRoot.innerHTML = `
        <div class="d-flex justify-content-between small text-muted mb-2">
          <div>Skor: ${score}</div>
          <button class="btn btn-sm btn-outline-secondary" id="scrNext">Ganti kata</button>
        </div>
        <div class="fs-5 fw-bold mb-2">Susun: <span class="badge text-bg-light border">${scrambled}</span></div>
        <div class="input-group">
          <input id="scrAns" class="form-control" placeholder="Ketik kata..." />
          <button class="btn btn-primary" id="scrSubmit">Cek</button>
        </div>
        <div id="scrMsg" class="small mt-2"></div>
      `;

      scrRoot.querySelector("#scrNext").onclick = () => {
        target = pick();
        render();
      };

      const input = scrRoot.querySelector("#scrAns");
      const msg = scrRoot.querySelector("#scrMsg");

      scrRoot.querySelector("#scrSubmit").onclick = () => {
        const val = (input.value || "").trim().toUpperCase();
        if (!val) return;

        const isCorrect = val === target;
        if (isCorrect) {
          score++;
          award(1, "proud", "Mantap!");
          window.SDAPP?.mascotSmartSay?.("game_correct");
          msg.className = "small mt-2 text-success";
          msg.textContent = "Benar! ✅";
          target = pick();
          setTimeout(render, 450);
        } else {
          miss("oops", "Belum tepat 😄 coba lagi!");
          window.SDAPP?.mascotSmartSay?.("game_wrong");
          msg.className = "small mt-2 text-danger";
          msg.textContent = "Belum tepat 🙂";
          input.classList.add("shake");
          setTimeout(() => input.classList.remove("shake"), 300);
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") scrRoot.querySelector("#scrSubmit").click();
      });

      input.focus();
    }

    render();
  }

  // ---------- True/False Game ----------
  const tfRoot = document.getElementById("tfGame");
  if (tfRoot) {
    const bank = [
      { t: "8 + 5 = 13", a: true, s: "Matematika" },
      { t: "10 - 7 = 5", a: false, s: "Matematika" },
      { t: "Air itu berwujud cair 💧", a: true, s: "IPAS" },
      { t: "Matahari terbit dari barat", a: false, s: "IPAS" },
      { t: "Sila ke-1 adalah Ketuhanan Yang Maha Esa 🇮🇩", a: true, s: "Pancasila" },
      { t: "Musyawarah berarti memaksakan pendapat", a: false, s: "Pancasila" },
      { t: "Segitiga punya 3 sisi 🔺", a: true, s: "Matematika" },
      { t: "2 × 3 = 5", a: false, s: "Matematika" },
      { t: "Kita harus antri dengan tertib 🤝", a: true, s: "Pancasila" },
      { t: "Tumbuhan butuh air untuk hidup 🌱", a: true, s: "IPAS" },
    ];
    let idx = 0,
      score = 0;
    const total = 10;

    function render() {
      const it = bank[idx];
      tfRoot.innerHTML = `
        <div class="game-box">
          <div class="game-row">
            <div class="text-muted">Soal ${idx + 1}/${total} • ${it.s}</div>
            <div class="fw-bold">Skor: ${score}</div>
          </div>
          <div class="game-big mt-2">${it.t}</div>
          <div class="tap-target mt-3">
            <button class="btn btn-success game-btn" id="tfTrue">✅ Benar</button>
            <button class="btn btn-danger game-btn" id="tfFalse">❌ Salah</button>
          </div>
          <div class="small text-muted mt-2">Tip: baca pelan-pelan ya 😄</div>
        </div>
      `;

      const pickAns = (ans) => {
        const ok = ans === it.a;
        if (ok) {
          score++;
          award(1, "proud", "Benar!");
          window.SDAPP?.mascotSmartSay?.("game_correct");
        } else {
          miss("oops", "Belum tepat 😄");
          window.SDAPP?.mascotSmartSay?.("game_wrong");
        }

        idx++;
        if (idx >= total) {
          window.SDAPP?.mascotSmartSay?.("game_finish");
          tfRoot.innerHTML = `
            <div class="game-box">
              <div class="fw-bold">Selesai! 🎉</div>
              <div class="text-muted">Nilai kamu: <b>${score}/${total}</b></div>
              <button class="btn btn-primary game-btn mt-2" id="tfAgain">🔁 Main Lagi</button>
            </div>
          `;
          tfRoot.querySelector("#tfAgain").onclick = () => {
            idx = 0;
            score = 0;
            render();
          };
          return;
        }

        render();
      };

      tfRoot.querySelector("#tfTrue").onclick = () => pickAns(true);
      tfRoot.querySelector("#tfFalse").onclick = () => pickAns(false);
    }

    render();
  }

  // ---------- Memory Match ----------
  const matchRoot = document.getElementById("matchGame");
  if (matchRoot) {
    const emojis = ["🍎", "🍌", "🍇", "🍉", "⭐", "🌈", "🚀", "🎲"];
    const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

    let openIdx = null;
    let done = new Set();
    let moves = 0;

    function render() {
      const cardsHTML = deck
        .map((e, i) => {
          const isDone = done.has(i);
          const isOpen = openIdx === i;
          const show = isDone || isOpen;
          return `<div class="match-card ${isDone ? "done" : ""} ${isOpen ? "open" : ""}" data-i="${i}">${show ? e : "❓"}</div>`;
        })
        .join("");

      matchRoot.innerHTML = `
        <div class="game-box">
          <div class="game-row">
            <div class="text-muted">Cari pasangan yang sama 🧠</div>
            <div class="fw-bold">Gerakan: ${moves}</div>
          </div>
          <div class="match-grid mt-3">${cardsHTML}</div>
          <div class="small text-muted mt-2">Tip: ingat posisi kartu ya 😄</div>
        </div>
      `;

      matchRoot.querySelectorAll(".match-card").forEach((el) => {
        el.addEventListener("click", () => {
          const i = Number(el.getAttribute("data-i"));
          if (done.has(i) || openIdx === i) return;

          if (openIdx === null) {
            openIdx = i;
            render();
            return;
          }

          moves++;
          const first = openIdx;
          const second = i;
          openIdx = second;
          render();

          const ok = deck[first] === deck[second];
          setTimeout(() => {
            if (ok) {
              done.add(first);
              done.add(second);
              award(2, "proud", "Pas!");
              window.SDAPP?.mascotSmartSay?.("game_correct");
            } else {
              miss("oops", "Belum pas 😄");
              window.SDAPP?.mascotSmartSay?.("game_wrong");
            }

            openIdx = null;

            if (done.size === deck.length) {
              matchRoot.innerHTML = `
                <div class="game-box">
                  <div class="fw-bold">Selesai! 🏁</div>
                  <div class="text-muted">Kamu selesai dengan <b>${moves}</b> gerakan 🎉</div>
                  <button class="btn btn-primary game-btn mt-2" id="mmAgain">🔁 Main Lagi</button>
                </div>
              `;
              matchRoot.querySelector("#mmAgain").onclick = () => location.reload();
              return;
            }

            render();
          }, 520);
        });
      });
    }

    render();
  }

  // ---------- Quick Tap ----------
  const tapRoot = document.getElementById("quickTapGame");
  if (tapRoot) {
    const targets = [
      { k: "⭐", label: "Bintang" },
      { k: "🍎", label: "Apel" },
      { k: "🌈", label: "Pelangi" },
      { k: "🚀", label: "Roket" },
      { k: "🎲", label: "Dadu" },
      { k: "🐱", label: "Kucing" },
    ];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let time = 20;
    let score = 0;
    let cur = pick(targets);
    let timer = null;

    function render() {
      tapRoot.innerHTML = `
        <div class="game-box">
          <div class="game-row">
            <div class="text-muted">Waktu: <b id="qtTime">${time}s</b></div>
            <div class="fw-bold">Skor: ${score}</div>
          </div>
          <div class="game-big mt-2">Klik: ${cur.k} <span class="text-muted" style="font-size:18px;">(${cur.label})</span></div>
          <div class="tap-target mt-3" id="tapBtns">
            ${targets.map((t) => `<div class="tap-pill" data-k="${t.k}">${t.k} ${t.label}</div>`).join("")}
          </div>
          <div class="small text-muted mt-2">Tip: cepat tapi hati-hati ⚡</div>
        </div>
      `;

      tapRoot.querySelectorAll(".tap-pill").forEach((b) => {
        b.addEventListener("click", () => {
          const k = b.getAttribute("data-k");
          if (k === cur.k) {
            score++;
            award(1, "proud", "Tepat!");
            cur = pick(targets);
            render();
          } else {
            miss("oops", "Ups! Bukan itu 😄");
            b.classList.add("shake");
            setTimeout(() => b.classList.remove("shake"), 250);
          }
        });
      });
    }

    function start() {
      if (timer) clearInterval(timer);
      time = 20;
      score = 0;
      cur = pick(targets);
      render();

      timer = setInterval(() => {
        time--;
        const w = document.getElementById("qtTime");
        if (w) w.textContent = `${time}s`;

        if (time <= 0) {
          clearInterval(timer);
          window.SDAPP?.mascotSmartSay?.("game_finish");
          tapRoot.innerHTML = `
            <div class="game-box">
              <div class="fw-bold">Waktu habis! ⏰</div>
              <div class="text-muted">Skor kamu: <b>${score}</b></div>
              <button class="btn btn-primary game-btn mt-2" id="qtAgain">🔁 Main Lagi</button>
            </div>
          `;
          tapRoot.querySelector("#qtAgain").onclick = () => start();
        }
      }, 1000);
    }

    tapRoot.innerHTML = `
      <div class="game-box">
        <div class="fw-bold">Quick Tap ⚡</div>
        <div class="text-muted">Kumpulkan skor sebanyak-banyaknya dalam 20 detik!</div>
        <button class="btn btn-primary game-btn mt-2" id="qtStart">▶️ Mulai</button>
      </div>
    `;
    tapRoot.querySelector("#qtStart").onclick = () => start();
  }

  // ===== Tebak Gambar into #game-pic =====
  const gpPanel = document.getElementById("game-pic");
  if (gpPanel && !gpPanel.dataset.ready) {
    gpPanel.dataset.ready = "1";
    const root = document.createElement("div");
    gpPanel.appendChild(root);

    const bank = [
      { pic: "🍎", ans: "Apel", opts: ["Apel", "Jeruk", "Pisang", "Anggur"] },
      { pic: "🐱", ans: "Kucing", opts: ["Kucing", "Anjing", "Ayam", "Ikan"] },
      { pic: "🌧️", ans: "Hujan", opts: ["Matahari", "Hujan", "Salju", "Angin"] },
      { pic: "🚲", ans: "Sepeda", opts: ["Motor", "Mobil", "Sepeda", "Kereta"] },
      { pic: "📚", ans: "Buku", opts: ["Pensil", "Buku", "Penghapus", "Rautan"] },
      { pic: "🏫", ans: "Sekolah", opts: ["Rumah", "Pasar", "Sekolah", "Kebun"] },
      { pic: "🌈", ans: "Pelangi", opts: ["Bulan", "Pelangi", "Bintang", "Awan"] },
      { pic: "🐟", ans: "Ikan", opts: ["Sapi", "Ikan", "Kuda", "Bebek"] },
      { pic: "🥭", ans: "Mangga", opts: ["Mangga", "Melon", "Semangka", "Pepaya"] },
      { pic: "🚌", ans: "Bus", opts: ["Bus", "Kapal", "Pesawat", "Sepeda"] },
    ];
    const shuf = (a) => a.slice().sort(() => Math.random() - 0.5);

    let i = 0,
      sc = 0,
      total = 10;

    function render() {
      const it = bank[i % bank.length];
      const opts = shuf(it.opts);

      root.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="text-muted">Soal ${i + 1}/${total}</div>
          <div class="fw-bold">Skor: ${sc}</div>
        </div>
        <div class="game-box">
          <div class="game-big" style="font-size:56px">${it.pic}</div>
          <div class="tap-target mt-3">
            ${opts.map((o) => `<button class="btn btn-outline-primary game-btn" data-o="${o}">${o}</button>`).join("")}
          </div>
        </div>
      `;

      root.querySelectorAll("[data-o]").forEach((b) => {
        b.onclick = () => {
          const pick = b.getAttribute("data-o");
          if (pick === it.ans) {
            sc++;
            award(1, "proud", "Benar!");
            window.SDAPP?.mascotSmartSay?.("game_correct");
          } else {
            miss("oops", `Jawaban benar: ${it.ans} 😄`);
            window.SDAPP?.mascotSmartSay?.("game_wrong");
          }

          i++;
          if (i >= total) {
            window.SDAPP?.mascotSmartSay?.("game_finish");
            root.innerHTML = `
              <div class="game-box">
                <div class="fw-bold">Selesai! 🎉</div>
                <div class="text-muted">Nilai: <b>${sc}/${total}</b></div>
                <button class="btn btn-primary game-btn mt-2" id="gpAgain">🔁 Main Lagi</button>
              </div>
            `;
            root.querySelector("#gpAgain").onclick = () => {
              i = 0;
              sc = 0;
              render();
            };
            return;
          }
          render();
        };
      });
    }

    render();
  }

  // ===== Puzzle Angka into #game-puzzle =====
  const npPanel = document.getElementById("game-puzzle");
  if (npPanel && !npPanel.dataset.ready) {
    npPanel.dataset.ready = "1";
    const root = document.createElement("div");
    npPanel.appendChild(root);

    const goal = [1, 2, 3, 4, 5, 6, 7, 8, 0];

    function solvable(arr) {
      const a = arr.filter((x) => x !== 0);
      let inv = 0;
      for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
      return inv % 2 === 0;
    }

    function shufflePuzzle() {
      let arr;
      do {
        arr = goal.slice().sort(() => Math.random() - 0.5);
      } while (!solvable(arr) || arr.join(",") === goal.join(","));
      return arr;
    }

    let board = shufflePuzzle(),
      moves = 0;

    function render() {
      root.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="text-muted">Susun angka 1–8</div>
          <div class="fw-bold">Langkah: ${moves}</div>
        </div>
        <div class="game-box">
          <div class="match-grid" id="npGrid" style="grid-template-columns:repeat(3,minmax(60px,1fr))">
            ${board
              .map(
                (v, idx) =>
                  `<div class="match-card ${v === 0 ? "open" : ""}" data-i="${idx}" style="${v === 0 ? "opacity:.35" : ""}">${v === 0 ? "" : v}</div>`
              )
              .join("")}
          </div>
          <div class="d-flex gap-2 mt-2">
            <button class="btn btn-outline-primary game-btn" id="npReset">🔀 Acak</button>
          </div>
        </div>
      `;

      const zi = board.indexOf(0),
        zr = Math.floor(zi / 3),
        zc = zi % 3;

      function can(idx) {
        const r = Math.floor(idx / 3),
          c = idx % 3;
        return Math.abs(r - zr) + Math.abs(c - zc) === 1;
      }

      root.querySelectorAll("[data-i]").forEach((el) => {
        el.onclick = () => {
          const idx = Number(el.getAttribute("data-i"));
          if (board[idx] === 0 || !can(idx)) return;

          board[zi] = board[idx];
          board[idx] = 0;
          moves++;

          if (board.join(",") === goal.join(",")) {
            award(3, "proud", "Puzzle selesai!");
            window.SDAPP?.mascotSmartSay?.("game_finish");
            root.innerHTML = `
              <div class="game-box">
                <div class="fw-bold">Menang! 🏆</div>
                <div class="text-muted">Langkah: <b>${moves}</b></div>
                <button class="btn btn-primary game-btn mt-2" id="npAgain">🔁 Main Lagi</button>
              </div>
            `;
            root.querySelector("#npAgain").onclick = () => {
              board = shufflePuzzle();
              moves = 0;
              render();
            };
            return;
          }

          render();
        };
      });

      root.querySelector("#npReset").onclick = () => {
        board = shufflePuzzle();
        moves = 0;
        render();
      };
    }

    render();
  }

  // ===== default show active =====
  const def = document.querySelector(".game-card.active")?.getAttribute("data-game") || "math";
  showGame(def);
})();
