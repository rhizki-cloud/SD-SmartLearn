// js/games/game-shared.js
window.SDGAMES = window.SDGAMES || {};

(function () {
  "use strict";

  const GAME_POINT_PER_STAR = 150;

  function getRawPoints() {
    return Number(localStorage.getItem("sd_game_points") || "0");
  }

  function setRawPoints(points) {
    localStorage.setItem("sd_game_points", String(Math.max(0, Number(points) || 0)));
  }

  function getStreak() {
    return Number(localStorage.getItem("sd_game_streak") || "0");
  }

  function setStreak(streak) {
    localStorage.setItem("sd_game_streak", String(Math.max(0, Number(streak) || 0)));
  }

  function getGameStars() {
    return Math.floor(getRawPoints() / GAME_POINT_PER_STAR);
  }

  function getGamePointProgress() {
    return getRawPoints() % GAME_POINT_PER_STAR;
  }

  function syncTop() {
    const pointProgress = getGamePointProgress();
    const streak = getStreak();

    const elPts = document.getElementById("gPoints");
    const elStr = document.getElementById("gStreak");
    const elPtsMobile = document.getElementById("gPointsMobile");
    const elStrMobile = document.getElementById("gStreakMobile");

    if (elPts) elPts.textContent = String(pointProgress);
    if (elStr) elStr.textContent = String(streak);
    if (elPtsMobile) elPtsMobile.textContent = String(pointProgress);
    if (elStrMobile) elStrMobile.textContent = String(streak);
  }

  function notifyPointUpdate() {
    syncTop();
    window.dispatchEvent(new Event("pointsUpdated"));
    window.SDGAMES?.refreshGameTopUI?.();
  }

  function award(points, msg = "Yeay!", mood = "proud") {
    const add = Number(points || 0);
    const oldPoints = getRawPoints();
    const newPoints = oldPoints + add;

    setRawPoints(newPoints);
    setStreak(getStreak() + 1);

    window.SDAPP?.fx?.yay?.();
    window.SDAPP?.level?.addXP?.(add * 20, "Games");
    window.SDAPP?.mascot?.say?.(`${msg} +${add} poin`, mood);

    notifyPointUpdate();
  }

  function miss(msg = "Coba lagi ya 😄", mood = "oops") {
    setStreak(0);

    window.SDAPP?.fx?.wrong?.();
    window.SDAPP?.mascot?.say?.(msg, mood);

    notifyPointUpdate();
  }

  function resetGameScore() {
    setRawPoints(0);
    setStreak(0);
    notifyPointUpdate();
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(arr) {
    const a = (arr || []).slice();

    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  function safeText(s) {
    return String(s ?? "").trim();
  }

  function getGrade() {
    const g = Number(localStorage.getItem("sd_grade") || "1");
    return clamp(g, 1, 6);
  }

  function stopTimer(timerRef) {
    if (timerRef && timerRef.id) {
      clearInterval(timerRef.id);
      timerRef.id = null;
    }
  }

  window.SDGAMES.shared = {
    GAME_POINT_PER_STAR,

    getGamePoints: getRawPoints,
    setGamePoints: setRawPoints,
    getGameStars,
    getGamePointProgress,

    award,
    miss,
    resetGameScore,

    clamp,
    randInt,
    shuffle,
    safeText,
    getGrade,
    stopTimer,
    syncTop
  };

  // Compatibility untuk kode lama
  window.award = award;
  window.miss = miss;

  syncTop();
})();