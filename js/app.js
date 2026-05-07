/* =========================================================
   SD SmartLearn — app.js (FINAL, rapi & stabil)
   - Login / guard halaman
   - Progress helper
   - FX (tap/correct/wrong + confetti + yay sound)
   - Level (Lv 1–10, XP)
   - Bimo mascot (muncul di semua halaman, clickable)
   - Music procedural (1 tombol saja: NAVBAR "Musik")
   ========================================================= */

   (function () {
    "use strict";
  
    // ---------- Keys (KONSISTEN) ----------
    const KEY_USER = "sd_name";
    const KEY_GRADE = "sd_grade";
    const KEY_ACTIVE_USER = "sd_user_active"; // id user aktif (berdasarkan nama)
  
    // ---------- Multi-user (1 device) ----------
    function userIdFromName(name) {
      return (name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "") || "guest";
    }
  
    function setActiveUserIdFromName(name) {
      const id = userIdFromName(name);
      localStorage.setItem(KEY_ACTIVE_USER, id);
      return id;
    }
  
    function getActiveUserId() {
      const stored = (localStorage.getItem(KEY_ACTIVE_USER) || "").trim();
      if (stored) return stored;
  
      const name = (localStorage.getItem(KEY_USER) || "").trim();
      const id = userIdFromName(name);
      localStorage.setItem(KEY_ACTIVE_USER, id);
      return id;
    }
  
    function userKey(baseKey) {
      const uid = getActiveUserId();
      return `sd_user_${uid}_${baseKey}`;
    }
  
    // ---------- Helpers ----------
    function safeJSONParse(s, fallback) {
      try { return JSON.parse(s ?? ""); } catch { return fallback; }
    }
  
    function getProgress() {
      return safeJSONParse(localStorage.getItem(userKey("progress")), {}) || {};
    }
    function setProgress(p) {
      localStorage.setItem(userKey("progress"), JSON.stringify(p || {}));
    }
  
    // expose base early
    window.SDAPP = window.SDAPP || {};
    window.SDAPP.KEY_USER = KEY_USER;
    window.SDAPP.KEY_GRADE = KEY_GRADE;
    window.SDAPP.getProgress = getProgress;
    window.SDAPP.setProgress = setProgress;
    window.SDAPP.userKey = userKey;
    window.SDAPP.setActiveUserIdFromName = setActiveUserIdFromName;
    window.SDAPP.getActiveUserId = getActiveUserId;
    // ---------- Global progress summary ----------
window.SDAPP.progressSummary = {
  get() {
    const prog = window.SDAPP?.getProgress?.() || {};
    const subjectsByGrade = window.SD_CONTENT?.subjectsByGrade || {};

    let total = 0;
    let done = 0;

    Object.keys(subjectsByGrade).forEach((grade) => {
      (subjectsByGrade[grade] || []).forEach((subject) => {
        total++;

        if (prog[`${grade}_${subject}`]) {
          done++;
        }
      });
    });

    const pct = total ? Math.round((done / total) * 100) : 0;

    return {
      total,
      done,
      pct
    };
  }
};
    window.SDAPP.stars = {
      get() {
        return Number(localStorage.getItem(userKey("stars")) || "0");
      },
    
      set(v) {
        localStorage.setItem(userKey("stars"), String(Math.max(0, Number(v) || 0)));
      },
    
      add(v = 1) {
        this.set(this.get() + Number(v || 0));
      },
    
      spend(v = 0) {
        const price = Number(v || 0);
        const now = this.get();
    
        if (now < price) return false;
    
        this.set(now - price);
        return true;
      }
    };

    
  
    // ---------- Require login on non-index pages ----------
    function onIndexPage() {
      const p = (location.pathname.split("/").pop() || "").toLowerCase();
      return p === "" || p === "index.html";
    }
  
    function requireLogin() {
      const user = localStorage.getItem(KEY_USER);
      if (!user && !onIndexPage()) location.href = "index.html";
      return user || "";
    }
  
    // ---------- INDEX login ----------
    const form = document.getElementById("name-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("userName");
        const name = (input?.value || "").trim();
  
        if (!name) {
          window.Swal?.fire?.({ icon: "error", title: "Oops", text: "Nama tidak boleh kosong!" });
          return;
        }
  
        // set nama + set akun aktif
        localStorage.setItem(KEY_USER, name);
        setActiveUserIdFromName(name);
  
        // grade boleh global (device) atau per-user (kalau mau, bilang ya)
        if (!localStorage.getItem(KEY_GRADE)) localStorage.setItem(KEY_GRADE, "1");
  
        // init data PER USER (kalau belum ada)
        if (!localStorage.getItem(userKey("progress"))) localStorage.setItem(userKey("progress"), "{}");
        if (!localStorage.getItem(userKey("level"))) localStorage.setItem(userKey("level"), "1");
        if (!localStorage.getItem(userKey("xp"))) localStorage.setItem(userKey("xp"), "0");
        if (!localStorage.getItem(userKey("avatar"))) localStorage.setItem(userKey("avatar"), "😀");
        if (!localStorage.getItem(userKey("unlocked_skins"))) localStorage.setItem(userKey("unlocked_skins"), "[]");
        if (!localStorage.getItem(userKey("skin"))) localStorage.setItem(userKey("skin"), "default");
  
        location.href = "home.html";
      });
  
      // auto redirect if already logged in
      if (localStorage.getItem(KEY_USER)) location.href = "home.html";
      return;
    }

  // ---------- Other pages ----------
  const user = requireLogin();
