// hadiah.js — REVISI FULL: skin lebih banyak + unlock + per-user storage
(function () {
  "use strict";

  function getMapelStars() {
    const prog = window.SDAPP?.getProgress?.() || {};
    return Object.values(prog).filter(Boolean).length;
  }
  
  function getGamePoints() {
    return Number(localStorage.getItem("sd_game_points") || "0");
  }
  
  function getGameStars() {
    return Math.floor(getGamePoints() / 150);
  }
  
  function getTotalRedeemStars() {
    return getMapelStars() + getGameStars();
  }
  
  function getPointProgress() {
    return getGamePoints() % 150;
  }

  const name = (localStorage.getItem("sd_name") || "").trim();

  if (name) {
    window.SDAPP?.setActiveUserIdFromName?.(name);
  }

  const prog = window.SDAPP?.getProgress?.() || {};
  const subjectsByGrade = window.SD_CONTENT?.subjectsByGrade || {};

  let total = 0;
  let done = 0;

  Object.keys(subjectsByGrade).forEach((g) => {
    (subjectsByGrade[g] || []).forEach((s) => {
      total++;
      if (prog[`${g}_${s}`]) done++;
    });
  });

let stars = window.SDAPP?.stars?.get?.() || 0;
const mapelStars = getMapelStars();
const gamePoints = getGamePoints();
const gameStars = getGameStars();
const pointProgress = getPointProgress();

const activeGrade = window.SDAPP?.badges?.getActiveGrade?.() || "1";
const badges = window.SDAPP?.badges?.count?.() || 0;

  const giftName = document.getElementById("giftName");
  const gStars = document.getElementById("gStars");
  const gBadges = document.getElementById("gBadges");
  const gSkins = document.getElementById("gSkins");
  const gSkinBar = document.getElementById("gSkinBar");
  const grid = document.getElementById("skinGrid");

  if (giftName) {
    giftName.textContent = name ? `🎁 Hadiah ${name}` : "🎁 Hadiah Kamu";
  }

  if (gStars) gStars.textContent = `⭐ ${stars}`;
  if (gBadges) gBadges.textContent = `🏅 ${badges}`;
  
  const hPoints = document.getElementById("hPoints");
  const hPointBar = document.getElementById("hPointBar");
  const hGameStars = document.getElementById("hGameStars");
  const hMapelStars = document.getElementById("hMapelStars");
  
  if (hPoints) hPoints.textContent = `${pointProgress}/150`;
  if (hPointBar) hPointBar.style.width = `${(pointProgress / 150) * 100}%`;
  if (hGameStars) hGameStars.textContent = `⭐ ${gameStars}`;
  if (hMapelStars) hMapelStars.textContent = `⭐ ${mapelStars}`;

  const skins = [
    {
      id: "default",
      title: "Default Biru",
      icon: "🔵",
      req: "Gratis",
      can: () => true,
      theme: "#4dabf7"
    },
    {
      id: "jungle",
      title: "Jungle Hijau",
      icon: "🌿",
      price:4,
      req: "Butuh 4 🏅",
      can: () => badges >= 4,
      theme: "#51cf66"
    },
    {
      id: "sunshine",
      title: "Sunshine",
      icon: "🌞",
      price: 4,
      req: "Harga 4 ⭐",
      can: () => stars >= 4,
      theme: "#ffd43b"
    },
    {
      id: "space",
      title: "Space Ungu",
      icon: "🪐",
      price:7,
      req: "Butuh 7 ⭐",
      can: () => stars >= 7,
      theme: "#845ef7"
    },
    {
      id: "ocean",
      title: "Ocean Biru",
      icon: "🌊",
      price:10,
      req: "Butuh 10 ⭐",
      can: () => stars >= 10,
      theme: "#4dabf7"
    },
    {
      id: "forest",
      title: "Forest",
      icon: "🌳",
      price:20,
      req: "Butuh 20 ⭐",
      can: () => stars >= 20,
      theme: "#2f9e44"
    },
    {
      id: "lava",
      title: "Lava Merah",
      icon: "🔥",
      price:25,
      req: "Butuh 25 ⭐",
      can: () => stars >= 25,
      theme: "#ff6b6b"
    },
    {
      id: "ice",
      title: "Ice World",
      icon: "❄️",
      price:25,
      req: "Butuh 25 ⭐",
      can: () => stars >= 25,
      theme: "#74c0fc"
    },
    {
      id: "candy",
      title: "Candy Pink",
      icon: "🍭",
      price:30,
      req: "Butuh 30 ⭐",
      can: () => stars >= 30,
      theme: "#f783ac"
    },
    {
      id: "galaxy",
      title: "Galaxy",
      icon: "🌌",
      price:30,
      req: "Butuh 30 ⭐",
      can: () => stars >= 30,
      theme: "#5f3dc4"
    },
    {
      id: "rainbow",
      title: "Rainbow",
      icon: "🌈",
      price:35,
      req: "Butuh 35 ⭐",
      can: () => stars >= 35,
      theme: "#ff922b"
    },
    {
      id: "gold",
      title: "Golden",
      icon: "👑",
      price:50,
      req: "Butuh 50 ⭐",
      can: () => stars >= 50,
      theme: "#fab005"
    }
  ];

  const unlockedKey =
    window.SDAPP?.userKey?.("unlocked_skins") || "sd_unlocked_skins";

  const skinKey =
    window.SDAPP?.userKey?.("skin") || "sd_skin";

  function safeJSONParse(value, fallback) {
    try {
      return JSON.parse(value || "");
    } catch {
      return fallback;
    }
  }

  let unlocked = safeJSONParse(localStorage.getItem(unlockedKey), []);

  if (!Array.isArray(unlocked)) {
    unlocked = [];
  }

  if (!unlocked.includes("default")) {
    unlocked.push("default");
  }

  localStorage.setItem(unlockedKey, JSON.stringify(unlocked));

  if (!localStorage.getItem(skinKey)) {
    localStorage.setItem(skinKey, "default");
  }

  function saveUnlocked() {
    localStorage.setItem(unlockedKey, JSON.stringify(unlocked));
  }

  function isUnlocked(id) {
    return unlocked.includes(id);
  }

  function getSelectedSkin() {
    return localStorage.getItem(skinKey) || "default";
  }

  function applySkinTheme(id) {
    const skin = skins.find((s) => s.id === id);
    if (!skin) return;

    document.documentElement.style.setProperty("--brand", skin.theme);
  }

  function getPreviewSrc(id) {
    return `aset/bimo-${id}.svg`;
  }

  function updateHeaderProgress() {
    const opened = new Set(unlocked).size;
    const totalSkins = skins.length;
    const pct = totalSkins ? Math.round((opened / totalSkins) * 100) : 0;

    if (gSkins) gSkins.textContent = `${opened}/${totalSkins}`;
    if (gSkinBar) gSkinBar.style.width = `${pct}%`;
  }

  function renderSkins() {
    if (!grid) return;

    const selected = getSelectedSkin();

    updateHeaderProgress();

    grid.innerHTML = "";

    skins.forEach((skin) => {
      const ok = isUnlocked(skin.id);
      const canUnlock = skin.can();
      const active = selected === skin.id;

      const col = document.createElement("div");
      col.className = "col-12 col-md-6";

      col.innerHTML = `
<div
  class="badge-card skin-card ${ok ? "skin-opened" : "skin-locked"} ${active ? "skin-active" : ""}"
  data-skin-card="${skin.id}"
>
          <div class="badge-ico skin-icon">${skin.icon}</div>

          <div class="flex-grow-1">
            <div class="t">
              ${skin.title}
              ${active ? "✅" : ok ? "🔓" : "🔒"}
            </div>

            <div class="d">${skin.req}</div>

            <div class="d mt-1">
              Preview:
              <img
                src="${getPreviewSrc(skin.id)}"
                alt="${skin.title}"
                style="height:48px"
                onerror="this.style.display='none'"
              />
            </div>
          </div>

          <div class="d-flex flex-column gap-2">
            ${
              active
                ? `
                  <button class="btn btn-primary btn-sm" disabled>
                    Dipakai ✅
                  </button>
                `
                : ok
                  ? `
                    <button
                      class="btn btn-success btn-sm"
                      data-act="use"
                      data-id="${skin.id}"
                    >
                      Pakai 🎨
                    </button>
                  `
                  : `
                    <button
                      class="btn btn-outline-primary btn-sm"
                      data-act="unlock"
                      data-id="${skin.id}"
                      ${canUnlock ? "" : "disabled"}
                    >
                      ${canUnlock ? "Buka 🔓" : "Terkunci 🔒"}
                    </button>
                  `
            }
          </div>
        </div>
      `;

      grid.appendChild(col);
    });

    bindSkinButtons();
  }

  function bindSkinButtons() {
    if (!grid) return;

    grid.querySelectorAll("button[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.getAttribute("data-act");
        const id = btn.getAttribute("data-id");
        const skin = skins.find((s) => s.id === id);

        if (!skin) return;

        if (act === "unlock") {
          if (!skin.can()) {
            window.SDAPP?.fx?.wrong?.();
            window.SDAPP?.mascot?.say?.(
              "Syaratnya belum cukup untuk membuka skin ini 🔒",
              "oops"
            );
            return;
          }

          const price = Number(skin.price || 0);

          if (price > 0) {
            const paid = window.SDAPP?.stars?.spend?.(price);
          
            if (!paid) {
              window.SDAPP?.fx?.wrong?.();
              window.SDAPP?.mascot?.say?.("Bintang kamu belum cukup untuk membeli skin ini ⭐", "oops");
              return;
            }
          
            stars = window.SDAPP?.stars?.get?.() || 0;
          }
          
          if (!unlocked.includes(id)) {
            unlocked.push(id);
            saveUnlocked();
          }
          
          if (gStars) gStars.textContent = `⭐ ${stars}`;

          window.SDAPP?.fx?.yay?.();
          window.SDAPP?.mascot?.say?.(
            `Yeay! Skin ${skin.title} berhasil dibuka 🎁✨`,
            "proud"
          );

          renderSkins();

setTimeout(() => {
  const card = document.querySelector(`[data-skin-card="${id}"]`);
  if (card) card.classList.add("skin-unlock-pop");
}, 30);
        }

        if (act === "use") {
          if (!isUnlocked(id)) {
            window.SDAPP?.fx?.wrong?.();
            window.SDAPP?.mascot?.say?.(
              "Skin ini belum terbuka ya 🔒",
              "oops"
            );
            return;
          }

          localStorage.setItem(skinKey, id);
          applySkinTheme(id);
const bimoImg = document.getElementById("bimoImg");
if (bimoImg) {
  bimoImg.src = `aset/bimo-${id}.svg`;
}
          
          window.SDAPP?.fx?.correct?.();
          window.SDAPP?.mascot?.say?.(
            `Iky sekarang pakai skin ${skin.title}! 😄🎨`,
            "happy"
          );

          renderSkins();
        }
      });
    });
  }

  applySkinTheme(getSelectedSkin());
  renderSkins();

  window.SDAPP?.ui?.renderProfileButton?.();
  window.SDAPP?.ui?.renderProfileButtons?.();
})();