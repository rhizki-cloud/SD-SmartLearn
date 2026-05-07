// js/content-quiz-builder.js
(function () {
    const C = window.SD_CONTENT;
    if (!C) return;
  
    const mk = (q, a, correct) => ({ q, a, correct });
    const ensure10 = (arr) =>
      arr.length >= 10
        ? arr.slice(0, 10)
        : arr.concat(Array(10 - arr.length).fill(mk("Soal cadangan", ["A", "B", "C", "D"], 0))).slice(0, 10);
  
    // expose helper (dipakai file kelas)
    window.SD_QUIZ = { mk, ensure10 };
  
    // ===== leveling helper (dipakai file kelas) =====
    const norm = (s) => String(s || "").toLowerCase();
  
    function baseLevelFromQuestion(q) {
      const t = norm(q);
      const hardKeys = [
        "mengapa","alasan","dampak","akibat","cara menyikapi","simpulan","kesimpulan",
        "strategi","menyederhanakan","rentang","median","modus","rata-rata",
        "volume","luas permukaan","skala","perbandingan","struktur","bagian pembuka","penutup"
      ];
      if (hardKeys.some(k => t.includes(k))) return "sulit";
  
      const midKeys = ["contoh","yang benar","digunakan untuk","berfungsi untuk","tujuan","bagian penting","kalimat yang","yang termasuk","menjaga","mencegah"];
      if (midKeys.some(k => t.includes(k))) return "sedang";
  
      return "mudah";
    }
  
    function adjustBySubjectAndGrade(level, subject, grade, q) {
      const g = Number(grade);
      const t = norm(q);
  
      if (g <= 2 && level === "sedang" && t.includes("contoh")) level = "mudah";
  
      if (subject === "Matematika") {
        if (t.match(/\d+\s*\+\s*\d+/) || t.match(/\d+\s*-\s*\d+/)) level = g <= 2 ? "mudah" : "sedang";
        if (t.includes("volume") || t.includes("luas permukaan") || t.includes("rata-rata") || t.includes("median") || t.includes("modus") || t.includes("skala") || t.includes("perbandingan") || t.includes("diagram")) {
          level = g <= 4 ? "sedang" : "sulit";
        }
      }
  
      if (subject === "Bahasa Indonesia") {
        if (t.includes("ide pokok") || t.includes("gagasan utama")) level = "sedang";
        if (t.includes("simpulan") || t.includes("struktur") || t.includes("pidato") || t.includes("argumentasi")) level = g <= 4 ? "sedang" : "sulit";
      }
  
      if (subject === "Pendidikan Pancasila") {
        if (t.includes("sila") && g <= 3) level = "mudah";
        if (t.includes("norma") || t.includes("hukum") || t.includes("demokrasi")) level = g <= 4 ? "sedang" : "sulit";
      }
  
      if (subject === "Ilmu Pengetahuan Alam dan Sosial (IPAS)") {
        if (t.includes("globalisasi") || t.includes("dampak") || t.includes("rotasi") || t.includes("revolusi") || t.includes("gerhana")) level = "sulit";
        else level = "sedang";
      }
  
      if (subject === "Bahasa Jawa") {
        if (t.includes("aksara") || t.includes("pidato") || t.includes("paribasan") || t.includes("bebasan")) level = g <= 4 ? "sedang" : "sulit";
      }
  
      return level;
    }
  
    function rebalanceLevels(arr) {
      const target = { mudah: 4, sedang: 4, sulit: 2 };
  
      const recount = () => {
        const c = { mudah:0, sedang:0, sulit:0 };
        arr.forEach(x => c[x.level]++);
        return c;
      };
  
      let c = recount();
  
      if (c.sulit === 0) {
        const idxs = arr
          .map((x,i)=>({i, len:(x.q||"").length}))
          .sort((a,b)=>b.len-a.len)
          .slice(0,2)
          .map(o=>o.i);
        idxs.forEach(i => arr[i].level = "sulit");
        c = recount();
      }
  
      while (c.mudah < target.mudah) {
        const idx = arr
          .map((x,i)=>({i, len:(x.q||"").length, lv:x.level}))
          .filter(o=>o.lv==="sedang")
          .sort((a,b)=>a.len-b.len)[0]?.i;
        if (idx == null) break;
        arr[idx].level = "mudah";
        c = recount();
      }
  
      while (c.sulit > target.sulit) {
        const idx = arr
          .map((x,i)=>({i, len:(x.q||"").length, lv:x.level}))
          .filter(o=>o.lv==="sulit")
          .sort((a,b)=>a.len-b.len)[0]?.i;
        if (idx == null) break;
        arr[idx].level = "sedang";
        c = recount();
      }
    }
  
    window.SD_QUIZ.leveling = function applyLeveling(grade, subject, arr) {
      arr.forEach(it => {
        const base = baseLevelFromQuestion(it.q);
        it.level = adjustBySubjectAndGrade(base, subject, grade, it.q);
      });
      rebalanceLevels(arr);
      return arr;
    };
    
    window.SD_Q = mk;
  })();
  