// pastikan akun aktif sinkron dengan nama (untuk multi-user)
  if (user) window.SDAPP?.setActiveUserIdFromName?.(user);

  // Hello labels (optional)
  const helloUser = document.getElementById("helloUser");
  if (helloUser) helloUser.textContent = user ? `Halo, ${user}` : "Halo!";

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem(KEY_USER);
      location.href = "index.html";
    });
  }

  // Grade select (optional)
  const gradeSelect = document.getElementById("gradeSelect");
  if (gradeSelect) {
    gradeSelect.value = localStorage.getItem(KEY_GRADE) || "1";
    gradeSelect.addEventListener("change", () => localStorage.setItem(KEY_GRADE, gradeSelect.value));
  }

  // Open subjects button (optional)
  const openSubjectsBtn = document.getElementById("openSubjectsBtn");
  if (openSubjectsBtn) {
    openSubjectsBtn.addEventListener("click", () => {
      const g = localStorage.getItem(KEY_GRADE) || "1";
      location.href = `subject.html?grade=${encodeURIComponent(g)}`;
    });
  }

  // ---------- Level system ----------
  const levelAPI = {
    xpPerLevel: 1000, // lebih realistis (lebih lama naik)
    maxLevel: 100,

    getProgress() {
      const level = Number(localStorage.getItem(userKey("level")) || "1");
      const xp = Number(localStorage.getItem(userKey("xp")) || "0");
      const totalXP = Number(localStorage.getItem(userKey("total_xp")) || "0");
    
      const needXP = level >= this.maxLevel ? 0 : this.xpPerLevel;
      const inLevelXP = level >= this.maxLevel ? 0 : xp;
      const pct = level >= this.maxLevel
        ? 100
        : Math.round((inLevelXP / Math.max(1, needXP)) * 100);
    
      return {
        level,
        xp,
        totalXP,
        inLevelXP,
        needXP,
        pct
      };
    },

    addXP(n = 1, reason = "") {
      n = Number(n) || 0;
      if (n <= 0) return false;
      const totalKey = userKey("total_xp");
const oldTotal = Number(localStorage.getItem(totalKey) || "0");
localStorage.setItem(totalKey, String(oldTotal + n));

      let level = Number(localStorage.getItem(userKey("level")) || "1");
      let xp = Number(localStorage.getItem(userKey("xp")) || "0");
      let leveled = false;

      while (n > 0 && level < this.maxLevel) {
        const need = this.xpPerLevel;
        const space = need - xp;
        const take = Math.min(space, n);
        xp += take;
        n -= take;

        if (xp >= need) {
          level += 1;
          xp = 0;
          leveled = true;
        }
      }

      localStorage.setItem(userKey("level"), String(level));
      localStorage.setItem(userKey("xp"), String(xp));

      if (leveled) window.SDAPP?.ui?.showLevelUp?.(level);
      return leveled;
    },

    getAvatar() {
      // avatar anak sederhana (emoji), bisa nanti diganti pilihan user
      const a = localStorage.getItem(userKey("avatar")) || "😀";
      return a;
    }
  };
  window.SDAPP.level = levelAPI;

  // ---------- Badge system global ----------
