// profile.js (REVISI FULL: multi-user + avatar unlock + progress gamification)
(function () {
  "use strict";

  function getTotalStars() {
    if (window.SDAPP?.stars?.get) {
      return window.SDAPP.stars.get();
    }
  
    return Number(localStorage.getItem("sd_stars") || "0");
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function getName() {
    return (localStorage.getItem("sd_name" ) || "").trim();
  }

  function ensureActiveUser() {
    const n = getName();
    if (n) window.SDAPP?.setActiveUserIdFromName?.(n);
  }

  function getAvatarKey() {
    return window.SDAPP?.userKey?.("avatar") || "sd_avatar";
  }

  function getAvatar() {
    return (localStorage.getItem(getAvatarKey()) || "😀").trim();
  }

  function getGradeKey() {
    return window.SDAPP?.userKey?.("grade") || "sd_grade";
  }

  function getSavedGrade() {
    return (localStorage.getItem(getGradeKey()) || "1").trim();
  }

  function renderProfileButtons() {
    const name = getName();
    const av = getAvatar();

    const btn = document.getElementById("btnProfile");
    if (btn) btn.textContent = name ? `${av} ${name}` : `${av} Profil`;

    document.querySelectorAll("[data-profile-btn]").forEach((el) => {
      el.textContent = name ? `${av} ${name}` : `${av} Profil`;
    });
  }

  window.SDAPP = window.SDAPP || {};
  window.SDAPP.ui = window.SDAPP.ui || {};
  window.SDAPP.ui.renderProfileButtons = renderProfileButtons;

  ensureActiveUser();

  const subjectsByGrade = window.SD_CONTENT?.subjectsByGrade || {};
  const meta = window.SD_CONTENT?.subjectsMeta || {};
  const prog = window.SDAPP?.getProgress?.() || {};

  const profileNameChip = document.getElementById("profileName");
  const profileNameTop = document.getElementById("profileNameTop");

  function renderProfileHeader(av) {
    const n = getName();
    if (profileNameChip) profileNameChip.textContent = n ? `${av} ${n}` : `${av} Profil`;
    if (profileNameTop) profileNameTop.textContent = n || "";
  }

  const savedAvatar = getAvatar();
  renderProfileHeader(savedAvatar);
  renderProfileButtons();

  // ===== Avatar Picker + Unlock System =====
  const avatarPick = document.getElementById("avatarPick");
  const avatarTitle = document.getElementById("currentAvatarTitle");

  if (avatarPick) {
    const avatarItems = avatarPick.querySelectorAll(".avatar");
    const levelInfo = window.SDAPP?.level?.getProgress?.() || { level: 1 };
    const currentLevel = Number(levelInfo.level || 1);

    function applyAvatar(chosen, silent = false) {
      chosen = (chosen || "😀").trim();
      localStorage.setItem(getAvatarKey(), chosen);

      avatarItems.forEach((x) => {
        const isActive = x.textContent.trim() === chosen;
        x.classList.toggle("active", isActive);
        x.setAttribute("role", "button");
        x.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      if (avatarTitle) avatarTitle.textContent = chosen;

      renderProfileHeader(chosen);
      renderProfileButtons();
      window.SDAPP?.ui?.renderProfileButton?.();

      if (!silent) {
        window.SDAPP?.fx?.correct?.();
        window.SDAPP?.mascot?.say?.("Avatar kamu berhasil diganti! 😄🎨", "happy");
      }
    }

    avatarItems.forEach((item) => {
      const needLevel = Number(item.dataset.unlock || "1");
    
      function refreshLock() {
        const locked = currentLevel < needLevel;
    
        item.classList.toggle("locked", locked);
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", locked ? "-1" : "0");
        item.setAttribute(
          "title",
          locked ? `Terbuka di Lv ${needLevel}` : "Pilih avatar"
        );
    
        item.dataset.locked = locked ? "true" : "false";
      }
    
      refreshLock();
    
      item.addEventListener("click", () => {
        const locked = item.dataset.locked === "true";
    
        if (locked) {
          window.SDAPP?.fx?.wrong?.();
          window.SDAPP?.mascot?.say?.(
            `Avatar ini terbuka di Lv ${needLevel} 🔒`,
            "oops"
          );
          return;
        }
    
        applyAvatar(item.textContent);
      });
    });
    
    applyAvatar(savedAvatar, true);
  }

  // ===== Hitung progress total =====
  const GLOBAL_MAX_XP = 25000;
  const lvInfo = window.SDAPP?.level?.getProgress?.() || {
    totalXP: 0
  };
  
  const totalXP = Number(lvInfo.totalXP || 0);
  const pct = Math.min(100, Math.round((totalXP / GLOBAL_MAX_XP) * 100));

  setText("pStars", `⭐ ${getTotalStars()}`);
  setText("pPct", `${pct}%`);

  const pBar = document.getElementById("pBar");
  if (pBar) pBar.style.width = `${pct}%`;

  // ===== Badges GLOBAL =====
// ===== Badges GLOBAL PER KELAS =====
function renderBadgesByGrade(grade = getSavedGrade()) {
  const badges = window.SDAPP?.badges?.getAll?.(grade) || [];
  const got = badges.filter((b) => b.unlocked).length;

  setText("pBadges", `🏅 ${got}`);

  const badgeGrid = document.getElementById("badgeGrid");
  if (!badgeGrid) return;

  badgeGrid.innerHTML = "";

  badges.forEach((b) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6";

    col.innerHTML = `
      <div class="badge-card ${b.unlocked ? "done" : "locked"}">
        <div class="badge-ico">${b.icon}</div>

        <div class="flex-grow-1">
          <div class="t">${b.title} ${b.unlocked ? "✅" : "⏳"}</div>
          <div class="d">${b.desc}</div>

          <div class="kid-bar mt-2">
            <div style="width:${b.percent}%"></div>
          </div>

          <div class="small text-muted mt-1">${b.val}/${b.need}</div>
        </div>
      </div>
    `;

    badgeGrid.appendChild(col);
  });
}

renderBadgesByGrade(getSavedGrade());

  // ===== Progress per Kelas =====
  const gradeSelect = document.getElementById("gradeSelect");
  const progressList = document.getElementById("progressList");

  function renderGrade(g) {
    if (!progressList) return;

    const list = subjectsByGrade[g] || [];

    if (!list.length) {
      progressList.innerHTML = `<div class="text-muted">Belum ada mapel di kelas ${g}.</div>`;
      return;
    }

    progressList.className = "progress-grid";

    progressList.innerHTML = list.map((s) => {
      const ok = !!prog[`${g}_${s}`];
      const icon = meta[s]?.icon || "📘";
      const percent = ok ? 100 : 20;

      return `
        <div class="progress-card ${ok ? "done" : "pending"}">
          <div class="progress-icon">${icon}</div>

          <div class="progress-content">
            <div class="progress-title">${s}</div>
            <div class="progress-status">
              ${ok ? "Sudah selesai! Hebat 🎉" : "Belum selesai, ayo lanjut 😄"}
            </div>

            <div class="progress-mini">
              <div style="width:${percent}%"></div>
            </div>

            <div class="progress-xp">
              ${ok ? "+250 XP didapat" : "Selesaikan untuk +250 XP"}
            </div>
          </div>

          <div class="progress-badge">
            ${ok ? "✅" : "⏳"}
          </div>
        </div>
      `;
    }).join("");

    window.SDAPP?.mascot?.say?.(`Ini progress Kelas ${g} ya 📊✨`, "thinking");
  }

  if (gradeSelect) {
    const gradeKey = getGradeKey();
    const savedGrade = getSavedGrade();

    gradeSelect.value = savedGrade;
    renderGrade(savedGrade);

    gradeSelect.addEventListener("change", () => {
      const g = (gradeSelect.value || "1").trim();
      localStorage.setItem(gradeKey, g);
    
      renderGrade(g);
      renderBadgesByGrade(g);
    });
  }
})();

