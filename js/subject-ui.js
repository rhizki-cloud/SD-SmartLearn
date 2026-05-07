// js/subject-ui.js
(function () {
  "use strict";

  const qs = (s, p = document) => p.querySelector(s);
  const qsa = (s, p = document) => Array.from(p.querySelectorAll(s));

  const modeButtons = qsa(".mode-btn");
  const stopAudioBtn = qs("#stopAudioBtn");

  stopAudioBtn?.addEventListener("click", () => {
    window.SD_AUDIO?.stop?.();
  });

  if (!modeButtons.length) return;

  const panels = {
    materi: qs("#panelMateri"),
    kuis: qs("#panelKuis")
  };

  let currentMode = "materi";

  function safeSay(text, mood = "happy") {
    try {
      window.SDAPP?.mascot?.say?.(text, mood);
    } catch (e) {}
  }

  function showPanels(mode) {
    Object.keys(panels).forEach((k) => {
      if (!panels[k]) return;
      panels[k].style.display = k === mode ? "" : "none";
    });
  }

  function setActiveButton(mode) {
    modeButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
      btn.setAttribute("aria-pressed", btn.dataset.mode === mode ? "true" : "false");
    });
  }

  function setMode(mode, opts = {}) {
    if (!panels[mode]) mode = "materi";

    window.SD_AUDIO?.stop?.();

    currentMode = mode;

    showPanels(mode);
    setActiveButton(mode);

    if (!opts.silent) {
      safeSay(
        mode === "materi"
          ? "Baca materinya dulu ya 📘🙂"
          : "Siap kuis! 🎯 Jawab pelan-pelan ya 😄",
        mode === "kuis" ? "wow" : "happy"
      );
    }
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
  });

  window.SD_SUBJECT_UI = window.SD_SUBJECT_UI || {};
  window.SD_SUBJECT_UI.setMode = setMode;
  window.SD_SUBJECT_UI.getMode = () => currentMode;

  setMode("materi", { silent: true });
})();