// ---------- Badge system global per kelas aktif ----------
window.SDAPP.badges = {
  getActiveGrade() {
    const gradeKey = window.SDAPP?.userKey?.("grade") || "sd_grade";
    return localStorage.getItem(gradeKey) || localStorage.getItem("sd_grade") || "1";
  },

  isDone(subjectName, grade = this.getActiveGrade()) {
    const prog = window.SDAPP?.getProgress?.() || {};
    return prog[`${grade}_${subjectName}`] === true;
  },

  getDoneCount(grade = this.getActiveGrade()) {
    const prog = window.SDAPP?.getProgress?.() || {};
    const subjects = window.SD_CONTENT?.subjectsByGrade?.[grade] || [];

    return subjects.filter((subject) => prog[`${grade}_${subject}`] === true).length;
  },

  getAll(grade = this.getActiveGrade()) {
    const subjects = window.SD_CONTENT?.subjectsByGrade?.[grade] || [];
    const doneCount = this.getDoneCount(grade);

    const list = [
      {
        id: "math_master",
        icon: "🧮",
        title: "Jago Matematika",
        desc: `Selesaikan Matematika di Kelas ${grade}`,
        need: 1,
        val: this.isDone("Matematika", grade) ? 1 : 0
      },
      {
        id: "indo_reader",
        icon: "📘",
        title: "Pembaca Hebat",
        desc: `Selesaikan Bahasa Indonesia di Kelas ${grade}`,
        need: 1,
        val: this.isDone("Bahasa Indonesia", grade) ? 1 : 0
      },
      {
        id: "pancasila_good",
        icon: "🇮🇩",
        title: "Anak Pancasila",
        desc: `Selesaikan Pendidikan Pancasila di Kelas ${grade}`,
        need: 1,
        val: this.isDone("Pendidikan Pancasila", grade) ? 1 : 0
      },
      {
        id: "sporty",
        icon: "🏃",
        title: "Anak Sehat",
        desc: `Selesaikan PJOK di Kelas ${grade}`,
        need: 1,
        val: this.isDone("PJOK", grade) ? 1 : 0
      },
      {
        id: "artist",
        icon: "🎨",
        title: "Seniman Cilik",
        desc: `Selesaikan Seni dan Budaya di Kelas ${grade}`,
        need: 1,
        val:
          this.isDone("Seni dan Budaya", grade) ||
          this.isDone("Seni Budaya", grade)
            ? 1
            : 0
      },
      {
        id: "super_student",
        icon: "🏆",
        title: "Pelajar Rajin",
        desc: `Selesaikan minimal 2 mapel di Kelas ${grade}`,
        need: Math.min(2, subjects.length || 2),
        val: doneCount
      }
    ];

    return list.map((b) => ({
      ...b,
      unlocked: b.val >= b.need,
      percent: Math.min(100, Math.round((b.val / Math.max(1, b.need)) * 100))
    }));
  },

  count(grade = this.getActiveGrade()) {
    return this.getAll(grade).filter((b) => b.unlocked).length;
  }
};
  // ---------- UI helpers (Level Up animation) ----------
  window.SDAPP.ui = window.SDAPP.ui || {};
  window.SDAPP.ui.showLevelUp = function (newLevel) {
    // overlay kecil lucu
    const old = document.getElementById("lvUpOverlay");
    if (old) old.remove();

    const div = document.createElement("div");
    div.id = "lvUpOverlay";
    div.style.position = "fixed";
    div.style.inset = "0";
    div.style.display = "grid";
    div.style.placeItems = "center";
    div.style.background = "rgba(0,0,0,.25)";
    div.style.zIndex = "9999";

    div.innerHTML = `
      <div style="
        background:#fff;
        border-radius:24px;
        padding:18px 18px;
        width:min(360px,92vw);
        box-shadow:0 18px 60px rgba(0,0,0,.25);
        text-align:center;
        border:3px solid rgba(59,130,246,.35);
        font-family: Poppins, system-ui, -apple-system, sans-serif;
      ">
        <div style="font-size:44px; line-height:1">🎉</div>
        <div style="font-weight:900; font-size:22px; margin-top:6px;">Naik Level!</div>
        <div style="margin-top:4px; font-weight:800;">Sekarang Lv ${newLevel} 🏆</div>
        <div style="margin-top:10px; font-size:13px; opacity:.75;">Terus main & belajar ya 😄</div>
        <button id="lvUpOk" style="
          margin-top:12px;
          border:0;
          border-radius:999px;
          padding:10px 16px;
          font-weight:900;
          background: #3b82f6;
          color:#fff;
          cursor:pointer;
          width:100%;
        ">OK ✨</button>
      </div>
    `;
    document.body.appendChild(div);
    window.SDAPP?.fx?.yay?.();
    document.getElementById("lvUpOk")?.addEventListener("click", () => div.remove());
    setTimeout(() => div.remove(), 2600);
  };

  // ---------- Confetti ----------
  window.SDAPP.confetti = function (count = 70) {
    const colors = ["#4dabf7", "#51cf66", "#ffd43b", "#ff6b6b", "#845ef7", "#f783ac"];
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.position = "fixed";
      c.style.top = "-20px";
      c.style.left = (Math.random() * 100) + "vw";
      c.style.width = (6 + Math.random() * 10) + "px";
      c.style.height = (8 + Math.random() * 14) + "px";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.borderRadius = (2 + Math.random() * 6) + "px";
      c.style.opacity = String(0.75 + Math.random() * 0.25);
      c.style.transform = `translateX(${(-20 + Math.random() * 40).toFixed(0)}px) rotate(${Math.floor(Math.random() * 360)}deg)`;
      c.style.zIndex = "9999";
      c.style.pointerEvents = "none";

      const dur = 1100 + Math.random() * 1100;
      c.animate(
        [
          { transform: `translateY(-20px) translateX(0px) rotate(0deg)`, opacity: 1 },
          { transform: `translateY(${innerHeight + 40}px) translateX(${(-80 + Math.random() * 160).toFixed(0)}px) rotate(${(720 + Math.random() * 720).toFixed(0)}deg)`, opacity: 0.9 }
        ],
        { duration: dur, easing: "cubic-bezier(.2,.7,.2,1)" }
      );

      document.body.appendChild(c);
      setTimeout(() => c.remove(), dur + 100);
    }
  };

  // ---------- WebAudio small "yay" ----------
  function playYay() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = window.__sd_audioctx || (window.__sd_audioctx = new AudioCtx());
      const now = ctx.currentTime;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
      master.connect(ctx.destination);

      const chirp = (t0, f0, f1, dur) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(f0, t0);
        o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.9, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g); g.connect(master);
        o.start(t0); o.stop(t0 + dur + 0.02);
      };

      chirp(now + 0.00, 520, 900, 0.18);
      chirp(now + 0.20, 620, 1200, 0.25);
    } catch { /* ignore */ }
  }

  // ---------- SFX ----------
  (function initFX() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let ctx = null, master = null, sfxGain = null;

    function ensure() {
      if (!AudioCtx) return false;
      if (!ctx) {
        ctx = window.__sd_audioctx || (window.__sd_audioctx = new AudioCtx());
        master = ctx.createGain();
        sfxGain = ctx.createGain();
        master.gain.value = 0.9;
        sfxGain.gain.value = 0.9;
        sfxGain.connect(master);
        master.connect(ctx.destination);
      }
      return true;
    }

    function beep(freq = 600, dur = 0.08, type = "triangle", gain = 0.12) {
      if (!ensure()) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(sfxGain);
      o.start(t); o.stop(t + dur + 0.02);
    }

    function noisePop(dur = 0.09, gain = 0.08) {
      if (!ensure()) return;
      const t = ctx.currentTime;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(g); g.connect(sfxGain);
      src.start(t); src.stop(t + dur + 0.01);
    }

    window.SDAPP.fx = window.SDAPP.fx || {};
    window.SDAPP.fx.tap = () => { beep(520, 0.05, "triangle", 0.07); };
    window.SDAPP.fx.correct = () => { beep(660, 0.06, "triangle", 0.10); beep(880, 0.08, "sine", 0.09); };
    window.SDAPP.fx.wrong = () => { beep(220, 0.10, "square", 0.08); noisePop(0.10, 0.06); };

    window.SDAPP.fx.yay = () => {
      playYay();
      window.SDAPP.confetti?.(90);
    };
  })();

  // ---------- Mascot (Bimo) ----------
  function moodEmoji(m) {
    if (m === "proud") return "😎";
    if (m === "thinking") return "🤔";
    if (m === "oops") return "😅";
    if (m === "wow") return "😮";
    return "😄";
  }

  window.SDAPP.mascot = window.SDAPP.mascot || {
    say(msg, mood = "happy") {
      const t = document.getElementById("bimoTxt");
      const moodEl = document.getElementById("bimoMood");
      if (t) t.textContent = String(msg || "");
      if (moodEl) moodEl.textContent = moodEmoji(mood);

      const m = document.getElementById("bimoMascot");
      if (m) {
        m.classList.remove("bounce");
        void m.offsetWidth;
        m.classList.add("bounce");
        setTimeout(() => m.classList.remove("bounce"), 900);
      }
    },
    tip() {
      const tips = [
        "Baca materi pelan-pelan dulu ya 📘",
        "Kalau salah, jangan sedih. Coba ulangi lagi 🔁",
        "Baca soal sampai selesai sebelum menjawab 👀",
        "Pilih mapel yang kamu suka dulu supaya semangat ⭐",
        "Kalau capek, istirahat sebentar lalu lanjut lagi 😄",
        "Catat hal penting supaya mudah diingat ✍️",
        "Kerjakan kuis dengan tenang, jangan terburu-buru 🧠",
        "Belajar sedikit setiap hari itu hebat banget 🌱",
        "Cari kata kunci penting di soal ya 🔎",
        "Ulangi materi yang sulit sampai kamu merasa paham 💪"
      ];
    
      this.say(tips[Math.floor(Math.random() * tips.length)], "thinking");
    },
    
    cheer() {
      const cheers = [
        "Kamu hebat banget! Terus lanjutkan ya ⭐",
        "Semangat! Satu langkah lagi menuju juara 🏆",
        "Aku percaya kamu pasti bisa 😄",
        "Pelan-pelan tidak apa-apa, yang penting mencoba 💪",
        "Wah, kamu makin pintar hari ini 🎉",
        "Jangan menyerah ya, Iky dukung kamu 🤖✨",
        "Setiap usaha kamu itu berharga 🌟",
        "Ayo lanjut! Bintang baru sedang menunggu ⭐",
        "Belajar hari ini bikin kamu lebih keren 😎",
        "Kamu sudah melakukan yang terbaik. Lanjut lagi yuk 🚀"
      ];
    
      this.say(cheers[Math.floor(Math.random() * cheers.length)], "proud");
      window.SDAPP.fx?.correct?.();
    },
    
    joke() {
      const jokes = [
        "Kenapa buku matematika sedih? Karena punya banyak masalah 😆",
        "Pensil bilang: aku runcing karena rajin belajar ✏️",
        "Aku robot, tapi aku juga suka baca buku 🤖📖",
        "Belajar dulu, ngemil kemudian 🍪",
        "Kalau salah jawab, jangan panik. Iky juga pernah salah klik 😅",
        "Otak sedang loading... tapi tetap semangat 🔄",
        "Kenapa penghapus baik hati? Karena suka memaafkan kesalahan 😄",
        "Buku bilang: bukalah aku, nanti kamu tambah pintar 📘",
        "Kalau angka 6 takut sama angka 7, mungkin karena 7 8 9 😂",
        "Hari ini kita belajar, bukan tidur di atas buku ya 😴"
      ];
    
      this.say(jokes[Math.floor(Math.random() * jokes.length)], "happy");
    },
    
    mission() {
      const missions = [
        "Misi hari ini: selesaikan minimal 1 mapel 🎯",
        "Misi hari ini: kumpulkan bintang baru ⭐",
        "Misi hari ini: jawab kuis dengan tenang 🧠",
        "Misi hari ini: baca satu materi sampai selesai 📘",
        "Misi hari ini: coba mapel yang belum kamu pilih 🚀",
        "Misi hari ini: ulangi satu materi yang menurutmu sulit 🔁",
        "Misi hari ini: dapatkan nilai lebih baik dari sebelumnya 🏆",
        "Misi hari ini: belajar fokus selama 10 menit ⏰",
        "Misi hari ini: jangan takut salah, yang penting mencoba 💪",
        "Misi hari ini: ajarkan kembali satu hal yang kamu pelajari 🗣️"
      ];
    
      this.say(missions[Math.floor(Math.random() * missions.length)], "wow");
    }
  };

    function getBimoSkinSrc() {
      const skinKey = window.SDAPP?.userKey?.("skin") || "sd_skin";
      const skin = localStorage.getItem(skinKey) || "default";
    
      return `aset/bimo-${skin}.svg`;
    }
    
  function initBimo() {
    if (document.getElementById("bimoWrap")) return;

    const page = ((location.pathname.split("/").pop() || "index.html") + "").toLowerCase();
    const name = localStorage.getItem(KEY_USER) || "";
    const grade = localStorage.getItem(KEY_GRADE) || "1";

    const wrap = document.createElement("div");
    wrap.id = "bimoWrap";
    wrap.style.position = "fixed";
    wrap.style.right = "18px";
    wrap.style.bottom = "16px";
    wrap.style.zIndex = "9998";

    wrap.innerHTML = `
    <div id="bimoBubble" class="bimo-bubble">
      <div class="bimo-head">
        <div>
          <div class="bimo-title">
            Iky 🤖✨ <span id="bimoMood">😄</span>
          </div>
          <div class="bimo-sub" id="bimoMiniStat">Lv 1 • 0/20 XP</div>
        </div>
  
        <button id="bimoClose" type="button" class="bimo-close">×</button>
      </div>
  
      <div class="bimo-message">
        <div class="bimo-avatar-mini">
          <img id="bimoBubbleImg" src="${getBimoSkinSrc()}" alt="Iky">
        </div>
  
        <div id="bimoTxt" class="bimo-text">
          Halo! Aku Iky 😄
        </div>
      </div>
  
      <div class="bimo-progress">
        <div class="bimo-progress-top">
          <span>Progress Level</span>
          <span id="bimoXpText">0%</span>
        </div>
        <div class="bimo-xpbar">
          <div id="bimoXpBar"></div>
        </div>
      </div>
  
      <div class="bimo-daily">
        <div class="bimo-daily-title">🎯 Misi Cepat</div>
        <div class="bimo-daily-text" id="bimoDailyMission">
          Selesaikan 1 mapel hari ini
        </div>
      </div>
  
      <div class="bimo-actions">
        <button type="button" id="bimoTip" class="bimoBtn">💡 Tips</button>
        <button type="button" id="bimoCheer" class="bimoBtn">🎉 Semangat</button>
        <button type="button" id="bimoJoke" class="bimoBtn">😆 Lucu</button>
        <button type="button" id="bimoQuest" class="bimoBtn">🎯 Misi</button>
        <button type="button" id="bimoGo" class="bimoBtn">📚 Ke Mapel</button>
        <button type="button" id="bimoProfile" class="bimoBtn">👤 Profil</button>
        <button type="button" id="bimoGift" class="bimoBtn bimoGiftFull">🎁 Hadiah</button>
      </div>
    </div>
  
    <button id="bimoMascot" type="button" title="Klik Iky" class="bimo-float">
      <img id="bimoImg" src="${getBimoSkinSrc()}" alt="Iky" onerror="this.src='aset/bimo-default.svg'">
    </button>
  `;

    // add minimal styles for bimo buttons + animation
    const styleId = "bimoInlineStyle";
    if (!document.getElementById(styleId)) {
      const st = document.createElement("style");
      st.id = styleId;
      st.textContent = `
        .bimoBtn{
          border:2px solid rgba(59,130,246,.25);
          background:#fff;
          border-radius:999px;
          padding:8px 12px;
          font-weight:900;
          cursor:pointer;
        }
        #bimoMascot.bounce{ animation:bimoBounce .8s ease; }
        @keyframes bimoBounce{ 0%{transform:translateY(0)} 30%{transform:translateY(-10px)} 60%{transform:translateY(0)} 100%{transform:translateY(0)} }
      `;
      document.head.appendChild(st);
    }

    document.body.appendChild(wrap);
    const lvInfo = window.SDAPP?.level?.getProgress?.() || {
      level: 1,
      pct: 0,
      inLevelXP: 0,
      needXP: 20
    };
    
    const miniStat = document.getElementById("bimoMiniStat");
    const xpText = document.getElementById("bimoXpText");
    const xpBar = document.getElementById("bimoXpBar");
    
    if (miniStat) {
      miniStat.textContent =
        lvInfo.level >= 10
          ? `Lv ${lvInfo.level} • MAX`
          : `Lv ${lvInfo.level} • ${lvInfo.inLevelXP}/${lvInfo.needXP} XP`;
    }
    
    if (xpText) xpText.textContent = `${lvInfo.pct || 0}%`;
    if (xpBar) xpBar.style.width = `${lvInfo.pct || 0}%`;
    const bubble = document.getElementById("bimoBubble");
    const mascotBtn = document.getElementById("bimoMascot");
    const closeBtn = document.getElementById("bimoClose");

    function openBubble() {
      if (!bubble) return;
      bubble.style.display = "block";
      window.SDAPP.fx?.tap?.();
    }
    function closeBubble() {
      if (!bubble) return;
      bubble.style.display = "none";
      window.SDAPP.fx?.tap?.();
    }
    // default closed
    if (bubble) bubble.style.display = "none";

    mascotBtn?.addEventListener("click", () => {
      if (!bubble) return;
    
      const isHidden =
        bubble.style.display === "none" ||
        getComputedStyle(bubble).display === "none";
    
      bubble.style.display = isHidden ? "block" : "none";
    
      window.SDAPP.fx?.tap?.();
    });
    closeBtn?.addEventListener("click", closeBubble);

    // buttons
    document.getElementById("bimoTip")?.addEventListener("click", () => window.SDAPP.mascot.tip());

    document.getElementById("bimoCheer")?.addEventListener("click", () => window.SDAPP.mascot.cheer());
    
    document.getElementById("bimoJoke")?.addEventListener("click", () => window.SDAPP.mascot.joke());
    
    document.getElementById("bimoQuest")?.addEventListener("click", () => window.SDAPP.mascot.mission());
    
    document.getElementById("bimoGo")?.addEventListener("click", () => {
      const g = localStorage.getItem(KEY_GRADE) || "1";
      location.href = `subject.html?grade=${encodeURIComponent(g)}`;
    });
    
    document.getElementById("bimoProfile")?.addEventListener("click", () => {
      location.href = "profile.html";
    });
    
    document.getElementById("bimoGift")?.addEventListener("click", () => {
      location.href = "hadiah.html";
    });
    // initial dialog by page
    if (page.includes("home")) {
      window.SDAPP.mascot.say(name ? `Halo ${name}! Pilih kelas dulu ya 🎒` : "Isi nama dulu ya ✏️", "happy");
    } else if (page.includes("subject")) {
      window.SDAPP.mascot.say(`Kelas ${grade} siap! Pilih mapel favoritmu 📚`, "thinking");
    } else if (page.includes("games")) {
      window.SDAPP.mascot.say("Main games sambil belajar yuk! 🎮✨", "happy");
    } else {
      window.SDAPP.mascot.say("Halo! Aku Iky 😄", "happy");
    }

    // keep content clear from mascot
    document.body.style.paddingBottom = "120px";
  }

  // init bimo on all pages except index (but can also on index if you want; keep off)
  if (!onIndexPage()) initBimo();

  // ---------- Music (procedural) — 1 tombol di NAVBAR ----------
  (function initMusic() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const KEY_ON = "sd_music_on";
    const KEY_VOL = "sd_music_vol";
    const KEY_MODE = "sd_music_mode";

    let on = (localStorage.getItem(KEY_ON) ?? "on") !== "off";
    let vol = Number(localStorage.getItem(KEY_VOL) ?? "0.35");
    let mode = localStorage.getItem(KEY_MODE) || "learn";

    let ctx = null, master = null, musicGain = null;
    let timer = null, step = 0;
    let unlocked = false;

    function ensure() {
      if (!AudioCtx) return false;
      if (!ctx) {
        ctx = window.__sd_audioctx || (window.__sd_audioctx = new AudioCtx());
        master = ctx.createGain();
        musicGain = ctx.createGain();
        master.gain.value = 0.9;
        musicGain.gain.value = on ? vol : 0.0001;
        musicGain.connect(master);
        master.connect(ctx.destination);
      }
      return true;
    }

    function unlock() {
      if (unlocked) return;
      if (!ensure()) return;
      ctx.resume?.();
      unlocked = true;
      if (on) start();
    }

    const scaleLearn = [261.63, 293.66, 329.63, 392.0, 440.0]; // C D E G A
    const scaleGame = [293.66, 329.63, 392.0, 440.0, 523.25]; // D E G A C

    function play(freq, dur = 0.22, type = "sine") {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.10, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(musicGain);
      o.start(t); o.stop(t + dur + 0.02);
    }

    function tick() {
      if (!ensure()) return;
      if (!on) { stop(); return; }
      const s = (mode === "game") ? scaleGame : scaleLearn;

      const bass = s[(step % 2 === 0) ? 0 : 2] / 2;
      play(bass, 0.18, "triangle");

      if (mode === "game") {
        const mel = s[(step * 2 + (step % 3)) % s.length];
        play(mel, 0.16, "square");
        if (step % 4 === 0) play(s[(step / 4) % s.length | 0] * 2, 0.10, "sine");
      } else {
        const mel = s[(step + 2) % s.length];
        play(mel, 0.20, "sine");
        if (step % 6 === 0) play(s[3] * 2, 0.12, "triangle");
      }
      step++;
    }

    function start() {
      if (!ensure()) return;
      if (timer) return;
      musicGain.gain.value = on ? vol : 0.0001;
      timer = setInterval(tick, mode === "game" ? 260 : 340);
      tick();
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      if (musicGain) musicGain.gain.value = 0.0001;
    }

    function setOn(v) {
      on = !!v;
      localStorage.setItem(KEY_ON, on ? "on" : "off");
      if (!ensure()) return;
      if (on) {
        musicGain.gain.value = vol;
        if (unlocked) start();
      } else {
        stop();
      }
      updateNavbarBtn();
    }

    function toggle() { setOn(!on); }

    function setMode(v) {
      mode = (v === "game") ? "game" : "learn";
      localStorage.setItem(KEY_MODE, mode);
      if (timer) { clearInterval(timer); timer = null; }
      step = 0;
      if (on && unlocked) start();
      updateNavbarBtn();
    }

    function updateNavbarBtn() {
      const nb = document.getElementById("navMusicBtn");
      if (!nb) return;
      const icon = on ? "🔊" : "🔇";
      const label = (mode === "game") ? "Game 🎮" : "Belajar 📘";
      nb.innerHTML = `${icon} Musik`;
      nb.setAttribute("data-mode", label);
    }

    // auto mode by page
    (function autoMode() {
      const p = (location.pathname || "").toLowerCase();
      setMode(p.includes("games") ? "game" : "learn");
    })();

    // inject button in navbar (ONLY ONE)
    function injectNavbarButton() {
      const nav = document.querySelector(".navbar .container, .navbar .container-fluid");
      if (!nav) return;
      if (document.getElementById("navMusicBtn")) { updateNavbarBtn(); return; }

      const nb = document.createElement("button");
      nb.id = "navMusicBtn";
      nb.type = "button";
      nb.className = "btn btn-outline-primary";
      nb.style.borderRadius = "999px";
      nb.style.fontWeight = "900";
      nb.style.display = "inline-flex";
      nb.style.alignItems = "center";
      nb.style.gap = "8px";
      nb.innerHTML = "🎵 Musik";

      nb.addEventListener("click", () => {
        unlock();
        window.SDAPP.fx?.tap?.();
        toggle();
      });

      // place before logout if exists
      const logout = document.getElementById("logoutBtn");
      if (logout && logout.parentElement) logout.parentElement.insertBefore(nb, logout);
      else nav.appendChild(nb);

      // unlock audio on first user gesture anywhere
      window.addEventListener("pointerdown", unlock, { once: true, passive: true });

      updateNavbarBtn();
    }

    // expose api
    window.SDAPP.music = {
      on: () => on,
      toggle,
      setOn,
      setMode,
      unlock,
      start,
      stop
    };

    // init
    injectNavbarButton();
    if (on) start(); // will actually produce sound after unlock, but safe to keep
  })();

})();

window.SDAPP = window.SDAPP || {};
window.SDAPP.ui = window.SDAPP.ui || {};

window.SDAPP.ui.renderProfileButton = function () {
  const key = window.SDAPP.userKey ? window.SDAPP.userKey("avatar") : "sd_avatar";
  const av = (localStorage.getItem(key) || "👧").trim();
  const name = (localStorage.getItem("sd_name") || "").trim();

  document.querySelectorAll("[data-profile-btn]").forEach((el) => {
    el.textContent = name ? `${av} ${name}` : `${av} Profil`;
  });
};

document.addEventListener("DOMContentLoaded", () => {
  window.SDAPP.ui.renderProfileButton();
});

window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navbar-custom");
  if (!nav) return;

  nav.classList.toggle("scrolled", window.scrollY > 20);
});


