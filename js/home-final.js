(function () {
  "use strict";

  const name = (localStorage.getItem("sd_name") || "").trim();
  const hello = document.getElementById("helloChip");
  const logoutBtn = document.getElementById("logoutBtn");
  const kelasGrid = document.getElementById("kelasGrid");

  if (name) window.SDAPP?.setActiveUserIdFromName?.(name);

  const gradeKey = window.SDAPP?.userKey?.("grade") || "sd_grade";

  function getActiveGrade() {
    return localStorage.getItem(gradeKey) || localStorage.getItem("sd_grade") || "1";
  }

  function saveActiveGrade(grade) {
    localStorage.setItem(gradeKey, grade);
    localStorage.setItem("sd_grade", grade);
  }

  function getStars() {
    if (window.SDAPP?.stars?.get) {
      return window.SDAPP.stars.get();
    }

    const prog = window.SDAPP?.getProgress?.() || {};
    return Object.values(prog).filter(Boolean).length;
  }

  function getSummary() {
    if (window.SDAPP?.progressSummary?.get) {
      return window.SDAPP.progressSummary.get();
    }

    const prog = window.SDAPP?.getProgress?.() || {};
    const subjectsByGrade = window.SD_CONTENT?.subjectsByGrade || {};

    let total = 0;
    let done = 0;

    Object.keys(subjectsByGrade).forEach((grade) => {
      (subjectsByGrade[grade] || []).forEach((subject) => {
        total++;
        if (prog[`${grade}_${subject}`] === true) done++;
      });
    });

    return {
      total,
      done,
      pct: total ? Math.round((done / total) * 100) : 0
    };
  }

  const av = window.SDAPP?.level?.getAvatar?.() || "😀";
  const lvInfo = window.SDAPP?.level?.getProgress?.() || {
    level: 1,
    pct: 0,
    inLevelXP: 0,
    needXP: 20
  };

  if (hello) {
    hello.textContent = name
      ? `${av} Halo ${name}! (Lv ${lvInfo.level})`
      : `${av} Halo! (Lv ${lvInfo.level})`;
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("sd_name");
      location.href = "index.html";
    };
  }

  const summary = getSummary();

  const homeStars = document.getElementById("homeStars");
  const homeDone = document.getElementById("homeDone");
  const homePct = document.getElementById("homePct");
  const homeXp = document.getElementById("homeXp");
  const homeProgressBar = document.getElementById("homeProgressBar");
  const lvHome = document.getElementById("lvHome");

  if (homeStars) homeStars.textContent = getStars();
  if (homeDone) homeDone.textContent = summary.done;

  if (lvHome) {
    lvHome.textContent = `🏆 Lv ${lvInfo.level}`;
  }

  const GLOBAL_MAX_XP = 25000;
  const totalXP = Number(lvInfo.totalXP || 0);
  const xpPct = Math.min(100, Math.round((totalXP / GLOBAL_MAX_XP) * 100));
  
  if (homePct) homePct.textContent = `${xpPct}%`;
  if (homeXp) homeXp.textContent = `${totalXP}/${GLOBAL_MAX_XP} XP`;
  if (homeProgressBar) homeProgressBar.style.width = `${xpPct}%`;

  const navKelasBtn = document.getElementById("navKelasBtn");

  if (navKelasBtn) {
    const activeGrade = getActiveGrade();

    navKelasBtn.textContent = `📚 Kelas ${activeGrade}`;
    navKelasBtn.href = `subject.html?grade=${activeGrade}`;

    navKelasBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const grade = getActiveGrade();

      saveActiveGrade(grade);

      window.SDAPP?.fx?.tap?.();

      location.href = `subject.html?grade=${grade}`;
    });
  }

  if (kelasGrid) {
    kelasGrid.querySelectorAll("[data-grade]").forEach((card) => {
      card.addEventListener("click", () => {
        const grade = card.getAttribute("data-grade") || "1";

        saveActiveGrade(grade);

        card.classList.add("zooming");

        window.SDAPP?.fx?.yay?.();

        setTimeout(() => {
          location.href = `subject.html?grade=${grade}`;
        }, 120);
      });
    });
  }

  window.SDAPP?.ui?.renderProfileButton?.();
})();