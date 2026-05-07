window.SDGAMES = window.SDGAMES || {};

(function () {
  "use strict";

  function shuffle(arr) {
    return arr.slice().sort(() => Math.random() - 0.5);
  }

  function numberOptions(correct) {
    const set = new Set([String(correct)]);
    let guard = 0;

    while (set.size < 4 && guard < 100) {
      guard++;
      const delta = Math.floor(Math.random() * 19) - 9;
      const value = correct + delta;
      if (value >= 0 && value !== correct) set.add(String(value));
    }

    return shuffle([...set]);
  }

  function choice(id, q, a, opts, hint = "", explain = "", extra = {}) {
    return {
      id,
      q,
      a: String(a),
      opts: opts.map(String),
      hint,
      explain,
      ...extra
    };
  }

  function makeMathBank() {
    const bank = [];
    let id = 1;

    for (let a = 1; a <= 30 && bank.length < 100; a++) {
      for (let b = 1; b <= 12 && bank.length < 100; b++) {
        bank.push(choice(`math-${id++}`, `${a} + ${b} = ?`, a + b, numberOptions(a + b), `Jumlahkan ${a} dan ${b}.`, `${a} + ${b} = ${a + b}.`));

        if (a >= b && bank.length < 100) {
          bank.push(choice(`math-${id++}`, `${a} - ${b} = ?`, a - b, numberOptions(a - b), `Kurangi ${a} dengan ${b}.`, `${a} - ${b} = ${a - b}.`));
        }

        if (bank.length < 100) {
          bank.push(choice(`math-${id++}`, `${a} × ${b} = ?`, a * b, numberOptions(a * b), "Perkalian adalah penjumlahan berulang.", `${a} × ${b} = ${a * b}.`));
        }

        if (bank.length < 100) {
          bank.push(choice(`math-${id++}`, `${a * b} ÷ ${b} = ?`, a, numberOptions(a), `Cari angka yang jika dikali ${b} hasilnya ${a * b}.`, `${a * b} ÷ ${b} = ${a}.`));
        }
      }
    }

    return bank.slice(0, 100);
  }

  function makeScrambleBank() {
    const words = [
      "SEKOLAH","BELAJAR","MEMBACA","MENULIS","BERHITUNG","PENGGARIS","PENGHAPUS","PERPUSTAKAAN","LAPANGAN","PANCASILA",
      "INDONESIA","MATEMATIKA","OLAHRAGA","KESEHATAN","TUMBUHAN","LINGKUNGAN","MATAHARI","PELANGI","KELUARGA","BERSIH",
      "DISIPLIN","JUJUR","SANTUN","GOTONGROYONG","MUSYAWARAH","KREATIF","GAMBAR","WARNA","KUCING","KELINCI",
      "GAJAH","BURUNG","IKAN","KUPUKUPU","RUMAH","TAMAN","PASAR","KANTIN","KELAS","GURU",
      "MURID","BUKU","PENSIL","TAS","SEPATU","SERAGAM","BENDERA","UPACARA","TEMAN","SAHABAT",
      "MAKANAN","MINUMAN","SARAPAN","SAYURAN","BUAHBUAHAN","APEL","PISANG","MANGGA","JERUK","SEMANGKA",
      "HUJAN","ANGIN","AWAN","BULAN","BINTANG","LAUT","SUNGAI","GUNUNG","SAWAH","HUTAN",
      "MERAH","KUNING","HIJAU","BIRU","UNGU","ORANYE","COKELAT","HITAM","PUTIH","ABUABU",
      "LARI","LOMPAT","JALAN","RENANG","SEPAKBOLA","BASKET","MENARI","MENYANYI","MELUKIS","MEWARNAI",
      "TOLONG","MAAF","TERIMA","KASIH","SEMANGAT","BERANI","PINTAR","HEBAT","RAJIN","CERDAS"
    ];

    return words.map((word, i) => ({
      id: `scramble-${i + 1}`,
      word,
      hint: `Kata ini memiliki ${word.length} huruf.`,
      explain: `Jawaban yang benar adalah ${word}.`
    }));
  }

  function makeTrueFalseBank() {
    const bank = [];
    let id = 1;

    for (let a = 1; a <= 50 && bank.length < 100; a++) {
      const b = (a % 12) + 1;
      const correctSum = a + b;
      const wrongSum = correctSum + ((a % 2) + 1);

      bank.push({
        id: `tf-${id++}`,
        q: `${a} + ${b} = ${correctSum}.`,
        a: true,
        hint: `Hitung ${a} + ${b}.`,
        explain: `${a} + ${b} memang ${correctSum}.`
      });

      if (bank.length >= 100) break;

      bank.push({
        id: `tf-${id++}`,
        q: `${a} + ${b} = ${wrongSum}.`,
        a: false,
        hint: `Hitung ${a} + ${b}.`,
        explain: `${a} + ${b} adalah ${correctSum}, bukan ${wrongSum}.`
      });
    }

    return bank.slice(0, 100);
  }

  function makeMapelBank() {
    const bank = [];
    let id = 1;

    for (let grade = 1; grade <= 6; grade++) {
      for (let n = 1; n <= 20 && bank.length < 100; n++) {
        const a = grade + n;
        const b = (n % 5) + grade;

        const subjectSet = [
          choice(`mapel-${id++}`, `Kelas ${grade}: ${a} + ${b} = ?`, a + b, numberOptions(a + b), "Jumlahkan kedua angka.", `${a} + ${b} = ${a + b}.`, { grade }),
          choice(`mapel-${id++}`, `Kelas ${grade}: Antonim dari tinggi adalah...`, "Rendah", ["Rendah", "Besar", "Cepat", "Panjang"], "Antonim berarti lawan kata.", "Lawan kata tinggi adalah rendah.", { grade }),
          choice(`mapel-${id++}`, `Kelas ${grade}: Hewan yang hidup di air adalah...`, "Ikan", ["Ikan", "Ayam", "Kucing", "Sapi"], "Hewan ini berenang.", "Ikan hidup di air.", { grade }),
          choice(`mapel-${id++}`, `Kelas ${grade}: Sila pertama Pancasila berkaitan dengan...`, "Tuhan", ["Tuhan", "Olahraga", "Warna", "Angka"], "Sila pertama adalah Ketuhanan Yang Maha Esa.", "Sila pertama berkaitan dengan Tuhan.", { grade }),
          choice(`mapel-${id++}`, `Kelas ${grade}: Warna daun biasanya...`, "Hijau", ["Hijau", "Merah", "Hitam", "Ungu"], "Lihat warna daun sehat.", "Daun biasanya berwarna hijau.", { grade })
        ];

        for (const q of subjectSet) {
          if (bank.length < 100) bank.push(q);
        }
      }
    }

    return bank.slice(0, 100);
  }

  function makeCeritaBank() {
    const names = ["Budi", "Siti", "Ayu", "Raka", "Dina", "Tono", "Lani", "Edo", "Mira", "Joko"];
    const items = ["apel", "pensil", "buku", "kelereng", "permen", "jeruk", "stiker", "bola", "roti", "kartu"];
    const bank = [];
    let id = 1;

    for (let i = 0; bank.length < 100; i++) {
      const name = names[i % names.length];
      const item = items[i % items.length];
      const a = (i % 15) + 2;
      const b = (i % 9) + 1;

      if (i % 3 === 0) {
        bank.push(choice(`cerita-${id++}`, `${name} punya ${a} ${item}. Ia mendapat ${b} ${item} lagi. Berapa ${item} ${name} sekarang?`, a + b, numberOptions(a + b), `Tambahkan ${a} dan ${b}.`, `${a} + ${b} = ${a + b}.`));
      } else if (i % 3 === 1) {
        bank.push(choice(`cerita-${id++}`, `${name} punya ${a + b} ${item}. Ia memberikan ${b} ${item} kepada teman. Sisa berapa ${item}?`, a, numberOptions(a), `Kurangi ${a + b} dengan ${b}.`, `${a + b} - ${b} = ${a}.`));
      } else {
        bank.push(choice(`cerita-${id++}`, `Ada ${a} kotak. Tiap kotak berisi ${b} ${item}. Total ada berapa ${item}?`, a * b, numberOptions(a * b), `Kalikan ${a} dengan ${b}.`, `${a} × ${b} = ${a * b}.`));
      }
    }

    return bank.slice(0, 100);
  }

  function makeCepatBank() {
    const bank = [];
    let id = 1;

    for (let a = 1; a <= 60 && bank.length < 100; a++) {
      const b = (a % 10) + 1;

      bank.push(choice(`cepat-${id++}`, `${a} + ${b} = ?`, a + b, numberOptions(a + b), "Jawab secepat mungkin.", `${a} + ${b} = ${a + b}.`));

      if (bank.length >= 100) break;

      if (a >= b) {
        bank.push(choice(`cepat-${id++}`, `${a} - ${b} = ?`, a - b, numberOptions(a - b), "Jawab secepat mungkin.", `${a} - ${b} = ${a - b}.`));
      }
    }

    return bank.slice(0, 100);
  }

  function makePicBank() {
    const base = [
      ["🍎", "Apel", "Buah"], ["🍌", "Pisang", "Buah"], ["🍇", "Anggur", "Buah"], ["🍊", "Jeruk", "Buah"], ["🍉", "Semangka", "Buah"],
      ["🐱", "Kucing", "Hewan"], ["🐶", "Anjing", "Hewan"], ["🐟", "Ikan", "Hewan"], ["🐔", "Ayam", "Hewan"], ["🐘", "Gajah", "Hewan"],
      ["🚗", "Mobil", "Kendaraan"], ["🚲", "Sepeda", "Kendaraan"], ["✈️", "Pesawat", "Kendaraan"], ["🚢", "Kapal", "Kendaraan"], ["🚌", "Bus", "Kendaraan"],
      ["🏫", "Sekolah", "Tempat"], ["🏠", "Rumah", "Tempat"], ["🏥", "Rumah sakit", "Tempat"], ["🏪", "Toko", "Tempat"], ["🌳", "Pohon", "Alam"],
      ["🌞", "Matahari", "Alam"], ["🌧️", "Hujan", "Alam"], ["🌈", "Pelangi", "Alam"], ["🌙", "Bulan", "Alam"], ["⭐", "Bintang", "Alam"],
      ["📚", "Buku", "Benda"], ["✏️", "Pensil", "Benda"], ["🎒", "Tas", "Benda"], ["⚽", "Bola", "Benda"], ["🧸", "Boneka", "Benda"]
    ];

    const combos = [
      [["🏫","📚"], "Buku sekolah", "Benda"], [["🍚","🍗"], "Nasi ayam", "Makanan"], [["🌧️","☂️"], "Payung hujan", "Benda"],
      [["🧼","🖐️"], "Cuci tangan", "Kegiatan"], [["📖","👀"], "Membaca", "Kegiatan"], [["⚽","🥅"], "Main bola", "Kegiatan"],
      [["🍌","🥛"], "Susu pisang", "Minuman"], [["🍎","🧃"], "Jus apel", "Minuman"], [["🚲","🏫"], "Bersepeda ke sekolah", "Kegiatan"],
      [["🧹","🏠"], "Membersihkan rumah", "Kegiatan"]
    ];

    const bank = [];
    let id = 1;

    base.forEach(([emoji, answer, category]) => {
      bank.push({
        id: `pic-${id++}`,
        combo: [emoji],
        answer,
        category,
        hint: `Kategori: ${category}.`,
        explain: `Jawaban yang benar adalah ${answer}.`
      });
    });

    combos.forEach(([combo, answer, category]) => {
      bank.push({
        id: `pic-${id++}`,
        combo,
        answer,
        category,
        hint: `Kategori: ${category}.`,
        explain: `Jawaban yang benar adalah ${answer}.`
      });
    });

    while (bank.length < 100) {
      const a = base[bank.length % base.length];
      const b = base[(bank.length + 7) % base.length];
      const answer = `${a[1]} dan ${b[1]}`;

      bank.push({
        id: `pic-${id++}`,
        combo: [a[0], b[0]],
        answer,
        category: "Gabungan",
        hint: "Sebutkan dua gambar yang terlihat.",
        explain: `Jawaban yang benar adalah ${answer}.`
      });
    }

    return bank.slice(0, 100);
  }

  function makeBalloonBank() {
    const bank = [];
    let id = 1;
    const colors = ["Merah", "Biru", "Kuning", "Hijau", "Ungu", "Pink"];

    for (let n = 1; bank.length < 100; n++) {
      bank.push({
        id: `balloon-${id++}`,
        mode: "number",
        q: `Cari angka ${n}`,
        a: String(n),
        opts: numberOptions(n),
        hint: `Pilih balon bernomor ${n}.`,
        explain: `Jawaban yang benar adalah ${n}.`
      });

      if (bank.length >= 100) break;

      const a = (n % 15) + 1;
      const b = (n % 9) + 1;

      bank.push({
        id: `balloon-${id++}`,
        mode: "sum",
        q: `${a} + ${b} = ?`,
        a: String(a + b),
        opts: numberOptions(a + b),
        hint: `Jumlahkan ${a} dan ${b}.`,
        explain: `${a} + ${b} = ${a + b}.`
      });

      if (bank.length >= 100) break;

      const color = colors[n % colors.length];

      bank.push({
        id: `balloon-${id++}`,
        mode: "color",
        q: `Cari warna ${color}`,
        a: color,
        opts: shuffle(colors).slice(0, 4),
        hint: `Pilih balon warna ${color}.`,
        explain: `Jawaban yang benar adalah ${color}.`
      });
    }

    return bank.slice(0, 100);
  }

  function questionKey(item) {
    if (item.word) return `word:${item.word}`;
    if (item.combo && item.answer) return `pic:${item.combo.join("-")}:${item.answer}`;
    if (item.q && item.a !== undefined) return `qa:${item.q}:${item.a}`;
    if (item.answer) return `answer:${item.answer}`;
    return JSON.stringify(item);
  }

  window.SDGAMES.questionBanks = {
    math: makeMathBank(),
    scramble: makeScrambleBank(),
    truefalse: makeTrueFalseBank(),
    mapel: makeMapelBank(),
    cerita: makeCeritaBank(),
    cepat: makeCepatBank(),
    pic: makePicBank(),
    balloon: makeBalloonBank()
  };

  window.SDGAMES.pickQuestions = function (bankName, total = 10, filterFn = null) {
    const bank = window.SDGAMES.questionBanks[bankName] || [];
    const historyKey = `sd_question_history_${bankName}`;
    const old = JSON.parse(localStorage.getItem(historyKey) || "[]");

    let data = bank.slice();

    if (typeof filterFn === "function") data = data.filter(filterFn);

    const unique = new Map();
    data.forEach(item => {
      const key = questionKey(item);
      if (!unique.has(key)) unique.set(key, item);
    });

    data = Array.from(unique.values());

    const fresh = shuffle(data.filter(item => !old.includes(questionKey(item))));
    const used = shuffle(data.filter(item => old.includes(questionKey(item))));

    const selected = [...fresh, ...used].slice(0, Math.min(total, data.length));
    const selectedKeys = selected.map(questionKey);

    localStorage.setItem(
      historyKey,
      JSON.stringify([...selectedKeys, ...old].slice(0, 300))
    );

    return selected;
  };
})();