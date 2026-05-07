const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "aset");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const skins = [
  {
    id: "default",
    bg: "#e7f5ff",
    c1: "#4dabf7",
    c2: "#1864ab",
    deco1: "✨",
    deco2: "🔵"
  },
  {
    id: "jungle",
    bg: "#ebfbee",
    c1: "#69db7c",
    c2: "#2b8a3e",
    deco1: "🌿",
    deco2: "🍃"
  },
  {
    id: "space",
    bg: "#f3f0ff",
    c1: "#9775fa",
    c2: "#5f3dc4",
    deco1: "🪐",
    deco2: "✨"
  },
  {
    id: "candy",
    bg: "#fff0f6",
    c1: "#faa2c1",
    c2: "#e64980",
    deco1: "🍭",
    deco2: "🍬"
  },
  {
    id: "lava",
    bg: "#fff5f5",
    c1: "#ff922b",
    c2: "#c92a2a",
    deco1: "🔥",
    deco2: "🌋"
  },
  {
    id: "ocean",
    bg: "#e3fafc",
    c1: "#74c0fc",
    c2: "#1864ab",
    deco1: "🐠",
    deco2: "🌊"
  },
  {
    id: "forest",
    bg: "#ebfbee",
    c1: "#51cf66",
    c2: "#2b8a3e",
    deco1: "🌳",
    deco2: "🍄"
  },
  {
    id: "ice",
    bg: "#f1f3f5",
    c1: "#a5d8ff",
    c2: "#4dabf7",
    deco1: "❄️",
    deco2: "🧊"
  },
  {
    id: "sunshine",
    bg: "#fff9db",
    c1: "#ffe066",
    c2: "#fab005",
    deco1: "🌞",
    deco2: "☀️"
  },
  {
    id: "galaxy",
    bg: "#f3f0ff",
    c1: "#845ef7",
    c2: "#5f3dc4",
    deco1: "🌌",
    deco2: "⭐"
  },
  {
    id: "rainbow",
    bg: "#ffffff",
    c1: "#ff6b6b",
    c2: "#845ef7",
    deco1: "🌈",
    deco2: "✨"
  },
  {
    id: "gold",
    bg: "#fff9db",
    c1: "#ffd43b",
    c2: "#f08c00",
    deco1: "👑",
    deco2: "⭐"
  }
];

function makeSvg(skin) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${skin.c1}"/>
      <stop offset="1" stop-color="${skin.c2}"/>
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect width="260" height="260" rx="42" fill="${skin.bg}"/>

  <circle cx="45" cy="55" r="18" fill="#ffffff" opacity="0.65"/>
  <circle cx="215" cy="62" r="12" fill="#ffffff" opacity="0.55"/>
  <circle cx="220" cy="210" r="24" fill="#ffffff" opacity="0.45"/>

  <text x="42" y="74" font-size="30">${skin.deco1}</text>
  <text x="200" y="214" font-size="30">${skin.deco2}</text>

  <g filter="url(#shadow)">
    <rect x="55" y="68" width="150" height="142" rx="36" fill="url(#body)"/>

    <rect x="72" y="86" width="116" height="78" rx="24" fill="#ffffff" opacity="0.96"/>
    <rect x="83" y="98" width="94" height="54" rx="18" fill="#ffffff"/>

    <text x="130" y="138" font-size="42" text-anchor="middle">😄</text>

    <circle cx="130" cy="54" r="13" fill="${skin.c1}"/>
    <rect x="124" y="32" width="12" height="28" rx="6" fill="${skin.c2}"/>

    <rect x="88" y="172" width="84" height="20" rx="10" fill="#ffffff" opacity="0.35"/>
    <text x="130" y="187" font-size="16" font-weight="900" text-anchor="middle" fill="#ffffff">IKY</text>
  </g>
</svg>`;
}

skins.forEach((skin) => {
  const file = path.join(outDir, `bimo-${skin.id}.svg`);
  fs.writeFileSync(file, makeSvg(skin), "utf8");
  console.log(`created: aset/bimo-${skin.id}.svg`);
});

console.log("Selesai membuat semua skin SVG.");