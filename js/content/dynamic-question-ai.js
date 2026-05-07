// js/content/dynamic-question-ai.js
(function () {
    "use strict";
  
    window.SD_AI_QUIZ = window.SD_AI_QUIZ || {};
  
    const SD_AI_HISTORY_KEY = "sd_ai_quiz_history_v1";

    function getQuizHistoryKey(grade, subject, level) {
      return `${grade}__${subject}__${level}`;
    }
    
    function getQuizHistory() {
      try {
        return JSON.parse(localStorage.getItem(SD_AI_HISTORY_KEY) || "{}");
      } catch (e) {
        return {};
      }
    }
    
    function saveQuizHistory(history) {
      localStorage.setItem(SD_AI_HISTORY_KEY, JSON.stringify(history));
    }
    
    function questionId(q) {
      return String(q?.q || "").trim().toLowerCase();
    }
    
    function generateUniqueQuestions({
      grade,
      subject,
      level,
      total,
      generator
    }) {
      const history = getQuizHistory();
      const key = getQuizHistoryKey(grade, subject, level);
    
      history[key] = Array.isArray(history[key]) ? history[key] : [];
    
      const used = new Set(history[key]);
      const result = [];
      const resultIds = new Set();
    
      let tries = 0;
      const maxTries = total * 80;
    
      while (result.length < total && tries < maxTries) {
        tries++;
    
        const q = generator();
        const id = questionId(q);
    
        if (!id) continue;
    
        if (used.has(id)) continue;
        if (resultIds.has(id)) continue;
    
        result.push(q);
        resultIds.add(id);
      }
    
      // Kalau semua soal sudah pernah keluar, reset history untuk level ini
      if (result.length < total) {
        history[key] = [];
        used.clear();
    
        while (result.length < total && tries < maxTries * 2) {
          tries++;
    
          const q = generator();
          const id = questionId(q);
    
          if (!id) continue;
          if (resultIds.has(id)) continue;
    
          result.push(q);
          resultIds.add(id);
        }
      }
    
      history[key] = [
        ...history[key],
        ...result.map(questionId)
      ].slice(-300);
    
      saveQuizHistory(history);
    
      return shuffle(result);
    }

    function randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    function shuffle(arr) {
      return (arr || []).slice().sort(() => Math.random() - 0.5);
    }
  
    function pick(arr) {
      const a = (arr || []).filter(Boolean);
      return a[Math.floor(Math.random() * a.length)];
    }
  
    function makeQuestion(q, correct, wrongs, level) {
      const c = String(correct);
      const pool = shuffle((wrongs || []).map(String).filter(x => x && x !== c));
      const options = shuffle([c, ...pool.slice(0, 3)]);
  
      while (options.length < 4) options.push("Belum tepat");
  
      return {
        q,
        a: options,
        correct: options.indexOf(c),
        level
      };
    }
  
    function numOptions(correct, min = 0, max = 30) {
      const set = new Set([String(correct)]);
      let guard = 0;
  
      while (set.size < 4 && guard < 100) {
        guard++;
        const delta = randInt(-5, 5);
        const val = Number(correct) + delta;
        if (val >= min && val <= max && val !== Number(correct)) {
          set.add(String(val));
        }
      }
  
      return Array.from(set);
    }
    const CACHE = {};

    window.SD_AI_QUIZ.generateCached = function ({ grade, subject, level = "campuran", total = 25 }) {
      const key = `${grade}_${subject}_${level}_${total}`;
    
      if (!CACHE[key]) {
        CACHE[key] = window.SD_AI_QUIZ.generate({
          grade,
          subject,
          level,
          total
        });
      }
    
      return CACHE[key].slice();
    };

    function generateBahasaIndonesiaKelas1(level = "campuran") {
      const mudah = [
        () => makeQuestion("Huruf abjad dimulai dari huruf ... 🔤", "A", ["B", "C", "D"], "mudah"),
        () => makeQuestion("Huruf vokal adalah ... 🎵", "A, I, U, E, O", ["B, C, D", "K, L, M", "P, Q, R"], "mudah"),
        () => makeQuestion("B untuk ... ⚽", "Bola", ["Ayam", "Ceri", "Meja"], "mudah"),
        () => makeQuestion("Kata 'buku' diawali huruf ... 📚", "B", ["A", "C", "D"], "mudah"),
        () => makeQuestion("Kalimat terdiri dari beberapa ... 💬", "kata", ["warna", "angka", "gambar"], "mudah"),
        () => makeQuestion("Mata digunakan untuk ... 👀", "melihat", ["berjalan", "menulis", "makan"], "mudah"),
        () => makeQuestion("Kata sopan saat diberi bantuan adalah ... 🙏", "terima kasih", ["pergi", "diam", "lari"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Huruf selain vokal disebut huruf ... 🔤", "konsonan", ["angka", "warna", "gambar"], "sedang"),
        () => makeQuestion("Suku kata membantu kita untuk ... 📖", "membaca kata", ["mewarnai", "berlari", "menghitung uang"], "sedang"),
        () => makeQuestion("Kata yang benar adalah ... 📝", "rumah", ["rmuah", "hruam", "umrahh"], "sedang"),
        () => makeQuestion("Kalimat yang benar adalah ... 💬", "Ibu memasak.", ["Memasak ibu.", "Ibu.", "Bola buku makan."], "sedang"),
        () => makeQuestion("Keluarga harus saling ... 👨‍👩‍👧", "menyayangi", ["mengejek", "bertengkar", "mendorong"], "sedang"),
        () => makeQuestion("Benda di sekolah yang digunakan untuk menulis adalah ... ✏️", "pensil", ["bola", "sepatu", "sendok"], "sedang"),
        () => makeQuestion("Cerita pendek biasanya memiliki ... 📚", "tokoh dan peristiwa", ["harga dan uang", "rumus dan angka", "warna saja"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa kita harus mengenal huruf? 🔤", "agar bisa membaca dan menulis", ["agar bisa tidur", "agar bisa berlari", "agar bisa makan"], "sulit"),
        () => makeQuestion("Mengapa membaca harus jelas? 📖", "agar orang lain mudah memahami", ["agar bingung", "agar salah baca", "agar tidak terdengar"], "sulit"),
        () => makeQuestion("Tulisan yang rapi membuat tulisan mudah ... ✏️", "dibaca", ["dibuang", "disembunyikan", "dirusak"], "sulit"),
        () => makeQuestion("Jika ingin meminta bantuan, kata sopan yang digunakan adalah ... 🤲", "tolong", ["diam", "ambil", "lari"], "sulit"),
        () => makeQuestion("Jika melakukan kesalahan, kita sebaiknya mengucapkan ... 😊", "maaf", ["terima kasih", "selamat pagi", "sampai jumpa"], "sulit"),
        () => makeQuestion("Mengapa barang sekolah harus dijaga? 🏫", "agar bisa dipakai belajar", ["agar cepat rusak", "agar hilang", "agar kotor"], "sulit"),
        () => makeQuestion("Mengapa membaca buku itu penting? 📖", "karena membaca menambah ilmu", ["karena membuat malas", "karena membuat lupa", "karena tidak berguna"], "sulit"),
        () => makeQuestion("Sikap baik kepada hewan dan tumbuhan adalah ... 🐱🌱", "merawat dan menyayangi", ["merusak", "membuang", "menyakiti"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaJawaKelas1(level = "campuran") {
      const mudah = [
        () => makeQuestion("Basa Jawa kudu ... 👋", "dijaga", ["dirusak", "dilalekake", "diejek"], "mudah"),
        () => makeQuestion("Ucapan pagi dalam Bahasa Jawa adalah ... 🌞", "Sugeng enjing", ["Sugeng dalu", "Sugeng wengi", "Sugeng turu"], "mudah"),
        () => makeQuestion("Matur nuwun artinya ... 🙏", "terima kasih", ["maaf", "tolong", "selamat malam"], "mudah"),
        () => makeQuestion("Mripat digunakan untuk ... 👀", "melihat", ["berjalan", "makan", "menulis"], "mudah"),
        () => makeQuestion("Bapak termasuk anggota ... 👨", "kulawarga", ["dolanan", "kewan", "warna"], "mudah"),
        () => makeQuestion("Siji artinya angka ... 🔢", "1", ["2", "3", "4"], "mudah"),
        () => makeQuestion("Abang artinya warna ... ❤️", "merah", ["biru", "kuning", "hijau"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Tata krama yaiku ... 😊", "sopan santun", ["dolanan", "angka", "warna"], "sedang"),
        () => makeQuestion("Nyuwun pangapunten artinya ... 🙏", "meminta maaf", ["makan", "bermain", "tidur"], "sedang"),
        () => makeQuestion("Kewan lan tetuwuhan termasuk ... 🐱🌱", "makhluk urip", ["barang sekolah", "warna", "angka"], "sedang"),
        () => makeQuestion("Barang sekolah sing digunakake kanggo maca yaiku ... 📚", "buku", ["bola", "sendok", "sepatu"], "sedang"),
        () => makeQuestion("Dolanan bocah kudu dilakukan dengan ... ⚽", "rukun lan jujur", ["bertengkar", "curang", "mengejek"], "sedang"),
        () => makeQuestion("Tembang dolanan yaiku ... 🎶", "lagu kanggo bocah", ["angka Jawa", "barang sekolah", "warna benda"], "sedang"),
        () => makeQuestion("Crita cekak yaiku cerita sing ... 📚", "cendhak", ["panjang sekali", "tanpa tokoh", "berisi angka saja"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Ngapa kudu sinau Basa Jawa? 🗣️", "supaya bisa nguri-uri budaya Jawa", ["supaya bisa mengejek", "supaya lupa budaya", "supaya tidak belajar"], "sulit"),
        () => makeQuestion("Ngapa kudu menehi salam nalika ketemu wong liya? 👋", "supaya sopan lan ramah", ["supaya ribut", "supaya marah", "supaya tidak peduli"], "sulit"),
        () => makeQuestion("Ngapa awak kudu dijaga kebersihane? 🧍", "supaya sehat", ["supaya sakit", "supaya kotor", "supaya lelah"], "sulit"),
        () => makeQuestion("Kepiye cara ngajeni wong tuwa? 👨‍👩‍👧", "ngomong sopan lan manut", ["membentak", "mengejek", "membantah terus"], "sulit"),
        () => makeQuestion("Ngapa barang sekolah kudu dijaga? 🏫", "supaya awet lan bisa digunakake sinau", ["supaya rusak", "supaya hilang", "supaya kotor"], "sulit"),
        () => makeQuestion("Ngapa tembang dolanan penting? 🎶", "amarga kalebu budaya Jawa lan ngemot piwulang", ["amarga kudu dilalekake", "amarga ora ana gunane", "amarga kanggo ngece"], "sulit"),
        () => makeQuestion("Sikap sing apik marang kewan lan tetuwuhan yaiku ... 🐱🌱", "ngrawat lan nyayangi", ["ngrusak", "nyakiti", "mbuwang"], "sulit"),
        () => makeQuestion("Cara tresna budaya Jawa yaiku ... 🎭", "sinau basa, lagu, lan budaya Jawa", ["ngece budaya", "nglalekake budaya", "ora gelem sinau"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateMatematikaKelas1(level = "campuran") {
      const mudah = [
        () => makeQuestion("Angka setelah 1 adalah ... 🔢", "2", ["3", "4", "5"], "mudah"),
        () => makeQuestion("Angka sebelum 5 adalah ... 🔢", "4", ["3", "6", "7"], "mudah"),
        () => makeQuestion("🍎🍎 ada berapa apel?", "2", ["1", "3", "4"], "mudah"),
        () => makeQuestion("⚽⚽⚽ ada berapa bola?", "3", ["2", "4", "5"], "mudah"),
        () => makeQuestion("1 + 1 = ... ➕", "2", ["1", "3", "4"], "mudah"),
        () => makeQuestion("3 - 1 = ... ➖", "2", ["1", "3", "4"], "mudah"),
        () => makeQuestion("Bentuk bola adalah ... ⚽", "lingkaran", ["segitiga", "persegi", "kotak"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Angka setelah 7 adalah ... 🔢", "8", ["6", "9", "10"], "sedang"),
        () => makeQuestion("Angka sebelum 10 adalah ... 🔢", "9", ["8", "7", "6"], "sedang"),
        () => makeQuestion("🍎🍎🍎 lebih banyak dari 🍎🍎. Benar atau salah?", "benar", ["salah", "sama", "tidak tahu"], "sedang"),
        () => makeQuestion("2 + 3 = ... ➕", "5", ["4", "6", "7"], "sedang"),
        () => makeQuestion("5 - 2 = ... ➖", "3", ["2", "4", "5"], "sedang"),
        () => makeQuestion("Lanjutan pola 🔴🔵🔴 adalah ...", "🔵", ["🔴", "⭐", "⚫"], "sedang"),
        () => makeQuestion("Arah kanan ditunjukkan oleh ... 🧭", "➡️", ["⬅️", "⬆️", "⬇️"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa kita belajar angka? 🔢", "agar bisa menghitung benda", ["agar bisa tidur", "agar bisa bernyanyi", "agar bisa makan"], "sulit"),
        () => makeQuestion("Jika ada 4 buku lalu ditambah 2 buku, jumlahnya menjadi ... 📚", "6", ["5", "7", "8"], "sulit"),
        () => makeQuestion("Jika ada 5 apel lalu dimakan 1, sisa apel adalah ... 🍎", "4", ["3", "5", "6"], "sulit"),
        () => makeQuestion("Urutan angka yang benar adalah ...", "1, 2, 3", ["3, 2, 1", "2, 1, 3", "1, 3, 2"], "sulit"),
        () => makeQuestion("Benda yang lebih besar adalah ...", "🐘 gajah", ["🐭 tikus", "🐜 semut", "🐞 kepik"], "sulit"),
        () => makeQuestion("Kegiatan yang biasanya dilakukan pagi hari adalah ... 🌞", "sarapan", ["tidur malam", "melihat bulan", "memakai selimut malam"], "sulit"),
        () => makeQuestion("Uang digunakan untuk ... 💰", "membeli barang", ["membuang barang", "merusak barang", "menyembunyikan barang"], "sulit"),
        () => makeQuestion("Mengapa matematika penting? 🧠", "karena membantu menghitung dalam kehidupan sehari-hari", ["karena membuat malas", "karena tidak berguna", "karena hanya untuk bermain"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePancasilaKelas1(level = "campuran") {
      const mudah = [
        () => makeQuestion("Pancasila adalah dasar negara ... 🇮🇩", "Indonesia", ["Jepang", "Malaysia", "Australia"], "mudah"),
        () => makeQuestion("Sila pertama mengajarkan kita untuk ... 🙏", "percaya kepada Tuhan", ["bertengkar", "berbohong", "mengejek"], "mudah"),
        () => makeQuestion("Sila kedua mengajarkan kita untuk ... ❤️", "menyayangi sesama", ["menyakiti teman", "mengejek", "marah-marah"], "mudah"),
        () => makeQuestion("Sila ketiga mengajarkan hidup ... 🤝", "rukun", ["bertengkar", "sendiri", "curang"], "mudah"),
        () => makeQuestion("Aturan dibuat agar hidup menjadi ... 📜", "tertib", ["kacau", "ribut", "berantakan"], "mudah"),
        () => makeQuestion("Hak adalah sesuatu yang kita ... 📚", "dapatkan", ["buang", "rusak", "lupakan"], "mudah"),
        () => makeQuestion("Anak baik harus bersikap ... 🌟", "jujur", ["bohong", "curang", "nakal"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Sila keempat mengajarkan kita untuk ... 🗳️", "musyawarah", ["memaksa teman", "bertengkar", "menang sendiri"], "sedang"),
        () => makeQuestion("Sila kelima mengajarkan sikap ... ⚖️", "adil", ["pilih kasih", "curang", "egois"], "sedang"),
        () => makeQuestion("Tata tertib sekolah contohnya ... 🏫", "datang tepat waktu", ["berlari di kelas", "membuang sampah sembarangan", "mencoret meja"], "sedang"),
        () => makeQuestion("Hidup rukun berarti hidup ... 😊", "damai bersama", ["bertengkar", "saling mengejek", "bermusuhan"], "sedang"),
        () => makeQuestion("Gotong royong berarti bekerja ... 🧹", "bersama-sama", ["sendiri-sendiri", "dengan marah", "asal-asalan"], "sedang"),
        () => makeQuestion("Kewajiban adalah sesuatu yang harus kita ... ✅", "lakukan", ["abaikan", "tinggalkan", "lupakan"], "sedang"),
        () => makeQuestion("Cinta tanah air berarti bangga menjadi warga ... 🇮🇩", "Indonesia", ["asing", "sekolah saja", "rumah saja"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Jika teman berbeda agama sedang beribadah, sikap yang tepat adalah ... 🙏", "menghormati dan tidak mengganggu", ["mengganggu", "mengejek", "berisik"], "sulit"),
        () => makeQuestion("Jika bermain bersama teman, sikap adil adalah ... ⚖️", "bergantian bermain", ["merebut giliran", "tidak mau berbagi", "curang"], "sulit"),
        () => makeQuestion("Jika kelas kotor, sikap yang baik adalah ... 🧹", "ikut membersihkan kelas", ["membiarkan saja", "menambah sampah", "menyalahkan teman"], "sulit"),
        () => makeQuestion("Mengapa aturan harus dipatuhi? 📜", "agar hidup tertib dan aman", ["agar semua ribut", "agar boleh nakal", "agar kelas kacau"], "sulit"),
        () => makeQuestion("Mengapa kita harus menghormati orang tua? 👨‍👩‍👧", "karena orang tua merawat dan menyayangi kita", ["karena ingin membantah", "karena tidak penting", "karena boleh dimarahi"], "sulit"),
        () => makeQuestion("Jika melakukan kesalahan, anak baik harus ... 😊", "meminta maaf", ["berbohong", "lari", "menyalahkan teman"], "sulit"),
        () => makeQuestion("Contoh cinta tanah air adalah ... 🇮🇩", "mengikuti upacara dengan tertib", ["mengejek bendera", "malas belajar", "bertengkar saat upacara"], "sulit"),
        () => makeQuestion("Mengapa gotong royong penting? 🤝", "karena pekerjaan menjadi lebih ringan", ["karena membuat pekerjaan berat", "karena membuat teman sedih", "karena tidak perlu membantu"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePJOKKelas1(level = "campuran") {
      const mudah = [
        () => makeQuestion("PJOK mengajarkan kita untuk ... 🏃", "bergerak dan hidup sehat", ["tidur terus", "makan permen saja", "berdiam diri"], "mudah"),
        () => makeQuestion("Sebelum olahraga kita melakukan ... 🔥", "pemanasan", ["pendinginan", "tidur", "makan banyak"], "mudah"),
        () => makeQuestion("Setelah olahraga kita melakukan ... ❄️", "pendinginan", ["pemanasan", "berlari terus", "langsung tidur"], "mudah"),
        () => makeQuestion("Contoh gerak lokomotor adalah ... 🏃", "berlari", ["duduk", "diam", "tidur"], "mudah"),
        () => makeQuestion("Contoh menjaga kebersihan tubuh adalah ... 🧼", "mencuci tangan", ["membuang sampah sembarangan", "tidak mandi", "makan tanpa cuci tangan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Pemanasan berguna untuk ... 🔥", "menyiapkan tubuh sebelum olahraga", ["membuat tubuh cedera", "membuat malas", "membuat mengantuk"], "sedang"),
        () => makeQuestion("Gerak non-lokomotor adalah gerakan ... 🤸", "di tempat", ["berpindah jauh", "sambil tidur", "tanpa tubuh"], "sedang"),
        () => makeQuestion("Gerak manipulatif menggunakan ... ⚽", "benda", ["suara", "warna", "angka"], "sedang"),
        () => makeQuestion("Keseimbangan tubuh berguna agar ... ⚖️", "tidak mudah jatuh", ["mudah jatuh", "selalu tidur", "tidak bergerak"], "sedang"),
        () => makeQuestion("Makanan sehat membantu tubuh menjadi ... 🍎", "kuat dan sehat", ["lemah", "mudah sakit", "malas bergerak"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Jika teman jatuh saat bermain, sikap yang benar adalah ... 🤝", "menolong teman", ["menertawakan", "mendorong lagi", "meninggalkan"], "sulit"),
        () => makeQuestion("Mengapa kita tidak boleh mendorong teman saat bermain? 🛡️", "karena bisa membuat teman cedera", ["agar menang cepat", "agar permainan ramai", "agar teman takut"], "sulit"),
        () => makeQuestion("Sportivitas berarti ... 🏆", "jujur dan adil saat bermain", ["curang agar menang", "marah saat kalah", "mengejek lawan"], "sulit"),
        () => makeQuestion("Jika kalah dalam permainan, sikap yang tepat adalah ...", "menerima dengan baik", ["marah", "menangis terus", "menyalahkan teman"], "sulit"),
        () => makeQuestion("Hidup sehat dilakukan dengan cara ... 🌟", "olahraga, makan sehat, tidur cukup, dan menjaga kebersihan", ["tidur sangat larut", "tidak mandi", "makan permen terus"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateSeniBudayaKelas1(level = "campuran") {
      const mudah = [
        () => makeQuestion("Seni budaya adalah kegiatan untuk ... 🎨", "mengekspresikan perasaan", ["tidur terus", "bertengkar", "membuang sampah"], "mudah"),
        () => makeQuestion("Alat untuk menggambar adalah ... ✏️", "pensil", ["sendok", "sepatu", "piring"], "mudah"),
        () => makeQuestion("Garis lurus contohnya adalah ...", "➖", ["〰️", "⚡", "⭕"], "mudah"),
        () => makeQuestion("Warna merah ditunjukkan oleh ...", "🔴", ["🔵", "🟢", "⚫"], "mudah"),
        () => makeQuestion("Bernyanyi dilakukan dengan ... 🎤", "suara", ["kaki", "sepatu", "tas"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Garis adalah dasar untuk ... ✏️", "menggambar", ["tidur", "makan", "berlari"], "sedang"),
        () => makeQuestion("Mewarnai sebaiknya dilakukan dengan ... 🖍️", "rapi dan sabar", ["asal-asalan", "merusak kertas", "keluar garis terus"], "sedang"),
        () => makeQuestion("Musik adalah ... 🎵", "bunyi yang enak didengar", ["gambar di kertas", "makanan sehat", "alat olahraga"], "sedang"),
        () => makeQuestion("Tempo adalah ... 🎶", "cepat atau lambatnya lagu", ["warna gambar", "bentuk garis", "nama benda"], "sedang"),
        () => makeQuestion("Tari adalah gerakan tubuh mengikuti ... 💃", "irama musik", ["suara hujan", "warna pensil", "angka"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa kita harus menghargai karya teman? 🖼️", "agar teman merasa senang dan dihargai", ["agar teman sedih", "agar karya rusak", "agar bisa mengejek"], "sulit"),
        () => makeQuestion("Jika melihat gambar teman bagus, sikap yang tepat adalah ... 👏", "memberi pujian", ["mengejek", "merusak", "mencoret"], "sulit"),
        () => makeQuestion("Mengapa tidak perlu takut salah saat berkarya? 🌟", "karena seni adalah proses belajar dan mencoba", ["karena tidak perlu belajar", "karena karya harus dibuang", "karena teman harus mengejek"], "sulit"),
        () => makeQuestion("Kolase dari daun termasuk karya seni dari ... 🍃", "bahan alam", ["bahan berbahaya", "alat elektronik", "makanan"], "sulit"),
        () => makeQuestion("Ekspresi dalam seni berguna untuk ... 😊", "menunjukkan perasaan", ["menyembunyikan karya", "merusak gambar", "membuat teman takut"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaIndonesiaKelas2(level = "campuran") {
      const mudah = [
        () => makeQuestion("Membaca nyaring dilakukan dengan suara ... 📖", "jelas", ["pelan sekali", "tidak bersuara", "marah"], "mudah"),
        () => makeQuestion("Membaca dalam hati dilakukan tanpa ... 🤫", "suara", ["mata", "buku", "pikiran"], "mudah"),
        () => makeQuestion("Kalimat diawali dengan huruf ... 🔠", "kapital", ["kecil", "acak", "angka"], "mudah"),
        () => makeQuestion("Tanda titik digunakan di ...", "akhir kalimat berita", ["awal kata", "tengah huruf", "nama orang"], "mudah"),
        () => makeQuestion("Kata benda adalah nama ... 🧸", "benda", ["kegiatan", "sifat", "warna saja"], "mudah"),
        () => makeQuestion("Kata kerja menunjukkan ... 🏃", "aktivitas", ["benda", "warna", "angka"], "mudah"),
        () => makeQuestion("Kata sifat menjelaskan ... 😊", "keadaan", ["jumlah uang", "tempat tidur", "nama hari"], "mudah"),
        () => makeQuestion("Cerita pendek adalah cerita yang ... 📖", "sederhana dan tidak terlalu panjang", ["selalu berupa angka", "tidak punya arti", "hanya satu huruf"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Saat membaca nyaring, kita harus memperhatikan ...", "intonasi dan tanda baca", ["warna sampul", "harga buku", "ukuran meja"], "sedang"),
        () => makeQuestion("Tanda tanya digunakan untuk kalimat ... ❓", "tanya", ["berita", "diam", "warna"], "sedang"),
        () => makeQuestion("Tanda seru digunakan untuk kalimat ... ❗", "perintah atau emosi", ["biasa saja", "nama benda", "angka"], "sedang"),
        () => makeQuestion("Huruf kapital digunakan untuk ...", "nama orang dan awal kalimat", ["semua huruf kecil", "akhir kalimat saja", "menghapus kata"], "sedang"),
        () => makeQuestion("Contoh kata kerja adalah ... 🏃", "berlari", ["meja", "besar", "buku"], "sedang"),
        () => makeQuestion("Contoh kata benda adalah ... 📘", "buku", ["berlari", "baik", "cepat"], "sedang"),
        () => makeQuestion("Contoh kata sifat adalah ... 😊", "baik", ["kursi", "makan", "minum"], "sedang"),
        () => makeQuestion("Cerita biasanya memiliki ...", "awal, tengah, dan akhir", ["warna, angka, dan ukuran", "titik saja", "huruf saja"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa membaca nyaring harus jelas?", "agar pendengar memahami bacaan", ["agar teman bingung", "agar suara hilang", "agar tidak perlu membaca"], "sulit"),
        () => makeQuestion("Mengapa membaca dalam hati perlu fokus?", "agar isi bacaan mudah dipahami", ["agar bisa bermain", "agar tidak membaca", "agar lupa cerita"], "sulit"),
        () => makeQuestion("Kalimat yang benar adalah ...", "Budi membaca buku.", ["budi membaca buku.", "Budi membaca buku", "budi Membaca Buku."], "sulit"),
        () => makeQuestion("Jika ingin bertanya, tanda baca yang tepat adalah ...", "?", [".", "!", ","], "sulit"),
        () => makeQuestion("Susunan kata yang benar adalah ... 🧩", "Saya makan nasi.", ["Makan saya nasi.", "Nasi saya.", "Saya nasi makan"], "sulit"),
        () => makeQuestion("Antonim dari panas adalah ... 🔄", "dingin", ["hangat", "api", "terang"], "sulit"),
        () => makeQuestion("Sinonim dari baik adalah ...", "bagus", ["buruk", "panas", "kecil"], "sulit"),
        () => makeQuestion("Saat teman bercerita, sikap yang tepat adalah ... 👂", "mendengarkan dengan fokus", ["memotong cerita", "berteriak", "mengejek"], "sulit"),
        () => makeQuestion("Mengapa tulisan harus rapi? ✍️", "agar mudah dibaca", ["agar sulit dilihat", "agar cepat hilang", "agar tidak selesai"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaJawaKelas2(level = "campuran") {
      const mudah = [
        () => makeQuestion("Basa Jawa iku basa daerah saka ... 🗣️", "Jawa", ["Sumatra", "Kalimantan", "Papua"], "mudah"),
        () => makeQuestion("Unggah-ungguh tegese ... 🙏", "tata krama nalika ngomong", ["angka", "warna", "dolanan"], "mudah"),
        () => makeQuestion("Tembung aran yaiku tembung kanggo ... 🧸", "jeneng barang", ["kegiatan", "warna", "sifat"], "mudah"),
        () => makeQuestion("Tembung kriya nuduhake ... 🏃", "pakaryan utawa kegiatan", ["barang", "warna", "ukuran"], "mudah"),
        () => makeQuestion("Tembung sifat nerangake ... 😊", "kahanan", ["angka", "barang", "lagu"], "mudah"),
        () => makeQuestion("Ukara yaiku kumpulan tembung sing nduweni ... ✏️", "arti", ["warna", "gambar", "swara"], "mudah"),
        () => makeQuestion("Matur nuwun artinya ... 🙏", "terima kasih", ["maaf", "selamat pagi", "silakan"], "mudah"),
        () => makeQuestion("Nyuwun pangapunten artinya ...", "mohon maaf", ["terima kasih", "selamat siang", "makan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Basa krama biasane digunakake marang ...", "wong tuwa utawa guru", ["kanca dolanan", "boneka", "kewan"], "sedang"),
        () => makeQuestion("Basa ngoko biasane digunakake marang ...", "kanca sebaya", ["guru", "wong tuwa", "tamu resmi"], "sedang"),
        () => makeQuestion("Contoh tembung aran yaiku ... 📘", "buku", ["mlaku", "apik", "pinter"], "sedang"),
        () => makeQuestion("Contoh tembung kriya yaiku ... 🏃", "mlaku", ["meja", "gedhe", "abang"], "sedang"),
        () => makeQuestion("Contoh tembung sifat yaiku ... 😊", "apik", ["mangan", "buku", "kursi"], "sedang"),
        () => makeQuestion("Ukara sing bener yaiku ...", "Aku sinau.", ["Sinau aku", "Aku.", "Buku apik mlaku"], "sedang"),
        () => makeQuestion("Dongeng Jawa biasane nduweni ... 🐉", "pesan moral", ["nomor telepon", "harga barang", "aturan matematika"], "sedang"),
        () => makeQuestion("Aksara Jawa kalebu ... 🔤", "warisan budaya", ["alat olahraga", "makanan", "warna"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa unggah-ungguh penting nalika ngomong? 🙏", "supaya kita sopan lan ngurmati wong liya", ["supaya bisa ngece", "supaya ribut", "supaya ora sinau"], "sulit"),
        () => makeQuestion("Yen ngomong karo guru, basa sing luwih tepat yaiku ...", "basa krama", ["basa kasar", "teriakan", "diam saja"], "sulit"),
        () => makeQuestion("Kalimat ngoko 'Aku mangan' yen luwih sopan bisa dadi ...", "Kula nedha", ["Aku turu", "Kowe lunga", "Balon abang"], "sulit"),
        () => makeQuestion("Mengapa tulisan kudu rapi? ✍️", "supaya gampang diwaca", ["supaya angel diwaca", "supaya ilang", "supaya ora rampung"], "sulit"),
        () => makeQuestion("Sawise maca teks, kita kudu bisa ... 📖", "ngerti isi teks", ["ngrusak buku", "lali kabeh", "ngece kanca"], "sulit"),
        () => makeQuestion("Paribasan 'alon-alon waton kelakon' ngajari kita supaya ...", "sabar lan ati-ati", ["grusa-grusu", "males", "ngece"], "sulit"),
        () => makeQuestion("Nguri-uri budaya Jawa tegese ... 🌟", "njaga lan melestarikan budaya Jawa", ["nglalekake budaya", "ngece budaya", "ora gelem sinau"], "sulit"),
        () => makeQuestion("Sikap sing apik nalika kanca nyritakake pengalaman yaiku ... 👂", "ngrungokake kanthi sopan", ["motong omongan", "ngguyu ngece", "mlayu"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateMatematikaKelas2(level = "campuran") {
      const mudah = [
        () => makeQuestion("Angka setelah 19 adalah ... 🔢", "20", ["18", "21", "22"], "mudah"),
        () => makeQuestion("25 terdiri dari ... 🧮", "2 puluhan dan 5 satuan", ["5 puluhan", "2 satuan", "25 puluhan"], "mudah"),
        () => makeQuestion("2 + 3 = ... ➕", "5", ["4", "6", "7"], "mudah"),
        () => makeQuestion("5 - 2 = ... ➖", "3", ["2", "4", "5"], "mudah"),
        () => makeQuestion("10 + 20 = ... ➕", "30", ["20", "40", "50"], "mudah"),
        () => makeQuestion("50 - 10 = ... ➖", "40", ["30", "50", "60"], "mudah"),
        () => makeQuestion("Bentuk bola adalah ... ⚪", "lingkaran", ["segitiga", "persegi", "kotak"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Nilai tempat dari angka 34 adalah ... 🧮", "3 puluhan dan 4 satuan", ["4 puluhan", "34 satuan", "3 satuan"], "sedang"),
        () => makeQuestion("40 + 20 = ... ➕", "60", ["50", "70", "80"], "sedang"),
        () => makeQuestion("80 - 30 = ... ➖", "50", ["40", "60", "70"], "sedang"),
        () => makeQuestion("Tanda yang tepat: 10 __ 5 ⚖️", ">", ["<", "=", "+"], "sedang"),
        () => makeQuestion("Pola berikut: 2, 4, 6, ... 🔁", "8", ["7", "9", "10"], "sedang"),
        () => makeQuestion("Satuan panjang adalah ... 📏", "cm", ["kg", "jam", "liter"], "sedang"),
        () => makeQuestion("Alat untuk mengukur berat adalah ... ⚖️", "timbangan", ["penggaris", "jam", "kompas"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Budi punya 5 apel lalu ditambah 3 apel. Jumlah apel Budi adalah ... 🍎", "8", ["6", "7", "9"], "sulit"),
        () => makeQuestion("Siti memiliki 10 permen lalu dimakan 4. Sisa permen Siti adalah ... 🍬", "6", ["5", "7", "8"], "sulit"),
        () => makeQuestion("Jam digunakan untuk mengukur ... ⏰", "waktu", ["berat", "panjang", "warna"], "sulit"),
        () => makeQuestion("1/2 berarti ... 🍕", "setengah", ["dua", "empat", "satu penuh"], "sulit"),
        () => makeQuestion("Mengapa kita harus memahami soal cerita dulu? 🧠", "agar bisa menghitung dengan benar", ["agar cepat selesai tanpa membaca", "agar bisa menebak", "agar tidak perlu berhitung"], "sulit"),
        () => makeQuestion("Uang digunakan untuk ... 💰", "membeli barang", ["menggambar", "menimbang", "mengukur"], "sulit"),
        () => makeQuestion("Bangun datar yang memiliki tiga sisi adalah ... 🔺", "segitiga", ["lingkaran", "persegi", "oval"], "sulit"),
        () => makeQuestion("Mengapa kita harus menggunakan uang dengan bijak? 💡", "agar tidak boros", ["agar cepat habis", "agar hilang", "agar rusak"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePancasilaKelas2(level = "campuran") {
      const mudah = [
        () => makeQuestion("Pancasila adalah dasar negara ... 🇮🇩", "Indonesia", ["Malaysia", "Jepang", "Australia"], "mudah"),
        () => makeQuestion("Pancasila mempunyai ... sila ⭐", "5", ["3", "4", "6"], "mudah"),
        () => makeQuestion("Sila pertama mengajarkan kita untuk ... 🙏", "percaya kepada Tuhan", ["bertengkar", "berbohong", "curang"], "mudah"),
        () => makeQuestion("Sila kedua mengajarkan kita untuk ... 🤝", "saling menghormati", ["mengejek", "menyakiti", "mengambil barang teman"], "mudah"),
        () => makeQuestion("Sila ketiga berbunyi ... 🇮🇩", "Persatuan Indonesia", ["Keadilan sosial", "Ketuhanan Yang Maha Esa", "Musyawarah"], "mudah"),
        () => makeQuestion("Contoh aturan di sekolah adalah ... 🏫", "mendengarkan guru", ["berisik saat belajar", "mencoret meja", "datang terlambat"], "mudah"),
        () => makeQuestion("Hak anak di sekolah adalah ... 📚", "belajar", ["mengganggu teman", "membuang sampah", "mengejek"], "mudah"),
        () => makeQuestion("Kewajiban anak di rumah adalah ... 🏠", "membantu orang tua", ["membentak", "mengotori rumah", "malas merapikan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Sila keempat mengajarkan kita untuk ... 🗳️", "bermusyawarah", ["memaksa teman", "menang sendiri", "bertengkar"], "sedang"),
        () => makeQuestion("Sila kelima mengajarkan kita untuk bersikap ... ⚖️", "adil", ["curang", "pilih kasih", "egois"], "sedang"),
        () => makeQuestion("Hak dan kewajiban harus ...", "seimbang", ["dipilih salah satu", "diabaikan", "dilanggar"], "sedang"),
        () => makeQuestion("Hidup rukun berarti hidup ... 🤗", "damai", ["bermusuhan", "bertengkar", "sendiri terus"], "sedang"),
        () => makeQuestion("Kerja sama membuat pekerjaan menjadi ... 🤝", "lebih ringan", ["lebih sulit", "tidak selesai", "berantakan"], "sedang"),
        () => makeQuestion("Disiplin artinya ... ⏰", "patuh pada aturan", ["melanggar aturan", "datang terlambat", "malas belajar"], "sedang"),
        () => makeQuestion("Tanggung jawab artinya ... 🎯", "melakukan tugas dengan baik", ["lari dari tugas", "menyalahkan orang lain", "tidak mau berusaha"], "sedang"),
        () => makeQuestion("Cinta tanah air dapat dilakukan dengan ... 🇮🇩", "menghormati bendera", ["merusak lingkungan", "malas upacara", "mengejek budaya"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Jika teman berbeda agama sedang beribadah, sikap yang tepat adalah ... 🙏", "menghormati dan tidak mengganggu", ["mengejek", "mengganggu", "tertawa keras"], "sulit"),
        () => makeQuestion("Jika ada keputusan musyawarah, kita sebaiknya ... 🗳️", "menerima keputusan bersama", ["marah", "memaksa pendapat sendiri", "meninggalkan teman"], "sulit"),
        () => makeQuestion("Jika bermain bersama, sikap adil adalah ... ⚖️", "bergantian dan tidak curang", ["ingin menang sendiri", "curang", "merebut giliran"], "sulit"),
        () => makeQuestion("Mengapa aturan sekolah harus ditaati? 🏫", "agar belajar tertib dan aman", ["agar kelas ribut", "agar guru marah", "agar teman takut"], "sulit"),
        () => makeQuestion("Contoh keseimbangan hak dan kewajiban adalah ...", "berhak belajar dan wajib belajar sungguh-sungguh", ["berhak bermain tanpa aturan", "wajib saja tanpa hak", "hanya meminta hak"], "sulit"),
        () => makeQuestion("Mengapa kita harus hidup rukun? 🤗", "agar hidup damai dan bahagia", ["agar sering bertengkar", "agar teman menjauh", "agar tidak punya teman"], "sulit"),
        () => makeQuestion("Jika diberi tugas kelompok, sikap yang benar adalah ... 🤝", "bekerja sama dengan teman", ["diam saja", "menyuruh teman semua", "pergi bermain"], "sulit"),
        () => makeQuestion("Mengapa tanggung jawab penting? 🎯", "agar kita dipercaya dan tugas selesai", ["agar bisa menyalahkan orang lain", "agar tidak perlu belajar", "agar tugas hilang"], "sulit"),
        () => makeQuestion("Sikap yang sesuai nilai Pancasila sehari-hari adalah ... 🌟", "jujur, sopan, dan membantu", ["berbohong, curang, dan mengejek", "malas dan egois", "melanggar aturan"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePJOKKelas2(level = "campuran") {
      const mudah = [
        () => makeQuestion("PJOK membantu tubuh menjadi ... 💪", "sehat dan kuat", ["lemah", "malas", "mudah sakit"], "mudah"),
        () => makeQuestion("Contoh gerak dasar adalah ... 🏃", "berjalan", ["tidur", "diam terus", "makan"], "mudah"),
        () => makeQuestion("Berlari lebih cepat daripada ... 🚶", "berjalan", ["melompat tinggi", "melempar", "menangkap"], "mudah"),
        () => makeQuestion("Melompat melatih ... 🐸", "keseimbangan", ["mengantuk", "makan", "menulis"], "mudah"),
        () => makeQuestion("Tubuh bersih membuat kita ... 🧼", "sehat", ["kotor", "sakit", "malas"], "mudah"),
        () => makeQuestion("Makanan sehat contohnya ... 🍎", "buah dan sayur", ["permen terus", "keripik saja", "minuman bersoda"], "mudah"),
        () => makeQuestion("Setelah lelah bermain, tubuh perlu ... 😴", "istirahat", ["dipaksa lari terus", "tidak minum", "tidak tidur"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Melempar bola melatih kekuatan ... ⚾", "tangan", ["rambut", "mata saja", "telinga"], "sedang"),
        () => makeQuestion("Menangkap bola melatih ... 🧤", "koordinasi mata dan tangan", ["tidur nyenyak", "makan cepat", "berteriak"], "sedang"),
        () => makeQuestion("Senam membuat tubuh menjadi ... 🤸", "lentur dan sehat", ["kaku", "malas bergerak", "lemah"], "sedang"),
        () => makeQuestion("Permainan bola melatih ... ⚽", "kerja sama", ["egois", "curang", "bertengkar"], "sedang"),
        () => makeQuestion("Saat olahraga kita harus mengutamakan ... 🛑", "keselamatan", ["kecerobohan", "kecepatan saja", "menang sendiri"], "sedang"),
        () => makeQuestion("Sebelum makan, sebaiknya kita ... 🧼", "mencuci tangan", ["langsung makan", "bermain tanah", "tidur"], "sedang"),
        () => makeQuestion("Tidur cukup berguna agar tubuh ... 😴", "segar dan sehat", ["semakin lelah", "mudah sakit", "tidak fokus"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa kita tidak boleh mendorong teman saat olahraga? 🛑", "karena bisa membuat teman cedera", ["agar menang cepat", "agar permainan ramai", "agar teman takut"], "sulit"),
        () => makeQuestion("Jika bermain dalam tim, sikap yang benar adalah ... 🤝", "bekerja sama dan tidak egois", ["ingin menang sendiri", "tidak mau berbagi bola", "mengejek teman"], "sulit"),
        () => makeQuestion("Jika tubuh terasa lelah setelah bermain, sebaiknya ...", "beristirahat dan minum air", ["lari terus", "tidak minum", "memaksa tubuh"], "sulit"),
        () => makeQuestion("Mengapa makanan sehat penting untuk anak? 🍎", "karena membantu tubuh tumbuh kuat", ["agar malas bergerak", "agar mudah sakit", "agar tidak belajar"], "sulit"),
        () => makeQuestion("Contoh hidup sehat setiap hari adalah ... 🌟", "olahraga, makan sehat, dan tidur cukup", ["tidak mandi", "makan permen terus", "begadang setiap malam"], "sulit"),
        () => makeQuestion("Jika teman kesulitan menangkap bola, sikap yang baik adalah ... 🧤", "membantu dan memberi semangat", ["menertawakan", "mengejek", "meninggalkan"], "sulit"),
        () => makeQuestion("Mengapa sepatu olahraga penting dipakai saat olahraga? 👟", "agar kaki lebih aman", ["agar mudah terpeleset", "agar kaki sakit", "agar lambat"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateSeniBudayaKelas2(level = "campuran") {
      const mudah = [
        () => makeQuestion("Seni adalah hasil karya manusia yang ... 🎨", "indah", ["kotor", "rusak", "berisik"], "mudah"),
        () => makeQuestion("Budaya adalah kebiasaan dan tradisi suatu ... 👘", "daerah", ["angka", "warna", "benda"], "mudah"),
        () => makeQuestion("Alat untuk menggambar adalah ... ✏️", "pensil", ["sendok", "sepatu", "bola"], "mudah"),
        () => makeQuestion("Warna merah ditunjukkan oleh ...", "🔴", ["🔵", "🟢", "⚫"], "mudah"),
        () => makeQuestion("Bentuk segitiga ditunjukkan oleh ...", "🔺", ["⚪", "⬜", "⭐"], "mudah"),
        () => makeQuestion("Bernyanyi menggunakan ... 🎤", "suara", ["kaki", "sepatu", "tas"], "mudah"),
        () => makeQuestion("Tari adalah seni ... 💃", "gerak", ["diam", "angka", "makanan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Menggambar melatih ... ✏️", "kreativitas", ["kemalasan", "mengantuk", "marah"], "sedang"),
        () => makeQuestion("Mewarnai sebaiknya dilakukan dengan ... 🌈", "rapi dan sabar", ["asal-asalan", "merusak kertas", "terburu-buru"], "sedang"),
        () => makeQuestion("Musik adalah seni ... 🎶", "suara", ["gambar", "lari", "makan"], "sedang"),
        () => makeQuestion("Alat musik menghasilkan ... 🎸", "suara", ["warna", "gambar", "bau"], "sedang"),
        () => makeQuestion("Gerak tari harus sesuai ... 🤸", "irama", ["warna", "angka", "ukuran meja"], "sedang"),
        () => makeQuestion("Kerajinan adalah kegiatan membuat ... 🧵", "benda karya", ["keributan", "kesalahan", "sampah saja"], "sedang"),
        () => makeQuestion("Lagu daerah harus ... 🎵", "dilestarikan", ["dilupakan", "diejek", "dirusak"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa seni dan budaya perlu dipelajari? 🌟", "agar kita mengenal dan menghargai budaya", ["agar budaya dilupakan", "agar tidak kreatif", "agar malas belajar"], "sulit"),
        () => makeQuestion("Jika melihat karya teman, sikap yang tepat adalah ... 👏", "menghargai dan memberi pujian", ["mengejek", "merusak", "mencoret"], "sulit"),
        () => makeQuestion("Mengapa mewarnai perlu rapi dan sabar? 🖍️", "agar hasil karya terlihat indah", ["agar gambar rusak", "agar teman sedih", "agar tidak selesai"], "sulit"),
        () => makeQuestion("Budaya daerah perlu dijaga karena ... 👘", "merupakan warisan bangsa", ["tidak penting", "harus dihapus", "membuat kita malas"], "sulit"),
        () => makeQuestion("Ekspresi seni berguna untuk ... 😊", "menunjukkan perasaan", ["menyembunyikan karya", "merusak gambar", "mengejek teman"], "sulit"),
        () => makeQuestion("Contoh melestarikan seni adalah ... 🌟", "belajar tari dan lagu daerah", ["mengejek tarian", "melupakan lagu daerah", "merusak alat musik"], "sulit"),
        () => makeQuestion("Jika ingin membuat kerajinan, sikap yang baik adalah ... 🧵", "teliti, sabar, dan kreatif", ["asal-asalan", "mudah marah", "membuang bahan"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaIndonesiaKelas3(level = "campuran") {
      const mudah = [
        () => makeQuestion("Ide pokok adalah ... 💡", "gagasan utama dalam paragraf", ["tanda baca", "judul buku", "nama tokoh saja"], "mudah"),
        () => makeQuestion("Kalimat utama berisi ... 📝", "ide pokok", ["warna gambar", "nama hari", "jumlah benda"], "mudah"),
        () => makeQuestion("Kalimat tanya diakhiri dengan tanda ... ❓", "?", [".", "!", ","], "mudah"),
        () => makeQuestion("Kalimat perintah digunakan untuk ... ⚠️", "menyuruh melakukan sesuatu", ["bertanya", "bercerita saja", "menghitung"], "mudah"),
        () => makeQuestion("Paragraf adalah kumpulan ... ✍️", "kalimat", ["huruf acak", "angka", "gambar"], "mudah"),
        () => makeQuestion("Puisi menggunakan kata yang ... 🎶", "indah", ["acak", "kasar", "tidak jelas"], "mudah"),
        () => makeQuestion("Sinonim adalah kata yang memiliki arti ... 🔄", "sama atau mirip", ["berlawanan", "tidak punya arti", "angka"], "mudah"),
        () => makeQuestion("Antonim adalah kata yang memiliki arti ... 🔄", "berlawanan", ["sama", "mirip", "kosong"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Membaca lancar berarti membaca dengan ... 📖", "jelas dan memahami isi", ["asal cepat", "tanpa melihat teks", "sambil bermain"], "sedang"),
        () => makeQuestion("Ide pokok biasanya terdapat di ...", "awal atau akhir paragraf", ["hanya di sampul buku", "hanya di gambar", "tidak ada"], "sedang"),
        () => makeQuestion("Kalimat penjelas berfungsi untuk ...", "mendukung kalimat utama", ["menghapus paragraf", "mengganti tanda baca", "membuat bingung"], "sedang"),
        () => makeQuestion("Contoh kata tanya adalah ... ❓", "apa, siapa, kapan, di mana", ["merah, biru, hijau", "satu, dua, tiga", "meja, kursi, buku"], "sedang"),
        () => makeQuestion("Cerita pendek biasanya memiliki ... 📚", "awal, tengah, dan akhir", ["angka saja", "warna saja", "tanda baca saja"], "sedang"),
        () => makeQuestion("Membaca nyaring melatih ... 🔊", "percaya diri", ["kemalasan", "mengantuk", "marah"], "sedang"),
        () => makeQuestion("Kata baku digunakan dalam ... 📘", "tulisan resmi", ["coretan asal", "bahasa kasar", "permainan saja"], "sedang"),
        () => makeQuestion("Menyimak berarti ... 👂", "mendengarkan dengan fokus", ["berteriak", "berlari", "menulis tanpa dengar"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa ide pokok penting dalam paragraf? 💡", "karena menunjukkan inti bacaan", ["karena membuat bacaan hilang", "karena tidak perlu membaca", "karena hanya untuk gambar"], "sulit"),
        () => makeQuestion("Kalimat utama dan kalimat penjelas harus saling ...", "berhubungan", ["bertentangan", "terpisah total", "tidak bermakna"], "sulit"),
        () => makeQuestion("Kalimat tanya yang benar adalah ... ❓", "Di mana kamu tinggal?", ["Di mana kamu tinggal.", "Kamu tinggal di mana", "di Mana Kamu Tinggal."], "sulit"),
        () => makeQuestion("Kalimat perintah yang sopan adalah ... 🙏", "Tolong ambilkan buku itu.", ["Ambil buku itu sekarang!", "Buku ambil tolong.", "Kamu buku ambil?"], "sulit"),
        () => makeQuestion("Sinonim dari pintar adalah ...", "cerdas", ["bodoh", "malas", "lambat"], "sulit"),
        () => makeQuestion("Antonim dari panas adalah ...", "dingin", ["hangat", "api", "terang"], "sulit"),
        () => makeQuestion("Kata baku yang benar adalah ... 📘", "izin", ["ijin", "ijjin", "izen"], "sulit"),
        () => makeQuestion("Saat teman sedang bercerita, sikap yang tepat adalah ... 👂", "menyimak dengan baik", ["memotong pembicaraan", "berteriak", "mengejek cerita"], "sulit"),
        () => makeQuestion("Cerita yang runtut berarti cerita disusun secara ... 🌟", "teratur dari awal sampai akhir", ["acak", "tanpa akhir", "tanpa tokoh"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaJawaKelas3(level = "campuran") {
      const mudah = [
        () => makeQuestion("Basa Jawa yaiku basa daerah sing kudu ... 🗣️", "dijaga", ["dirusak", "dilalekake", "diejek"], "mudah"),
        () => makeQuestion("Unggah-ungguh basa tegese ... 🙏", "tata krama", ["angka", "werna", "dolanan"], "mudah"),
        () => makeQuestion("Tembung aran yaiku tembung kanggo ... 📘", "jeneng barang", ["pakaryan", "kahanan", "swara"], "mudah"),
        () => makeQuestion("Tembung kriya yaiku tembung kanggo ... 🏃", "pakaryan", ["jeneng barang", "werna", "ukuran"], "mudah"),
        () => makeQuestion("Tembung sifat nerangake ... 😊", "kahanan", ["angka", "jeneng barang", "lagu"], "mudah"),
        () => makeQuestion("Ukara yaiku kumpulan tembung sing nduweni ... ✏️", "arti", ["werna", "gambar", "swara"], "mudah"),
        () => makeQuestion("Dongeng yaiku ... 🐉", "cerita rakyat", ["angka Jawa", "alat tulis", "warna"], "mudah"),
        () => makeQuestion("Aksara Jawa yaiku ... 🔤", "tulisan Jawa", ["lagu daerah", "permainan", "makanan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Basa krama digunakake nalika ngomong karo ... 🙏", "wong tuwa utawa guru", ["kanca dolanan", "boneka", "kewan"], "sedang"),
        () => makeQuestion("Basa ngoko biasane digunakake karo ...", "kanca sebaya", ["guru", "wong tuwa", "tamu resmi"], "sedang"),
        () => makeQuestion("Contoh tembung aran yaiku ... 📘", "buku", ["mlaku", "apik", "pinter"], "sedang"),
        () => makeQuestion("Contoh tembung kriya yaiku ... 🏃", "mlaku", ["meja", "gedhe", "abang"], "sedang"),
        () => makeQuestion("Contoh tembung sifat yaiku ... 😊", "apik", ["mangan", "buku", "kursi"], "sedang"),
        () => makeQuestion("Ukara sing bener yaiku ... ✏️", "Aku sinau.", ["Sinau aku.", "Aku.", "Buku mlaku apik."], "sedang"),
        () => makeQuestion("Dongeng biasane nduweni ... 🐉", "pesan moral", ["nomor telepon", "harga barang", "aturan matematika"], "sedang"),
        () => makeQuestion("Paribasan yaiku ungkapan sing nduweni ... 📜", "arti khusus", ["gambar", "warna", "swara"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa unggah-ungguh penting nalika ngomong? 🙏", "supaya sopan lan ngurmati wong liya", ["supaya bisa ngece", "supaya ribut", "supaya ora sinau"], "sulit"),
        () => makeQuestion("Yen ngomong karo guru, basa sing luwih trep yaiku ...", "basa krama", ["basa kasar", "teriakan", "diam saja"], "sulit"),
        () => makeQuestion("Ukara ngoko 'Aku lunga' yen luwih sopan bisa dadi ...", "Kula tindak", ["Aku mangan", "Kowe lunga", "Balon abang"], "sulit"),
        () => makeQuestion("Mengapa tulisan kudu rapi? ✍️", "supaya gampang diwaca", ["supaya angel diwaca", "supaya ilang", "supaya ora rampung"], "sulit"),
        () => makeQuestion("Sawise maca teks, kita kudu bisa ... 📖", "ngerti isi teks", ["ngrusak buku", "lali kabeh", "ngece kanca"], "sulit"),
        () => makeQuestion("Paribasan 'alon-alon waton kelakon' ngajari supaya ... 📜", "sabar lan ati-ati", ["grusa-grusu", "males", "ngece"], "sulit"),
        () => makeQuestion("Nguri-uri budaya Jawa tegese ... 🌟", "njaga lan melestarikan budaya Jawa", ["nglalekake budaya", "ngece budaya", "ora gelem sinau"], "sulit"),
        () => makeQuestion("Sikap sing apik nalika kanca nyritakake pengalaman yaiku ... 👂", "ngrungokake kanthi sopan", ["motong omongan", "ngguyu ngece", "mlayu"], "sulit"),
        () => makeQuestion("Aksara Jawa kudu dijaga amarga ... 🔤", "kalebu warisan budaya", ["ora penting", "kudu dilalekake", "mung kanggo dolanan"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateMatematikaKelas3(level = "campuran") {
      const mudah = [
        () => makeQuestion("Bilangan kelas 3 dapat sampai ... 🔢", "10.000", ["100", "500", "1.000"], "mudah"),
        () => makeQuestion("Nilai tempat pada 2.345, angka 2 bernilai ... 🧮", "ribuan", ["ratusan", "puluhan", "satuan"], "mudah"),
        () => makeQuestion("12 + 5 = ... ➕", "17", ["15", "16", "18"], "mudah"),
        () => makeQuestion("10 - 5 = ... ➖", "5", ["4", "6", "7"], "mudah"),
        () => makeQuestion("2 × 3 = ... ✖️", "6", ["5", "7", "8"], "mudah"),
        () => makeQuestion("10 ÷ 2 = ... ➗", "5", ["2", "4", "6"], "mudah"),
        () => makeQuestion("1/2 artinya ... 🍰", "setengah", ["satu penuh", "seperempat", "tiga bagian"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("567 memiliki angka 5 pada nilai tempat ... 🧮", "ratusan", ["ribuan", "puluhan", "satuan"], "sedang"),
        () => makeQuestion("34 + 21 = ... ➕", "55", ["45", "65", "54"], "sedang"),
        () => makeQuestion("100 - 40 = ... ➖", "60", ["50", "70", "80"], "sedang"),
        () => makeQuestion("4 × 5 = ... ✖️", "20", ["15", "25", "30"], "sedang"),
        () => makeQuestion("20 ÷ 4 = ... ➗", "5", ["4", "6", "8"], "sedang"),
        () => makeQuestion("Bangun datar contohnya adalah ... 🔷", "persegi, segitiga, lingkaran", ["kubus, balok, bola", "kg, cm, meter", "jam, menit, detik"], "sedang"),
        () => makeQuestion("60 menit sama dengan ... ⏰", "1 jam", ["1 hari", "30 menit", "2 jam"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("3 × 4 artinya ... ✖️", "4 + 4 + 4", ["3 + 4", "4 - 3", "3 ÷ 4"], "sulit"),
        () => makeQuestion("Pembagian digunakan untuk ... ➗", "membagi sama rata", ["menambah terus", "mengurangi warna", "mengukur panjang"], "sulit"),
        () => makeQuestion("Keliling persegi dengan sisi 4 adalah ... 📏", "16", ["8", "12", "20"], "sulit"),
        () => makeQuestion("Luas persegi dengan sisi 5 adalah ... 🟦", "25", ["10", "15", "20"], "sulit"),
        () => makeQuestion("Alat untuk mengukur panjang adalah ... 📏", "penggaris", ["timbangan", "jam", "uang"], "sulit"),
        () => makeQuestion("Berat beras biasanya diukur dengan satuan ... ⚖️", "kilogram", ["centimeter", "jam", "rupiah"], "sulit"),
        () => makeQuestion("Uang digunakan untuk ... 💰", "membeli barang", ["mengukur panjang", "menimbang benda", "mengukur waktu"], "sulit"),
        () => makeQuestion("Data adalah ... 📊", "kumpulan informasi", ["alat ukur", "nama bangun", "jenis uang"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePancasilaKelas3(level = "campuran") {
      const mudah = [
        () => makeQuestion("Pancasila adalah pedoman hidup bangsa ... 🇮🇩", "Indonesia", ["Jepang", "Malaysia", "Australia"], "mudah"),
        () => makeQuestion("Sila pertama berbunyi ... 🙏", "Ketuhanan Yang Maha Esa", ["Persatuan Indonesia", "Keadilan sosial", "Kemanusiaan"], "mudah"),
        () => makeQuestion("Sila kedua mengajarkan kita untuk ... 🤝", "menghargai sesama manusia", ["menyakiti teman", "berbohong", "curang"], "mudah"),
        () => makeQuestion("Sila ketiga berbunyi ... 🇮🇩", "Persatuan Indonesia", ["Ketuhanan Yang Maha Esa", "Keadilan sosial", "Musyawarah"], "mudah"),
        () => makeQuestion("Hak adalah sesuatu yang kita ... ⚖️", "terima", ["buang", "abaikan", "rusak"], "mudah"),
        () => makeQuestion("Kewajiban adalah sesuatu yang harus kita ... ✅", "lakukan", ["hindari", "lupakan", "tinggalkan"], "mudah"),
        () => makeQuestion("Disiplin berarti ... ⏰", "patuh aturan", ["melanggar aturan", "datang terlambat", "malas"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Sila keempat mengajarkan kita untuk ... 🗳️", "bermusyawarah", ["memaksa kehendak", "bertengkar", "menang sendiri"], "sedang"),
        () => makeQuestion("Sila kelima mengajarkan kita untuk bersikap ... ⚖️", "adil", ["curang", "pilih kasih", "egois"], "sedang"),
        () => makeQuestion("Aturan sekolah dibuat agar kegiatan belajar menjadi ... 🏫", "tertib", ["ribut", "kacau", "berantakan"], "sedang"),
        () => makeQuestion("Kerja sama membuat pekerjaan menjadi ... 🤝", "lebih mudah", ["lebih berat", "tidak selesai", "membingungkan"], "sedang"),
        () => makeQuestion("Tanggung jawab berarti ... 🎯", "menyelesaikan tugas dengan baik", ["lari dari tugas", "menyalahkan orang lain", "malas"], "sedang"),
        () => makeQuestion("Cinta tanah air dapat dilakukan dengan ... 🇮🇩", "mengikuti upacara dengan tertib", ["merusak lingkungan", "mengejek budaya", "malas belajar"], "sedang"),
        () => makeQuestion("Hidup rukun berarti hidup ... 🤗", "damai dan saling menghargai", ["bertengkar", "bermusuhan", "mengejek"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Jika teman berbeda agama sedang beribadah, sikap yang tepat adalah ... 🙏", "menghormati dan tidak mengganggu", ["mengejek", "mengganggu", "berisik"], "sulit"),
        () => makeQuestion("Jika ada tugas kelompok, sikap yang sesuai Pancasila adalah ... 🤝", "bekerja sama dengan teman", ["diam saja", "menyuruh teman semua", "pergi bermain"], "sulit"),
        () => makeQuestion("Jika keputusan musyawarah berbeda dengan pilihanmu, kamu sebaiknya ... 🗳️", "menerima keputusan bersama", ["marah", "memaksa teman", "meninggalkan kelompok"], "sulit"),
        () => makeQuestion("Contoh sikap adil saat bermain adalah ... ⚖️", "bergantian dan tidak curang", ["merebut giliran", "ingin menang sendiri", "curang"], "sulit"),
        () => makeQuestion("Mengapa hak dan kewajiban harus seimbang?", "agar kehidupan menjadi tertib dan adil", ["agar bisa meminta hak saja", "agar kewajiban diabaikan", "agar aturan tidak perlu ditaati"], "sulit"),
        () => makeQuestion("Jika melihat kelas kotor, sikap bertanggung jawab adalah ... 🧹", "ikut membersihkan kelas", ["membiarkan saja", "menambah sampah", "menyalahkan teman"], "sulit"),
        () => makeQuestion("Mengapa kita harus cinta tanah air? 🇮🇩", "karena Indonesia adalah negara kita yang harus dijaga", ["agar bisa merusak budaya", "agar tidak perlu belajar", "agar boleh mengejek simbol negara"], "sulit"),
        () => makeQuestion("Sikap yang mencerminkan nilai Pancasila sehari-hari adalah ... 🌟", "jujur, sopan, rajin, dan bertanggung jawab", ["bohong, curang, dan malas", "mengejek teman", "melanggar aturan"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePJOKKelas3(level = "campuran") {
      const mudah = [
        () => makeQuestion("PJOK membantu tubuh menjadi ... 💪", "sehat dan kuat", ["lemah", "malas", "mudah sakit"], "mudah"),
        () => makeQuestion("Gerak lokomotor adalah gerakan yang ... 🚶", "berpindah tempat", ["diam di tempat", "hanya tidur", "tanpa bergerak"], "mudah"),
        () => makeQuestion("Contoh gerak lokomotor adalah ... 🏃", "berlari", ["membungkuk", "memutar badan", "mengayun tangan"], "mudah"),
        () => makeQuestion("Gerak non lokomotor dilakukan ... 🤸", "tanpa berpindah tempat", ["sambil berlari jauh", "dengan tidur", "di dalam air saja"], "mudah"),
        () => makeQuestion("Gerak manipulatif menggunakan ... ⚽", "alat atau benda", ["warna", "suara", "angka"], "mudah"),
        () => makeQuestion("Contoh gerak manipulatif adalah ... ⚾", "melempar bola", ["tidur", "diam", "duduk saja"], "mudah"),
        () => makeQuestion("Sportif berarti bermain dengan ... 🏆", "jujur", ["curang", "marah", "mengejek"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Berjalan dan berlari berguna untuk melatih ... 🏃", "kebugaran tubuh", ["kemalasan", "mengantuk", "berdiam diri"], "sedang"),
        () => makeQuestion("Melompat melatih kekuatan ... 🐸", "kaki", ["rambut", "telinga", "mata saja"], "sedang"),
        () => makeQuestion("Senam membuat tubuh menjadi ... 🤸", "lentur dan sehat", ["kaku", "malas", "lemah"], "sedang"),
        () => makeQuestion("Permainan bola melatih ... ⚽", "kerja sama", ["egois", "curang", "bertengkar"], "sedang"),
        () => makeQuestion("Kebugaran jasmani artinya kondisi tubuh yang ... 💪", "sehat dan mudah bergerak", ["selalu lelah", "tidak bergerak", "mudah sakit"], "sedang"),
        () => makeQuestion("Pola hidup sehat dilakukan dengan ... 🍎", "makan sehat dan olahraga", ["makan permen terus", "tidak tidur", "tidak mandi"], "sedang"),
        () => makeQuestion("Keselamatan olahraga berarti kita harus ... 🛑", "berhati-hati dan mengikuti aturan", ["ceroboh", "mendorong teman", "bermain kasar"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa pemanasan dan gerakan ringan penting sebelum olahraga?", "agar tubuh siap dan mengurangi risiko cedera", ["agar tubuh makin kaku", "agar cepat lelah", "agar tidak perlu olahraga"], "sulit"),
        () => makeQuestion("Jika bermain dalam tim, sikap yang benar adalah ... 🤝", "bekerja sama dan tidak egois", ["ingin menang sendiri", "tidak mau berbagi bola", "mengejek teman"], "sulit"),
        () => makeQuestion("Jika kalah dalam permainan, sikap sportif adalah ... 🏆", "menerima hasil dan tetap menghargai lawan", ["marah", "menyalahkan teman", "curang di permainan berikutnya"], "sulit"),
        () => makeQuestion("Mengapa kita harus memakai sepatu saat olahraga? 👟", "agar kaki lebih aman", ["agar mudah terpeleset", "agar kaki sakit", "agar olahraga berbahaya"], "sulit"),
        () => makeQuestion("Jika teman jatuh saat bermain, sikap yang tepat adalah ... 🤝", "menolong dan memberi tahu guru", ["menertawakan", "meninggalkan", "mendorong lagi"], "sulit"),
        () => makeQuestion("Mengapa tubuh perlu istirahat setelah banyak bergerak? 😴", "agar tubuh pulih dan segar kembali", ["agar makin lelah", "agar sakit", "agar tidak bisa belajar"], "sulit"),
        () => makeQuestion("Contoh kebiasaan sehat setiap hari adalah ... 🌟", "olahraga, makan bergizi, tidur cukup, dan menjaga kebersihan", ["begadang, tidak mandi, dan makan permen terus", "bermain tanpa aturan", "tidak pernah bergerak"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateSeniBudayaKelas3(level = "campuran") {
      const mudah = [
        () => makeQuestion("Seni adalah hasil karya manusia yang ... 🎨", "indah", ["kotor", "rusak", "asal-asalan"], "mudah"),
        () => makeQuestion("Contoh seni rupa adalah ... 🖌️", "menggambar", ["berlari", "menghitung", "tidur"], "mudah"),
        () => makeQuestion("Unsur seni rupa antara lain ...", "garis, warna, dan bentuk", ["angka, uang, waktu", "lari, lompat, lempar", "makan, minum, tidur"], "mudah"),
        () => makeQuestion("Alat untuk menggambar adalah ... ✏️", "pensil", ["sepatu", "sendok", "bola"], "mudah"),
        () => makeQuestion("Warna merah ditunjukkan oleh ...", "🔴", ["🔵", "🟢", "⚫"], "mudah"),
        () => makeQuestion("Musik adalah bunyi yang ... 🎶", "indah", ["rusak", "kotor", "tidak terdengar"], "mudah"),
        () => makeQuestion("Tari adalah seni ... 💃", "gerak", ["diam", "angka", "makanan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Kolase adalah karya seni dengan cara ... ✂️", "menempel bahan", ["berlari cepat", "menghitung uang", "membaca jam"], "sedang"),
        () => makeQuestion("Kerajinan tangan dibuat menggunakan ... 🧶", "tangan dan kreativitas", ["mesin tidur", "suara keras", "angka saja"], "sedang"),
        () => makeQuestion("Alat musik digunakan untuk menghasilkan ... 🎸", "suara", ["warna", "gambar", "bau"], "sedang"),
        () => makeQuestion("Irama dalam musik berarti ... 🎶", "ketukan", ["warna", "bentuk", "ukuran"], "sedang"),
        () => makeQuestion("Tempo adalah ... ⏱️", "cepat atau lambatnya musik", ["tinggi rendah meja", "besar kecil gambar", "panjang pendek pensil"], "sedang"),
        () => makeQuestion("Gerak tari harus mengikuti ... 🕺", "irama musik", ["harga barang", "warna baju", "angka"], "sedang"),
        () => makeQuestion("Apresiasi seni berarti ... 👏", "menghargai karya seni", ["merusak karya", "mengejek karya", "mencoret karya"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa unsur seni rupa penting dalam gambar? 🖌️", "karena membantu membuat karya lebih indah dan jelas", ["agar gambar rusak", "agar karya tidak selesai", "agar warna hilang"], "sulit"),
        () => makeQuestion("Jika melihat karya teman, sikap yang tepat adalah ... 👏", "menghargai dan memberi pujian", ["mengejek", "merusak", "mencoret"], "sulit"),
        () => makeQuestion("Mengapa budaya daerah harus dilestarikan? 🏝️", "karena budaya adalah identitas dan warisan bangsa", ["karena harus dilupakan", "karena tidak penting", "karena boleh diejek"], "sulit"),
        () => makeQuestion("Kreativitas dalam seni berguna untuk ... 🌟", "membuat karya yang unik dan menarik", ["meniru tanpa mencoba", "merusak karya", "membuat teman sedih"], "sulit"),
        () => makeQuestion("Jika membuat kolase dari daun kering, bahan yang digunakan termasuk ... 🍂", "bahan alam", ["alat elektronik", "makanan matang", "uang"], "sulit"),
        () => makeQuestion("Mengapa tempo penting saat menari? 💃", "agar gerakan sesuai dengan musik", ["agar gerakan acak", "agar tidak perlu mendengar lagu", "agar tari berhenti"], "sulit"),
        () => makeQuestion("Berkarya seni sebaiknya dilakukan dengan ... 🎭", "percaya diri, sabar, dan kreatif", ["takut salah", "mudah menyerah", "mengejek teman"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaIndonesiaKelas4(level = "campuran") {
      const mudah = [
        () => makeQuestion("Teks narasi adalah teks yang berisi ... 📖", "rangkaian peristiwa", ["daftar harga", "rumus hitung", "ukuran benda"], "mudah"),
        () => makeQuestion("Ide pokok adalah ... 💡", "inti paragraf", ["judul buku", "nama tokoh", "tanda baca"], "mudah"),
        () => makeQuestion("Teks deskripsi digunakan untuk ... 🏞️", "menggambarkan objek", ["menghitung angka", "membagi uang", "menyanyi"], "mudah"),
        () => makeQuestion("Teks petunjuk berisi ... 📝", "langkah melakukan sesuatu", ["cerita khayalan", "daftar nama", "lawan kata"], "mudah"),
        () => makeQuestion("Puisi menggunakan kata-kata yang ... 🎶", "indah", ["acak", "kasar", "tidak jelas"], "mudah"),
        () => makeQuestion("Dongeng biasanya memiliki ... 🐉", "pesan moral", ["harga barang", "rumus luas", "jadwal kereta"], "mudah"),
        () => makeQuestion("Sinonim adalah ... 🔄", "persamaan kata", ["lawan kata", "tanda baca", "kalimat tanya"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Gagasan pendukung berfungsi untuk ...", "menjelaskan ide pokok", ["menghapus paragraf", "mengganti judul", "membuat tulisan acak"], "sedang"),
        () => makeQuestion("Narasi biasanya memiliki unsur ... 📖", "tokoh, tempat, waktu, dan alur", ["angka, uang, dan berat", "warna, garis, dan bentuk", "sisi, sudut, dan luas"], "sedang"),
        () => makeQuestion("Kalimat efektif adalah kalimat yang ... ✍️", "singkat, jelas, dan mudah dipahami", ["panjang dan membingungkan", "tanpa makna", "selalu memakai kata berulang"], "sedang"),
        () => makeQuestion("Kata baku digunakan dalam ... 📘", "bahasa resmi", ["bahasa asal-asalan", "candaan saja", "coretan bebas"], "sedang"),
        () => makeQuestion("Wawancara dilakukan untuk ... 🎤", "memperoleh informasi", ["membuat gambar", "mengukur benda", "menghafal angka"], "sedang"),
        () => makeQuestion("Ringkasan bacaan berisi ... 📚", "inti informasi", ["semua kalimat asli", "gambar saja", "judul tanpa isi"], "sedang"),
        () => makeQuestion("Pantun memiliki bagian ... 🎭", "sampiran dan isi", ["awal dan harga", "judul dan alamat", "angka dan warna"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa teks petunjuk harus runtut? 📝", "agar langkah mudah diikuti", ["agar pembaca bingung", "agar urutan acak", "agar tidak selesai"], "sulit"),
        () => makeQuestion("Kalimat efektif yang benar adalah ...", "Ani membaca buku di perpustakaan.", ["Ani membaca membaca buku.", "Buku Ani di membaca.", "Ani buku perpustakaan membaca."], "sulit"),
        () => makeQuestion("Kata baku yang benar adalah ... 📘", "praktik", ["praktek", "peraktek", "prakteq"], "sulit"),
        () => makeQuestion("Antonim dari cepat adalah ... 🔄", "lambat", ["laju", "segera", "kencang"], "sulit"),
        () => makeQuestion("Jika ingin melakukan wawancara, sikap yang tepat adalah ... 🎤", "bertanya dengan sopan dan jelas", ["memotong jawaban", "berteriak", "menertawakan narasumber"], "sulit"),
        () => makeQuestion("Ringkasan yang baik harus ditulis dengan ... 📚", "kalimat sendiri dan berisi inti bacaan", ["menyalin semua teks", "menghapus isi penting", "menambah cerita palsu"], "sulit"),
        () => makeQuestion("Pantun nasihat biasanya bertujuan untuk ... 🌟", "memberi pesan baik", ["mengejek teman", "membuat bingung", "menghapus cerita"], "sulit"),
        () => makeQuestion("Saat presentasi di depan kelas, sikap yang tepat adalah ... 🗣️", "percaya diri dan berbicara jelas", ["menunduk terus", "berbicara sangat pelan", "bercanda terus"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaJawaKelas4(level = "campuran") {
      const mudah = [
        () => makeQuestion("Basa Jawa iku warisan budaya sing kudu ... 🗣️", "dijaga", ["dirusak", "dilalekake", "diejek"], "mudah"),
        () => makeQuestion("Unggah-ungguh basa yaiku ... 🙏", "tata krama nalika ngomong", ["angka", "werna", "dolanan"], "mudah"),
        () => makeQuestion("Tembung aran yaiku tembung kanggo ... 📘", "jeneng barang, kewan, utawa wong", ["pakaryan", "kahanan", "swara"], "mudah"),
        () => makeQuestion("Tembung kriya nuduhake ... 🏃", "pakaryan utawa kegiatan", ["barang", "werna", "ukuran"], "mudah"),
        () => makeQuestion("Tembung sifat nerangake ... 😊", "sifat utawa kahanan", ["angka", "jeneng barang", "lagu"], "mudah"),
        () => makeQuestion("Aksara Jawa yaiku ... 🔤", "tulisan tradisional Jawa", ["lagu dolanan", "panganan", "dolanan bocah"], "mudah"),
        () => makeQuestion("Tembang dolanan yaiku ... 🎶", "lagu dolanan anak", ["angka Jawa", "alat tulis", "warna"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Basa krama luwih trep digunakake marang ... 🙏", "wong tuwa utawa guru", ["kanca sebaya", "boneka", "kewan"], "sedang"),
        () => makeQuestion("Basa ngoko biasane digunakake marang ...", "kanca sebaya", ["guru", "wong tuwa", "tamu resmi"], "sedang"),
        () => makeQuestion("Contoh tembung aran yaiku ... 📘", "buku", ["mlaku", "apik", "pinter"], "sedang"),
        () => makeQuestion("Contoh tembung kriya yaiku ... 🏃", "sinau", ["meja", "gedhe", "abang"], "sedang"),
        () => makeQuestion("Contoh tembung sifat yaiku ... 😊", "pinter", ["mangan", "buku", "kursi"], "sedang"),
        () => makeQuestion("Ukara sing runtut yaiku ... ✍️", "Aku sinau basa Jawa.", ["Sinau aku Jawa basa.", "Basa aku.", "Buku mlaku apik."], "sedang"),
        () => makeQuestion("Dongeng Jawa biasane nduweni ... 🐉", "pesan moral", ["nomor telepon", "harga barang", "aturan matematika"], "sedang"),
        () => makeQuestion("Paribasan yaiku ungkapan sing nduweni ... 📜", "makna khusus", ["gambar", "warna", "swara"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa unggah-ungguh basa penting? 🙏", "supaya komunikasi sopan lan ngajeni wong liya", ["supaya bisa ngece", "supaya ribut", "supaya ora sinau"], "sulit"),
        () => makeQuestion("Ukara ngoko 'Aku lunga' yen digawe luwih sopan bisa dadi ...", "Kula tindak", ["Aku mangan", "Kowe lunga", "Balon abang"], "sulit"),
        () => makeQuestion("Mengapa crita kudu ditulis runtut? ✏️", "supaya gampang dimangerteni", ["supaya angel diwaca", "supaya ilang", "supaya ora rampung"], "sulit"),
        () => makeQuestion("Sawise maca crita, kita kudu bisa ... 📖", "ngerti isi lan pesen crita", ["ngrusak buku", "lali kabeh", "ngece kanca"], "sulit"),
        () => makeQuestion("Paribasan 'alon-alon waton kelakon' ngajari supaya ... 📜", "sabar lan ati-ati", ["grusa-grusu", "males", "ngece"], "sulit"),
        () => makeQuestion("Nguri-uri budaya Jawa tegese ... 🌟", "njaga lan melestarikan budaya Jawa", ["nglalekake budaya", "ngece budaya", "ora gelem sinau"], "sulit"),
        () => makeQuestion("Aksara Jawa kudu dijaga amarga ... 🔤", "kalebu warisan budaya", ["ora penting", "kudu dilalekake", "mung kanggo dolanan"], "sulit"),
        () => makeQuestion("Sikap sing apik nalika kanca nyritakake pengalaman yaiku ... 👂", "ngrungokake kanthi sopan", ["motong omongan", "ngguyu ngece", "mlayu"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateIPASKelas4(level = "campuran") {
      const mudah = [
        () => makeQuestion("IPAS mempelajari tentang ... 🌍", "alam dan kehidupan sosial", ["musik dan tari", "angka saja", "olahraga saja"], "mudah"),
        () => makeQuestion("Makhluk hidup contohnya adalah ... 🌱", "manusia, hewan, dan tumbuhan", ["batu, meja, kursi", "air, awan, pasir", "pensil, buku, tas"], "mudah"),
        () => makeQuestion("Makhluk hidup membutuhkan ... 💧", "makanan, air, dan udara", ["mainan saja", "batu dan pasir", "televisi saja"], "mudah"),
        () => makeQuestion("Habitat adalah ... 🐘", "tempat tinggal makhluk hidup", ["alat tulis", "nama makanan", "jenis warna"], "mudah"),
        () => makeQuestion("Bagian tumbuhan yang menyerap air adalah ... 🌿", "akar", ["bunga", "buah", "daun"], "mudah"),
        () => makeQuestion("Sumber energi utama bagi bumi adalah ... ☀️", "matahari", ["sepatu", "meja", "buku"], "mudah"),
        () => makeQuestion("Cuaca hujan ditunjukkan oleh ...", "🌧️", ["☀️", "🔥", "⭐"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Rantai makanan menunjukkan hubungan ... 🍎", "makan dan dimakan", ["bermain dan tidur", "menulis dan membaca", "membeli dan menjual saja"], "sedang"),
        () => makeQuestion("Gaya adalah ... 🚲", "dorongan atau tarikan", ["warna benda", "nama tempat", "jenis makanan"], "sedang"),
        () => makeQuestion("Gaya dapat membuat benda ... ⚽", "bergerak", ["hilang", "bernyanyi", "menjadi makanan"], "sedang"),
        () => makeQuestion("Cuaca adalah keadaan udara yang dapat ... ☁️", "berubah setiap hari", ["selalu sama", "tidak pernah berubah", "hanya ada malam"], "sedang"),
        () => makeQuestion("Kenampakan alam contohnya adalah ... ⛰️", "gunung, sungai, dan pantai", ["kursi, meja, lemari", "pensil, buku, tas", "telepon, televisi, radio"], "sedang"),
        () => makeQuestion("Kegiatan ekonomi dilakukan untuk ... 💰", "memenuhi kebutuhan", ["merusak lingkungan", "membuat orang malas", "menghilangkan budaya"], "sedang"),
        () => makeQuestion("Teknologi sebaiknya digunakan dengan ... 📱", "bijak", ["sembarangan", "berlebihan terus", "untuk mengganggu"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa makhluk hidup membutuhkan air? 💧", "agar dapat bertahan hidup", ["agar menjadi batu", "agar tidak tumbuh", "agar tidak bernapas"], "sulit"),
        () => makeQuestion("Mengapa habitat penting bagi hewan? 🐘", "karena menjadi tempat hidup dan mencari makanan", ["karena tempat bermain manusia saja", "karena tidak dibutuhkan", "karena membuat hewan hilang"], "sulit"),
        () => makeQuestion("Jika rantai makanan rusak, akibatnya adalah ... 🍎", "keseimbangan alam terganggu", ["semua hewan selalu kenyang", "tumbuhan tidak penting", "alam menjadi lebih aman pasti"], "sulit"),
        () => makeQuestion("Contoh pengaruh gaya dalam kehidupan sehari-hari adalah ... 🚲", "menendang bola hingga bergerak", ["melihat warna langit", "mendengar lagu", "membaca buku diam"], "sulit"),
        () => makeQuestion("Mengapa budaya Indonesia harus dijaga? 🎭", "karena budaya adalah kekayaan bangsa", ["karena harus dilupakan", "karena tidak berguna", "karena boleh diejek"], "sulit"),
        () => makeQuestion("Contoh kegiatan produksi adalah ... 🌾", "petani menanam padi", ["anak membeli roti", "keluarga makan nasi", "siswa membaca buku"], "sulit"),
        () => makeQuestion("Jika lingkungan kotor, akibatnya adalah ... 🌳", "dapat menimbulkan penyakit", ["udara selalu segar", "semua orang sehat", "sampah hilang sendiri"], "sulit"),
        () => makeQuestion("Sikap baik dalam masyarakat adalah ... 🤝", "gotong royong dan saling menghormati", ["bertengkar", "membuang sampah sembarangan", "mengganggu tetangga"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateMatematikaKelas4(level = "campuran") {
      const mudah = [
        () => makeQuestion("Bilangan cacah dimulai dari angka ... 🔢", "0", ["1", "-1", "10"], "mudah"),
        () => makeQuestion("Nilai tempat angka 5 pada bilangan 345 adalah ... 🧮", "satuan", ["puluhan", "ratusan", "ribuan"], "mudah"),
        () => makeQuestion("125 + 240 = ... ➕", "365", ["355", "375", "345"], "mudah"),
        () => makeQuestion("500 - 245 = ... ➖", "255", ["245", "265", "355"], "mudah"),
        () => makeQuestion("6 × 3 = ... ✖️", "18", ["12", "15", "24"], "mudah"),
        () => makeQuestion("20 ÷ 5 = ... ➗", "4", ["5", "6", "3"], "mudah"),
        () => makeQuestion("Contoh bangun datar adalah ... 📐", "persegi", ["bola", "tabung", "kubus"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Nilai tempat angka 4 pada bilangan 4.321 adalah ... 🧮", "ribuan", ["ratusan", "puluhan", "satuan"], "sedang"),
        () => makeQuestion("245 + 123 = ... ➕", "368", ["358", "378", "388"], "sedang"),
        () => makeQuestion("600 - 355 = ... ➖", "245", ["255", "235", "345"], "sedang"),
        () => makeQuestion("7 × 8 = ... ✖️", "56", ["48", "54", "64"], "sedang"),
        () => makeQuestion("36 ÷ 4 = ... ➗", "9", ["8", "7", "6"], "sedang"),
        () => makeQuestion("Kelipatan 5 yang benar adalah ... 🔄", "5, 10, 15", ["1, 2, 3", "2, 4, 6", "3, 6, 9"], "sedang"),
        () => makeQuestion("Pecahan yang menunjukkan setengah adalah ... 🍰", "1/2", ["1/3", "2/5", "3/4"], "sedang"),
        () => makeQuestion("Bangun datar yang memiliki 4 sisi sama panjang adalah ... ⬜", "persegi", ["segitiga", "lingkaran", "trapesium"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Keliling persegi dengan sisi 8 cm adalah ... 📏", "32 cm", ["16 cm", "24 cm", "64 cm"], "sulit"),
        () => makeQuestion("Luas persegi panjang dengan panjang 10 cm dan lebar 5 cm adalah ... 📦", "50 cm²", ["15 cm²", "25 cm²", "100 cm²"], "sulit"),
        () => makeQuestion("Pecahan senilai dari 1/2 adalah ... 🟰", "2/4", ["2/3", "3/5", "1/3"], "sulit"),
        () => makeQuestion("Faktor dari 12 adalah ... 🔄", "1, 2, 3, 4, 6, 12", ["2, 4, 6, 8", "3, 6, 9", "1, 5, 10"], "sulit"),
        () => makeQuestion("2 jam sama dengan ... ⏰", "120 menit", ["60 menit", "90 menit", "240 menit"], "sulit"),
        () => makeQuestion("Satuan panjang yang paling tepat untuk mengukur jalan antar kota adalah ... 📏", "kilometer", ["sentimeter", "meter kecil", "milimeter"], "sulit"),
        () => makeQuestion("Diagram digunakan untuk ... 📊", "menyajikan data agar mudah dibaca", ["menghapus data", "menggambar rumah", "mengukur berat"], "sulit"),
        () => makeQuestion("Jika 1/2 bagian pizza dimakan, artinya pizza dimakan sebanyak ... 🍕", "setengah bagian", ["seluruh bagian", "seperempat", "dua bagian penuh"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePancasilaKelas4(level = "campuran") {
      const mudah = [
        () => makeQuestion("Pancasila adalah dasar negara ... 🇮🇩", "Indonesia", ["Malaysia", "Jepang", "Australia"], "mudah"),
        () => makeQuestion("Lambang negara Indonesia adalah ... 🦅", "Garuda Pancasila", ["Harimau", "Merpati", "Kuda"], "mudah"),
        () => makeQuestion("Simbol sila pertama adalah ... ⭐", "bintang", ["rantai", "pohon beringin", "kepala banteng"], "mudah"),
        () => makeQuestion("Sila pertama mengajarkan kita untuk ... 🙏", "percaya kepada Tuhan", ["bertengkar", "curang", "mengejek"], "mudah"),
        () => makeQuestion("Hak adalah sesuatu yang kita ... 📚", "terima", ["rusak", "buang", "abaikan"], "mudah"),
        () => makeQuestion("Kewajiban adalah sesuatu yang harus kita ... ✅", "lakukan", ["hindari", "lupakan", "tinggalkan"], "mudah"),
        () => makeQuestion("Aturan dibuat agar kehidupan menjadi ... 🏠", "tertib", ["kacau", "ribut", "berantakan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Sila kedua mengajarkan kita untuk ... ❤️", "menghargai sesama manusia", ["menyakiti teman", "membully", "mengambil barang"], "sedang"),
        () => makeQuestion("Sila ketiga mengajarkan kita untuk menjaga ... 🤝", "persatuan", ["pertengkaran", "permusuhan", "kecurangan"], "sedang"),
        () => makeQuestion("Sila keempat mengajarkan kita untuk ... 🗳️", "bermusyawarah", ["memaksakan kehendak", "menang sendiri", "bertengkar"], "sedang"),
        () => makeQuestion("Sila kelima mengajarkan kita untuk bersikap ... ⚖️", "adil", ["curang", "pilih kasih", "egois"], "sedang"),
        () => makeQuestion("Kerja sama membuat pekerjaan menjadi ... 🤝", "lebih ringan", ["lebih berat", "tidak selesai", "berantakan"], "sedang"),
        () => makeQuestion("Keberagaman Indonesia meliputi ... 🌏", "suku, budaya, bahasa, dan agama", ["angka, rumus, dan garis", "uang, berat, dan panjang", "warna saja"], "sedang"),
        () => makeQuestion("Cinta tanah air dapat dilakukan dengan ... 🇮🇩", "mengikuti upacara dengan tertib", ["merusak lingkungan", "mengejek budaya", "malas belajar"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Jika teman berbeda agama sedang beribadah, sikap yang tepat adalah ... 🙏", "menghormati dan tidak mengganggu", ["mengejek", "mengganggu", "berisik"], "sulit"),
        () => makeQuestion("Jika keputusan musyawarah berbeda dengan pilihanmu, kamu sebaiknya ... 🗳️", "menerima keputusan bersama", ["marah", "memaksa teman", "meninggalkan kelompok"], "sulit"),
        () => makeQuestion("Contoh sikap adil saat bermain adalah ... ⚖️", "bergantian dan tidak curang", ["merebut giliran", "ingin menang sendiri", "curang"], "sulit"),
        () => makeQuestion("Mengapa hak dan kewajiban harus seimbang?", "agar kehidupan menjadi tertib dan adil", ["agar hanya meminta hak", "agar kewajiban diabaikan", "agar aturan tidak berlaku"], "sulit"),
        () => makeQuestion("Jika kelas kotor, sikap bertanggung jawab adalah ... 🧹", "ikut membersihkan kelas", ["membiarkan saja", "menambah sampah", "menyalahkan teman"], "sulit"),
        () => makeQuestion("Mengapa keberagaman harus dihargai? 🌏", "agar hidup rukun dan persatuan terjaga", ["agar bisa mengejek", "agar teman takut", "agar sering bertengkar"], "sulit"),
        () => makeQuestion("Contoh menjadi warga negara yang baik adalah ... 🌟", "mematuhi aturan dan menghormati orang lain", ["melanggar aturan", "membuang sampah sembarangan", "mengejek teman"], "sulit"),
        () => makeQuestion("Mengapa Garuda Pancasila penting bagi Indonesia? 🦅", "karena menjadi lambang negara dan simbol nilai Pancasila", ["karena hanya gambar biasa", "karena untuk hiasan saja", "karena tidak memiliki makna"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePJOKKelas4(level = "campuran") {
      const mudah = [
        () => makeQuestion("PJOK membantu tubuh menjadi ... 🏃", "sehat dan bugar", ["malas", "lemah", "mudah sakit"], "mudah"),
        () => makeQuestion("Gerak lokomotor adalah gerakan ... 🚶", "berpindah tempat", ["diam di tempat", "tidur", "tanpa bergerak"], "mudah"),
        () => makeQuestion("Gerak non lokomotor dilakukan ... 🤸", "tanpa berpindah tempat", ["berlari jauh", "melompat ke depan", "berjalan cepat"], "mudah"),
        () => makeQuestion("Gerak manipulatif menggunakan ... ⚽", "alat atau benda", ["warna", "angka", "suara"], "mudah"),
        () => makeQuestion("Pemanasan dilakukan ... 🔥", "sebelum olahraga", ["setelah tidur", "setelah makan banyak", "sesudah pulang"], "mudah"),
        () => makeQuestion("Pendinginan dilakukan ... 🌬️", "setelah olahraga", ["sebelum bangun tidur", "saat makan", "saat menulis"], "mudah"),
        () => makeQuestion("Contoh permainan bola besar adalah ... ⚽", "sepak bola", ["kasti", "tenis meja", "bulutangkis"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Pemanasan berguna untuk ... 🔥", "menyiapkan tubuh dan mengurangi risiko cedera", ["membuat tubuh kaku", "membuat cepat lelah", "membuat malas bergerak"], "sedang"),
        () => makeQuestion("Pendinginan membantu tubuh ... 🌬️", "kembali rileks setelah olahraga", ["semakin tegang", "langsung sakit", "tidak bergerak"], "sedang"),
        () => makeQuestion("Kebugaran jasmani berarti kondisi tubuh yang ... 💪", "sehat, kuat, dan mudah beraktivitas", ["selalu lelah", "malas bergerak", "mudah sakit"], "sedang"),
        () => makeQuestion("Permainan bola kecil contohnya ... ⚾", "kasti", ["sepak bola", "bola basket", "voli"], "sedang"),
        () => makeQuestion("Senam irama dilakukan mengikuti ... 🎶", "musik atau irama", ["warna baju", "angka", "gambar"], "sedang"),
        () => makeQuestion("Sportif berarti ... 🏆", "jujur dan menghargai lawan", ["curang agar menang", "marah saat kalah", "mengejek lawan"], "sedang"),
        () => makeQuestion("Pola hidup sehat dilakukan dengan ... 🍎", "makan bergizi, olahraga, dan tidur cukup", ["makan permen terus", "begadang", "tidak mandi"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa keselamatan penting saat olahraga? 🛑", "agar terhindar dari cedera", ["agar bisa bermain kasar", "agar cepat menang", "agar tidak perlu aturan"], "sulit"),
        () => makeQuestion("Jika teman satu tim kesulitan, sikap yang tepat adalah ... 🤝", "membantu dan memberi semangat", ["mengejek", "meninggalkan", "memarahinya"], "sulit"),
        () => makeQuestion("Jika kalah dalam pertandingan, sikap sportif adalah ... 🏆", "menerima hasil dan menghargai lawan", ["marah", "curang", "menyalahkan teman"], "sulit"),
        () => makeQuestion("Mengapa kerja sama penting dalam permainan tim? ⚽", "agar permainan lebih kompak dan tujuan mudah tercapai", ["agar bisa menang sendiri", "agar teman tidak ikut bermain", "agar permainan kacau"], "sulit"),
        () => makeQuestion("Contoh menjaga kebersihan diri setelah olahraga adalah ... 🧼", "mandi dan mencuci tangan", ["langsung tidur tanpa bersih-bersih", "tidak ganti baju", "makan tanpa cuci tangan"], "sulit"),
        () => makeQuestion("Mengapa tubuh perlu istirahat cukup? 😴", "agar tubuh pulih dan tetap sehat", ["agar semakin lelah", "agar mudah sakit", "agar tidak fokus"], "sulit"),
        () => makeQuestion("Sikap yang benar saat menggunakan alat olahraga adalah ... 🛑", "menggunakan sesuai aturan guru", ["melempar sembarangan", "berebut alat", "menggunakan untuk mengganggu teman"], "sulit"),
        () => makeQuestion("Contoh kerja sama dalam sepak bola adalah ... ⚽", "saling memberi umpan", ["merebut bola teman sendiri", "tidak mau berbagi bola", "mengejek teman satu tim"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateSeniBudayaKelas4(level = "campuran") {
      const mudah = [
        () => makeQuestion("Seni digunakan untuk mengekspresikan ... 🎨", "perasaan dan ide", ["angka", "rumus", "aturan olahraga"], "mudah"),
        () => makeQuestion("Budaya adalah kebiasaan dan tradisi yang ... 🇮🇩", "diwariskan", ["dihapus", "dirusak", "dilupakan"], "mudah"),
        () => makeQuestion("Unsur seni rupa antara lain ... 🌈", "garis, warna, bentuk, dan tekstur", ["angka, uang, waktu", "lari, lompat, lempar", "sisi, sudut, luas"], "mudah"),
        () => makeQuestion("Kolase dibuat dengan cara ... ✂️", "menempel bahan", ["berlari cepat", "membaca jam", "menghitung uang"], "mudah"),
        () => makeQuestion("Tempo adalah ... 🥁", "cepat lambatnya lagu", ["warna gambar", "bentuk benda", "panjang garis"], "mudah"),
        () => makeQuestion("Batik adalah kain khas ... 👘", "Indonesia", ["Jepang", "Australia", "Malaysia"], "mudah"),
        () => makeQuestion("Tari tradisional berasal dari ... 💃", "daerah tertentu", ["angka tertentu", "rumus tertentu", "alat tulis"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Menggambar bentuk berarti menggambar benda sesuai ... ✏️", "bentuk aslinya", ["harga aslinya", "suara aslinya", "rasa aslinya"], "sedang"),
        () => makeQuestion("Warna membuat karya seni terlihat lebih ... 🎨", "hidup dan menarik", ["gelap terus", "rusak", "tidak jelas"], "sedang"),
        () => makeQuestion("Irama adalah ... 🎵", "pola bunyi dalam musik", ["warna pada gambar", "bentuk bangun datar", "ukuran meja"], "sedang"),
        () => makeQuestion("Lagu daerah mencerminkan ... 🎶", "budaya daerah", ["rumus matematika", "aturan lalu lintas", "harga barang"], "sedang"),
        () => makeQuestion("Gerak tari sebaiknya mengikuti ... 👣", "irama musik", ["warna baju", "angka", "ukuran sepatu"], "sedang"),
        () => makeQuestion("Kerajinan tangan dibuat dengan ... 🧵", "keterampilan tangan", ["tidur", "berlari", "membaca saja"], "sedang"),
        () => makeQuestion("Menghargai karya seni berarti ... 🖼️", "tidak merusak dan memberi pujian", ["mengejek", "mencoret", "membuang karya"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa seni dan budaya penting bagi Indonesia? 🇮🇩", "karena merupakan kekayaan dan identitas bangsa", ["karena harus dilupakan", "karena tidak berguna", "karena boleh dirusak"], "sulit"),
        () => makeQuestion("Mengapa kolase melatih kreativitas? ✂️", "karena kita menyusun bahan menjadi karya baru", ["karena hanya menyalin", "karena tidak perlu berpikir", "karena semua bahan dibuang"], "sulit"),
        () => makeQuestion("Mengapa tempo dan irama penting dalam musik? 🥁", "agar lagu terdengar teratur dan menarik", ["agar lagu kacau", "agar suara hilang", "agar tidak perlu bernyanyi"], "sulit"),
        () => makeQuestion("Mengapa tari tradisional harus dilestarikan? 💃", "karena bagian dari budaya daerah", ["karena harus dihapus", "karena tidak memiliki makna", "karena hanya untuk ditertawakan"], "sulit"),
        () => makeQuestion("Jika melihat karya teman, sikap yang tepat adalah ... 👍", "menghargai dan memberi komentar baik", ["mengejek", "merusak", "mencoret"], "sulit"),
        () => makeQuestion("Contoh melestarikan budaya Indonesia adalah ... 🌟", "belajar tari daerah dan memakai batik", ["mengejek lagu daerah", "melupakan budaya", "merusak karya seni"], "sulit"),
        () => makeQuestion("Batik disebut warisan budaya karena ... 👘", "memiliki nilai seni dan tradisi Indonesia", ["hanya kain biasa tanpa makna", "tidak perlu dijaga", "bukan karya bangsa"], "sulit"),
        () => makeQuestion("Ekspresi dalam seni berguna untuk ... 😊", "menunjukkan perasaan melalui karya", ["menyembunyikan karya", "merusak gambar", "membuat teman sedih"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaIndonesiaKelas5(level = "campuran") {
      const mudah = [
        () => makeQuestion("Bahasa Indonesia adalah bahasa ... 🇮🇩", "persatuan", ["daerah saja", "asing", "rahasia"], "mudah"),
        () => makeQuestion("Membaca intensif dilakukan dengan ... 📖", "teliti", ["asal cepat", "bermain", "tanpa membaca"], "mudah"),
        () => makeQuestion("Ide pokok adalah ... 💡", "inti paragraf", ["judul gambar", "nama tokoh saja", "tanda baca"], "mudah"),
        () => makeQuestion("Teks narasi berisi ... 📚", "cerita atau peristiwa", ["daftar angka", "rumus luas", "harga barang"], "mudah"),
        () => makeQuestion("Teks deskripsi bertujuan untuk ... 🌄", "menggambarkan objek", ["menghitung uang", "membagi angka", "mengukur berat"], "mudah"),
        () => makeQuestion("Pantun biasanya terdiri dari ... 🎭", "empat baris", ["satu baris", "dua kata", "sepuluh paragraf"], "mudah"),
        () => makeQuestion("Puisi menggunakan bahasa yang ... ✨", "indah", ["acak", "kasar", "tidak jelas"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Kalimat utama biasanya berisi ... 💡", "ide pokok", ["kata acak", "gambar", "angka"], "sedang"),
        () => makeQuestion("Teks eksplanasi menjelaskan ... 🌋", "proses terjadinya sesuatu", ["nama tokoh saja", "harga barang", "warna benda"], "sedang"),
        () => makeQuestion("Pantun memiliki bagian ... 🎭", "sampiran dan isi", ["judul dan alamat", "angka dan warna", "tokoh dan harga"], "sedang"),
        () => makeQuestion("Surat pribadi digunakan untuk berkomunikasi dengan ... 💌", "teman atau keluarga", ["mesin", "hewan liar", "benda mati"], "sedang"),
        () => makeQuestion("Wawancara adalah kegiatan ... 🎤", "tanya jawab untuk memperoleh informasi", ["menggambar bebas", "menghitung luas", "berlari"], "sedang"),
        () => makeQuestion("Iklan bertujuan untuk ... 📢", "menarik perhatian masyarakat", ["membuat bingung", "menghapus informasi", "menyembunyikan pesan"], "sedang"),
        () => makeQuestion("Pidato disampaikan di depan orang banyak dengan ... 🗣️", "percaya diri dan jelas", ["sangat pelan", "bercanda terus", "tidak jelas"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa membaca intensif perlu dilakukan dengan teliti? 📖", "agar informasi penting dapat dipahami", ["agar bacaan cepat hilang", "agar tidak perlu membaca", "agar pembaca bingung"], "sulit"),
        () => makeQuestion("Paragraf yang baik harus memiliki ... ✍️", "kalimat utama dan kalimat penjelas yang runtut", ["kata acak tanpa arti", "gambar saja", "angka tanpa kalimat"], "sulit"),
        () => makeQuestion("Perbedaan narasi dan deskripsi adalah ...", "narasi menceritakan peristiwa, deskripsi menggambarkan objek", ["keduanya hanya berisi angka", "deskripsi selalu berupa pantun", "narasi tidak memiliki cerita"], "sulit"),
        () => makeQuestion("Contoh teks eksplanasi adalah ... 🌧️", "proses terjadinya hujan", ["cerita liburan pribadi", "daftar belanja", "surat untuk teman"], "sulit"),
        () => makeQuestion("Ringkasan bacaan yang baik berisi ... 📝", "inti informasi dengan kalimat sendiri", ["semua teks disalin", "informasi palsu", "judul saja"], "sulit"),
        () => makeQuestion("Saat wawancara, sikap yang tepat adalah ... 🎤", "bertanya sopan dan mendengarkan jawaban", ["memotong pembicaraan", "menertawakan narasumber", "berteriak"], "sulit"),
        () => makeQuestion("Iklan yang baik harus ... 📢", "singkat, jelas, dan menarik", ["panjang dan membingungkan", "tanpa informasi", "sulit dibaca"], "sulit"),
        () => makeQuestion("Pidato yang baik sebaiknya memiliki ... 🗣️", "pembukaan, isi, dan penutup", ["harga, ukuran, dan warna", "gambar, angka, dan tabel", "sampiran saja"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaJawaKelas5(level = "campuran") {
      const mudah = [
        () => makeQuestion("Basa Jawa yaiku basa daerah sing kudu ... 🗣️", "dijaga", ["dirusak", "dilalekake", "diejek"], "mudah"),
        () => makeQuestion("Unggah-ungguh basa yaiku ... 🙏", "tata krama nalika ngomong", ["angka", "werna", "dolanan"], "mudah"),
        () => makeQuestion("Basa ngoko biasane digunakake marang ...", "kanca sebaya", ["guru", "wong tuwa", "tamu resmi"], "mudah"),
        () => makeQuestion("Basa krama digunakake marang ... 🙏", "wong tuwa utawa guru", ["kanca dolanan", "boneka", "kewan"], "mudah"),
        () => makeQuestion("Tembung aran yaiku tembung kanggo ... 📘", "jeneng wong, kewan, barang, utawa papan", ["pakaryan", "kahanan", "swara"], "mudah"),
        () => makeQuestion("Tembung kriya nuduhake ... 🏃", "pakaryan utawa kegiatan", ["barang", "werna", "ukuran"], "mudah"),
        () => makeQuestion("Aksara Jawa yaiku ... 🔤", "tulisan tradisional Jawa", ["lagu dolanan", "panganan", "alat olahraga"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Tembung sifat digunakake kanggo njelasake ... 😊", "sifat utawa kahanan", ["jeneng barang", "pakaryan", "alamat"], "sedang"),
        () => makeQuestion("Ukara Jawa sing runtut yaiku ... ✍️", "Aku sinau Basa Jawa.", ["Sinau aku Jawa Basa.", "Aku.", "Basa mlaku apik."], "sedang"),
        () => makeQuestion("Tembang dolanan yaiku ... 🎶", "lagu tradisional bocah Jawa", ["angka Jawa", "alat tulis", "jeneng panganan"], "sedang"),
        () => makeQuestion("Dongeng Jawa biasane ngemot ... 🐉", "pesan moral", ["nomor telepon", "harga barang", "aturan matematika"], "sedang"),
        () => makeQuestion("Paribasan lan bebasan yaiku ... 📜", "ungkapan tradisional Jawa", ["ukuran panjang", "alat musik", "jenis olahraga"], "sedang"),
        () => makeQuestion("Crita pengalaman yaiku crita ngenani ... 📖", "kedadeyan sing tau dialami", ["rumus hitung", "warna gambar", "ukuran benda"], "sedang"),
        () => makeQuestion("Pidato Jawa kudu nggunakake basa sing ... 🗣️", "sopan lan jelas", ["kasar", "acak", "ora jelas"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa unggah-ungguh basa penting? 🙏", "supaya komunikasi sopan lan ngajeni wong liya", ["supaya bisa ngece", "supaya ribut", "supaya ora sinau"], "sulit"),
        () => makeQuestion("Ukara ngoko 'Aku lunga' yen digawe luwih sopan bisa dadi ...", "Kula tindak", ["Aku mangan", "Kowe lunga", "Balon abang"], "sulit"),
        () => makeQuestion("Paribasan 'alon-alon waton kelakon' ngajari supaya ... 🐢", "sabar lan ati-ati", ["grusa-grusu", "males", "ngece"], "sulit"),
        () => makeQuestion("Paribasan 'sapa nandur bakal ngundhuh' tegese ... 🌱", "sapa tumindak bakal nampa akibat", ["sapa turu bakal mangan", "sapa dolan bakal lali", "sapa meneng bakal menang"], "sulit"),
        () => makeQuestion("Mengapa aksara Jawa perlu dipelajari? 🔤", "amarga kalebu warisan budaya Jawa", ["amarga ora penting", "amarga kudu dilalekake", "amarga mung kanggo dolanan"], "sulit"),
        () => makeQuestion("Crita pengalaman sing apik kudu ditulis kanthi ... 📖", "runtut, jelas, lan gampang dimangerteni", ["acak", "ora jelas", "tanpa urutan"], "sulit"),
        () => makeQuestion("Nalika pidato ing ngarepe wong akeh, sikap sing tepat yaiku ... 🗣️", "percaya diri, sopan, lan jelas", ["ngguyu terus", "muring-muring", "meneng wae"], "sulit"),
        () => makeQuestion("Cara njaga budaya Jawa yaiku ... 🌟", "sinau basa, aksara, tembang, lan adat Jawa", ["nglalekake budaya", "ngece budaya", "ora gelem sinau"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateIPASKelas5(level = "campuran") {
      const mudah = [
        () => makeQuestion("IPAS mempelajari tentang ... 🌍", "alam dan kehidupan sosial", ["musik saja", "olahraga saja", "angka saja"], "mudah"),
        () => makeQuestion("Organ pernapasan utama manusia adalah ... 🫁", "paru-paru", ["lambung", "usus", "tulang"], "mudah"),
        () => makeQuestion("Proses pencernaan dimulai dari ... 🍚", "mulut", ["kaki", "paru-paru", "telinga"], "mudah"),
        () => makeQuestion("Jantung berfungsi untuk ... ❤️", "memompa darah", ["mencerna makanan", "melihat benda", "menghasilkan suara"], "mudah"),
        () => makeQuestion("Tumbuhan hijau membuat makanan melalui ... 🌿", "fotosintesis", ["pernapasan", "perdagangan", "penguapan"], "mudah"),
        () => makeQuestion("Gaya adalah ... ⚽", "dorongan atau tarikan", ["warna benda", "nama tempat", "jenis makanan"], "mudah"),
        () => makeQuestion("Air turun dari awan sebagai ... 🌧️", "hujan", ["api", "batu", "pasir"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Fotosintesis membutuhkan ... ☀️", "air, cahaya matahari, dan karbon dioksida", ["batu, pasir, dan logam", "minyak, plastik, dan kaca", "uang, kertas, dan pensil"], "sedang"),
        () => makeQuestion("Ekosistem adalah hubungan antara ... 🌳", "makhluk hidup dan lingkungannya", ["angka dan huruf", "lagu dan tari", "warna dan gambar"], "sedang"),
        () => makeQuestion("Rantai makanan menunjukkan hubungan ... 🍎", "makan dan dimakan", ["jual dan beli saja", "membaca dan menulis", "bernyanyi dan menari"], "sedang"),
        () => makeQuestion("Energi listrik pada lampu berubah menjadi ... 💡", "cahaya", ["air", "batu", "tanah"], "sedang"),
        () => makeQuestion("Siklus air terdiri dari proses ... 🌧️", "penguapan, pembentukan awan, dan hujan", ["makan, tidur, bermain", "lari, lompat, lempar", "jual, beli, simpan"], "sedang"),
        () => makeQuestion("Produksi adalah kegiatan ... 💰", "membuat atau menghasilkan barang", ["memakai barang", "membeli barang", "membuang barang"], "sedang"),
        () => makeQuestion("Teknologi sebaiknya digunakan secara ... 📱", "bijak", ["berlebihan", "sembarangan", "untuk mengganggu"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa paru-paru harus dijaga kesehatannya? 🫁", "karena paru-paru membantu tubuh mendapatkan oksigen", ["agar tubuh tidak bernapas", "agar makanan tidak dicerna", "agar darah berhenti"], "sulit"),
        () => makeQuestion("Mengapa makanan perlu dicerna? 🍚", "agar zat gizi dapat diserap tubuh", ["agar makanan tetap utuh", "agar tubuh tidak mendapat energi", "agar makanan hilang"], "sulit"),
        () => makeQuestion("Jika rantai makanan rusak, akibatnya adalah ... 🍎", "keseimbangan ekosistem terganggu", ["semua makhluk hidup selalu aman", "tidak ada perubahan", "alam pasti semakin baik"], "sulit"),
        () => makeQuestion("Contoh perubahan energi yang benar adalah ... ⚡", "listrik menjadi cahaya pada lampu", ["air menjadi batu", "buku menjadi udara", "tanah menjadi suara"], "sulit"),
        () => makeQuestion("Mengapa siklus air penting bagi kehidupan? 🌧️", "karena menjaga ketersediaan air di bumi", ["karena menghilangkan semua air", "karena membuat bumi kering", "karena menghentikan hujan"], "sulit"),
        () => makeQuestion("Distribusi dalam kegiatan ekonomi berarti ... 🛒", "menyalurkan barang dari produsen ke konsumen", ["membuat barang", "memakai barang", "membuang barang"], "sulit"),
        () => makeQuestion("Mengapa keragaman budaya harus dihargai? 🎭", "karena merupakan kekayaan bangsa Indonesia", ["karena harus dilupakan", "karena tidak penting", "karena boleh diejek"], "sulit"),
        () => makeQuestion("Jika lingkungan kotor, dampaknya adalah ... 🌳", "dapat menimbulkan penyakit dan banjir", ["udara selalu bersih", "semua orang sehat", "sampah hilang sendiri"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateMatematikaKelas5(level = "campuran") {
      const mudah = [
        () => makeQuestion("Bilangan bulat terdiri dari bilangan positif, nol, dan ... 🔢", "bilangan negatif", ["pecahan", "desimal saja", "persen"], "mudah"),
        () => makeQuestion("Pecahan terdiri dari pembilang dan ... 🍰", "penyebut", ["pengali", "pembagi waktu", "hasil"], "mudah"),
        () => makeQuestion("Pecahan desimal ditulis menggunakan tanda ... 🔟", "koma", ["titik dua", "seru", "tanya"], "mudah"),
        () => makeQuestion("Persen berarti per ... 📊", "seratus", ["sepuluh", "seribu", "satu"], "mudah"),
        () => makeQuestion("Bangun datar memiliki panjang dan ... 📐", "lebar", ["volume", "isi", "tinggi ruang"], "mudah"),
        () => makeQuestion("1 jam sama dengan ... ⏰", "60 menit", ["30 menit", "100 menit", "24 menit"], "mudah"),
        () => makeQuestion("Data dapat disajikan dalam tabel dan ... 📈", "diagram", ["lagu", "pantun", "cerita"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("5 + (-2) = ... ➕", "3", ["7", "-7", "-3"], "sedang"),
        () => makeQuestion("-4 + 6 = ... ➕", "2", ["-10", "10", "-2"], "sedang"),
        () => makeQuestion("1/4 + 2/4 = ... 🍕", "3/4", ["2/8", "1/2", "3/8"], "sedang"),
        () => makeQuestion("3/5 - 1/5 = ... 🍰", "2/5", ["4/5", "2/10", "1/5"], "sedang"),
        () => makeQuestion("50% sama dengan ... 📊", "50 per 100", ["50 per 10", "5 per 1000", "100 per 50"], "sedang"),
        () => makeQuestion("Luas persegi dengan sisi 6 cm adalah ... 📏", "36 cm²", ["12 cm²", "24 cm²", "30 cm²"], "sedang"),
        () => makeQuestion("Volume kubus dengan sisi 3 cm adalah ... 📦", "27 cm³", ["9 cm³", "18 cm³", "12 cm³"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Jika suhu awal 5°C lalu turun 8°C, suhu akhirnya adalah ... 🌡️", "-3°C", ["3°C", "13°C", "-13°C"], "sulit"),
        () => makeQuestion("Pecahan 1/2 dalam bentuk desimal adalah ... 🔟", "0,5", ["0,2", "1,2", "5,0"], "sulit"),
        () => makeQuestion("25% sama dengan pecahan ... 📊", "1/4", ["1/2", "3/4", "1/5"], "sulit"),
        () => makeQuestion("Jika skala peta 1:1000, maka 1 cm pada peta sama dengan ... 🗺️", "1000 cm sebenarnya", ["100 cm sebenarnya", "10 cm sebenarnya", "1 cm sebenarnya"], "sulit"),
        () => makeQuestion("Volume balok dengan panjang 5 cm, lebar 4 cm, dan tinggi 3 cm adalah ... 📦", "60 cm³", ["12 cm³", "20 cm³", "45 cm³"], "sulit"),
        () => makeQuestion("Debit adalah hubungan antara volume air dan ... 💧", "waktu", ["warna", "berat benda", "luas tanah"], "sulit"),
        () => makeQuestion("Rata-rata dari 80, 90, dan 70 adalah ... 📉", "80", ["70", "75", "90"], "sulit"),
        () => makeQuestion("Langkah pertama menyelesaikan soal cerita matematika adalah ... 🧠", "membaca soal dengan teliti", ["langsung menebak", "menulis jawaban acak", "mengabaikan angka"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePancasilaKelas5(level = "campuran") {
      const mudah = [
        () => makeQuestion("Pancasila adalah dasar negara ... 🇮🇩", "Indonesia", ["Malaysia", "Jepang", "Australia"], "mudah"),
        () => makeQuestion("Sila pertama berbunyi ... 🙏", "Ketuhanan Yang Maha Esa", ["Persatuan Indonesia", "Keadilan Sosial", "Kemanusiaan"], "mudah"),
        () => makeQuestion("Sila kedua mengajarkan kita untuk ... ❤️", "menghargai sesama manusia", ["mengejek teman", "berbuat curang", "membeda-bedakan"], "mudah"),
        () => makeQuestion("Sila ketiga berbunyi ... 🤝", "Persatuan Indonesia", ["Ketuhanan Yang Maha Esa", "Keadilan Sosial", "Musyawarah"], "mudah"),
        () => makeQuestion("Hak adalah sesuatu yang kita ... 📖", "terima", ["buang", "rusak", "hindari"], "mudah"),
        () => makeQuestion("Kewajiban adalah sesuatu yang harus kita ... ✅", "lakukan", ["lupakan", "tinggalkan", "abaikan"], "mudah"),
        () => makeQuestion("Gotong royong berarti bekerja ... 🤝", "bersama-sama", ["sendiri-sendiri", "asal-asalan", "dengan marah"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Sila keempat mengajarkan kita untuk ... 🗳️", "bermusyawarah", ["memaksakan kehendak", "bertengkar", "menang sendiri"], "sedang"),
        () => makeQuestion("Sila kelima mengajarkan sikap ... ⚖️", "adil", ["curang", "pilih kasih", "egois"], "sedang"),
        () => makeQuestion("Hak dan kewajiban harus berjalan ... 📖", "seimbang", ["terpisah", "salah satu saja", "diabaikan"], "sedang"),
        () => makeQuestion("Keragaman budaya Indonesia harus ... 🎭", "dihargai", ["diejek", "dilupakan", "dirusak"], "sedang"),
        () => makeQuestion("Norma adalah aturan yang berlaku dalam ... 📜", "masyarakat", ["permainan saja", "gambar", "angka"], "sedang"),
        () => makeQuestion("Demokrasi sederhana di sekolah contohnya ... 🗳️", "pemilihan ketua kelas", ["membuang sampah", "berlari di kelas", "mencoret meja"], "sedang"),
        () => makeQuestion("Pelajar Pancasila harus bersikap ... 🌟", "jujur, mandiri, dan gotong royong", ["curang dan malas", "egois dan kasar", "tidak peduli"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa toleransi beragama penting? 🙏", "agar hidup rukun dan saling menghormati", ["agar bisa memaksa agama", "agar boleh mengejek", "agar teman takut"], "sulit"),
        () => makeQuestion("Jika keputusan musyawarah berbeda dengan pendapatmu, sikap yang tepat adalah ... 🗳️", "menerima keputusan bersama", ["marah", "memaksa teman", "meninggalkan kelompok"], "sulit"),
        () => makeQuestion("Mengapa hak dan kewajiban harus seimbang? ⚖️", "agar kehidupan tertib dan adil", ["agar hanya meminta hak", "agar kewajiban diabaikan", "agar aturan tidak berlaku"], "sulit"),
        () => makeQuestion("Contoh sikap sesuai sila ketiga adalah ... 🤝", "gotong royong membersihkan lingkungan", ["bertengkar", "membeda-bedakan teman", "mengejek budaya lain"], "sulit"),
        () => makeQuestion("Jika ada teman berbeda suku, sikap yang benar adalah ... 🌈", "menghargai dan berteman dengannya", ["mengejek", "menjauhi", "membeda-bedakan"], "sulit"),
        () => makeQuestion("Mengapa norma perlu ditaati? 📜", "agar kehidupan masyarakat tertib dan nyaman", ["agar bisa melanggar aturan", "agar orang bebas mengganggu", "agar lingkungan kacau"], "sulit"),
        () => makeQuestion("Pemilihan ketua kelas yang demokratis harus dilakukan dengan ... 🗳️", "jujur dan adil", ["curang", "paksaan", "ancaman"], "sulit"),
        () => makeQuestion("Contoh menjadi Pelajar Pancasila adalah ... 🌟", "rajin belajar, jujur, membantu teman, dan menghargai perbedaan", ["malas, curang, dan mengejek", "tidak peduli teman", "melanggar aturan"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePJOKKelas5(level = "campuran") {
      const mudah = [
        () => makeQuestion("PJOK membantu tubuh menjadi ... 🏃", "sehat, kuat, dan bugar", ["lemah", "malas", "mudah sakit"], "mudah"),
        () => makeQuestion("Kebugaran jasmani adalah kemampuan tubuh untuk ... 💪", "beraktivitas tanpa mudah lelah", ["tidur terus", "makan banyak", "diam saja"], "mudah"),
        () => makeQuestion("Gerak lokomotor adalah gerakan ... 🚶", "berpindah tempat", ["diam di tempat", "tanpa alat", "sambil tidur"], "mudah"),
        () => makeQuestion("Gerak non lokomotor dilakukan ... 🤸", "tanpa berpindah tempat", ["berlari jauh", "melompat ke depan", "berpindah kelas"], "mudah"),
        () => makeQuestion("Gerak manipulatif menggunakan ... ⚽", "alat atau benda", ["warna", "angka", "suara"], "mudah"),
        () => makeQuestion("Pemanasan dilakukan sebelum olahraga untuk ... 🔥", "mencegah cedera", ["membuat tubuh kaku", "membuat malas", "membuat sakit"], "mudah"),
        () => makeQuestion("Sportivitas berarti bermain dengan ... 🏆", "jujur", ["curang", "marah", "mengejek"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Atletik meliputi olahraga ... 🏅", "lari, lompat, dan lempar", ["renang, tidur, makan", "gambar, warna, garis", "lagu, tari, musik"], "sedang"),
        () => makeQuestion("Permainan bola besar contohnya ... ⚽", "sepak bola, basket, dan voli", ["kasti, tenis, bulutangkis", "catur, congklak, kartu", "lari, lompat, lempar"], "sedang"),
        () => makeQuestion("Permainan bola kecil contohnya ... ⚾", "kasti, tenis, dan bulutangkis", ["sepak bola, basket, voli", "renang, senam, lari", "tidur, makan, mandi"], "sedang"),
        () => makeQuestion("Senam irama dilakukan mengikuti ... 🎶", "musik atau irama", ["warna baju", "angka", "gambar"], "sedang"),
        () => makeQuestion("Renang melatih kekuatan otot dan ... 🏊", "pernapasan", ["membaca", "menggambar", "berhitung"], "sedang"),
        () => makeQuestion("Pola hidup sehat dilakukan dengan ... 🍎", "makan bergizi, olahraga, dan tidur cukup", ["makan permen terus", "begadang", "tidak mandi"], "sedang"),
        () => makeQuestion("Kebersihan diri membantu mencegah ... 🧼", "penyakit", ["kesehatan", "semangat", "kebugaran"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa pemanasan dan pendinginan penting dalam olahraga? 🔥", "agar tubuh siap bergerak dan tidak mudah cedera", ["agar tubuh cepat sakit", "agar olahraga lebih berbahaya", "agar tubuh kaku"], "sulit"),
        () => makeQuestion("Mengapa kerja sama penting dalam permainan bola besar? ⚽", "karena permainan tim membutuhkan kekompakan", ["agar bisa bermain sendiri", "agar teman tidak ikut", "agar permainan kacau"], "sulit"),
        () => makeQuestion("Jika kalah dalam pertandingan, sikap sportif adalah ... 🏆", "menerima hasil dan menghargai lawan", ["marah", "menyalahkan teman", "curang"], "sulit"),
        () => makeQuestion("Mengapa keselamatan penting saat berenang? 🏊", "karena air bisa berbahaya jika tidak hati-hati", ["agar bisa bercanda berlebihan", "agar tidak perlu aturan", "agar berenang sendirian"], "sulit"),
        () => makeQuestion("Jika teman cedera saat olahraga, sikap yang tepat adalah ... 🛑", "menolong dan memberi tahu guru", ["menertawakan", "meninggalkan", "memarahinya"], "sulit"),
        () => makeQuestion("Contoh menjaga kebersihan diri setelah olahraga adalah ... 🧼", "mandi, ganti baju, dan mencuci tangan", ["langsung tidur tanpa mandi", "tidak ganti baju", "makan tanpa cuci tangan"], "sulit"),
        () => makeQuestion("Mengapa tubuh perlu tidur cukup? 😴", "agar tubuh pulih dan tetap sehat", ["agar semakin lelah", "agar mudah sakit", "agar tidak fokus"], "sulit"),
        () => makeQuestion("Cara menghindari cedera saat olahraga adalah ... 👟", "mengikuti aturan, memakai alat dengan benar, dan tidak ceroboh", ["mendorong teman", "bermain kasar", "mengabaikan guru"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateSeniBudayaKelas5(level = "campuran") {
      const mudah = [
        () => makeQuestion("Seni adalah hasil karya manusia yang memiliki ... 🎨", "keindahan", ["kerusakan", "kotoran", "kemalasan"], "mudah"),
        () => makeQuestion("Budaya adalah tradisi yang ... 🇮🇩", "diwariskan", ["dihapus", "dilupakan", "dirusak"], "mudah"),
        () => makeQuestion("Unsur seni rupa antara lain ... 🌈", "garis, warna, bentuk, tekstur, dan ruang", ["angka, uang, waktu", "lari, lompat, lempar", "hak, kewajiban, aturan"], "mudah"),
        () => makeQuestion("Kolase dibuat dengan cara ... ✂️", "menempel bahan", ["berlari", "menghitung", "menendang"], "mudah"),
        () => makeQuestion("Musik adalah seni yang menggunakan ... 🎵", "bunyi", ["angka", "tanah", "air"], "mudah"),
        () => makeQuestion("Tari adalah gerakan tubuh yang mengikuti ... 💃", "irama", ["harga", "ukuran", "alamat"], "mudah"),
        () => makeQuestion("Batik adalah kain khas ... 👘", "Indonesia", ["Jepang", "Australia", "Malaysia"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Menggambar bentuk berarti menggambar benda sesuai ... ✏️", "bentuk aslinya", ["suara aslinya", "harga aslinya", "rasa aslinya"], "sedang"),
        () => makeQuestion("Warna dalam karya seni dapat menunjukkan ... 🎨", "suasana tertentu", ["rumus hitung", "berat benda", "arah mata angin"], "sedang"),
        () => makeQuestion("Mozaik dibuat dari ... 🌈", "potongan kecil yang disusun menjadi gambar", ["air yang dituangkan", "bola yang ditendang", "angka yang dibagi"], "sedang"),
        () => makeQuestion("Tempo dalam musik berarti ... 🎵", "cepat lambatnya lagu", ["besar kecilnya gambar", "panjang pendeknya meja", "berat ringannya tas"], "sedang"),
        () => makeQuestion("Alat musik tradisional berasal dari ... 🥁", "daerah tertentu", ["angka tertentu", "rumus tertentu", "warna tertentu"], "sedang"),
        () => makeQuestion("Pola lantai tari adalah ... 👣", "garis yang dilalui penari", ["warna pakaian", "harga tiket", "nama alat tulis"], "sedang"),
        () => makeQuestion("Apresiasi karya seni berarti ... 🖼️", "menghargai hasil karya orang lain", ["mengejek karya", "merusak karya", "membuang karya"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa seni dan budaya perlu dilestarikan? 🌟", "agar warisan bangsa tidak hilang", ["agar budaya dilupakan", "agar karya dirusak", "agar orang tidak kreatif"], "sulit"),
        () => makeQuestion("Mengapa kolase dan mozaik melatih kreativitas? ✂️", "karena kita menyusun bahan menjadi karya baru", ["karena hanya membuang bahan", "karena tidak perlu berpikir", "karena semua karya harus sama"], "sulit"),
        () => makeQuestion("Mengapa pola lantai penting dalam tari? 👣", "agar gerakan tari terlihat rapi dan menarik", ["agar penari bingung", "agar tari berhenti", "agar musik tidak terdengar"], "sulit"),
        () => makeQuestion("Jika melihat karya seni teman, sikap yang tepat adalah ... 👍", "menghargai dan memberi pujian baik", ["mengejek", "mencoret", "merusak"], "sulit"),
        () => makeQuestion("Batik disebut warisan budaya karena ... 👘", "memiliki nilai seni dan tradisi Indonesia", ["hanya kain biasa tanpa makna", "tidak perlu dijaga", "bukan karya bangsa"], "sulit"),
        () => makeQuestion("Pameran seni bertujuan untuk ... 🎪", "menampilkan dan memperkenalkan karya seni", ["menyembunyikan karya", "merusak karya", "membuang karya"], "sulit"),
        () => makeQuestion("Contoh melestarikan budaya Indonesia adalah ... 🇮🇩", "belajar tari daerah, memakai batik, dan menyanyikan lagu daerah", ["mengejek lagu daerah", "melupakan budaya", "merusak alat musik"], "sulit"),
        () => makeQuestion("Mengapa apresiasi seni penting? 🖼️", "agar pencipta karya merasa dihargai dan semangat berkarya", ["agar teman sedih", "agar karya rusak", "agar orang berhenti berkarya"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaIndonesiaKelas6(level = "campuran") {
      const mudah = [
        () => makeQuestion("Bahasa Indonesia berfungsi sebagai bahasa ... 🇮🇩", "persatuan", ["daerah", "asing", "rahasia"], "mudah"),
        () => makeQuestion("Ide pokok adalah ... 💡", "inti paragraf", ["judul gambar", "nama tokoh saja", "tanda baca"], "mudah"),
        () => makeQuestion("Ringkasan berisi ... 📝", "inti bacaan", ["semua kalimat asli", "gambar saja", "judul saja"], "mudah"),
        () => makeQuestion("Teks narasi berisi ... 📚", "cerita atau rangkaian peristiwa", ["daftar angka", "rumus luas", "ukuran benda"], "mudah"),
        () => makeQuestion("Teks deskripsi bertujuan untuk ... 🌄", "menggambarkan objek", ["menghitung uang", "mengukur berat", "membagi angka"], "mudah"),
        () => makeQuestion("Puisi menggunakan bahasa yang ... ✨", "indah", ["acak", "kasar", "tidak jelas"], "mudah"),
        () => makeQuestion("Pidato disampaikan di depan ... 🗣️", "umum", ["benda mati", "hewan saja", "buku"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Kalimat utama biasanya memuat ... 💡", "ide pokok", ["kata acak", "gambar", "angka"], "sedang"),
        () => makeQuestion("Teks eksplanasi menjelaskan ... 🌋", "proses terjadinya suatu peristiwa", ["nama tokoh saja", "harga barang", "warna benda"], "sedang"),
        () => makeQuestion("Teks persuasi bertujuan untuk ... 📢", "mengajak atau memengaruhi pembaca", ["membuat bingung", "menghapus informasi", "menyembunyikan pesan"], "sedang"),
        () => makeQuestion("Pantun memiliki bagian ... 🎭", "sampiran dan isi", ["judul dan alamat", "angka dan warna", "tokoh dan harga"], "sedang"),
        () => makeQuestion("Surat resmi menggunakan bahasa ... ✉️", "baku dan sopan", ["asal-asalan", "kasar", "tidak jelas"], "sedang"),
        () => makeQuestion("Wawancara adalah kegiatan ... 🎤", "tanya jawab untuk memperoleh informasi", ["menggambar bebas", "menghitung luas", "berlari"], "sedang"),
        () => makeQuestion("Cerpen adalah cerita yang ... 📘", "singkat dan menarik", ["selalu berupa rumus", "hanya berisi angka", "tidak punya tokoh"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa menentukan ide pokok penting? 💡", "agar pembaca memahami inti bacaan", ["agar bacaan hilang", "agar pembaca bingung", "agar tidak perlu membaca"], "sulit"),
        () => makeQuestion("Ringkasan yang baik harus ditulis dengan ... 📝", "kalimat sendiri dan memuat informasi penting", ["menyalin semua teks", "menambah cerita palsu", "menghapus inti bacaan"], "sulit"),
        () => makeQuestion("Perbedaan narasi dan deskripsi adalah ...", "narasi menceritakan peristiwa, deskripsi menggambarkan objek", ["keduanya hanya berisi angka", "deskripsi selalu berupa pantun", "narasi tidak memiliki cerita"], "sulit"),
        () => makeQuestion("Contoh teks eksplanasi adalah ... 🌧️", "proses terjadinya hujan", ["surat untuk teman", "cerita liburan", "daftar belanja"], "sulit"),
        () => makeQuestion("Kalimat persuasi yang tepat adalah ... 📢", "Ayo jaga kebersihan lingkungan!", ["Meja itu berwarna cokelat.", "Budi pergi ke sekolah.", "Hujan turun deras."], "sulit"),
        () => makeQuestion("Pidato yang baik memiliki bagian ... 🗣️", "pembukaan, isi, dan penutup", ["harga, ukuran, dan warna", "gambar, angka, dan tabel", "sampiran saja"], "sulit"),
        () => makeQuestion("Saat wawancara, sikap yang tepat adalah ... 🎤", "bertanya sopan dan mendengarkan jawaban", ["memotong pembicaraan", "menertawakan narasumber", "berteriak"], "sulit"),
        () => makeQuestion("Mengapa karya sastra perlu dihargai? 🌟", "karena merupakan hasil kreativitas dan mengandung nilai kehidupan", ["karena harus dirusak", "karena tidak berguna", "karena boleh diejek"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateBahasaJawaKelas6(level = "campuran") {
      const mudah = [
        () => makeQuestion("Basa Jawa yaiku warisan budaya sing kudu ... 🗣️", "dijaga", ["dirusak", "dilalekake", "diejek"], "mudah"),
        () => makeQuestion("Unggah-ungguh basa yaiku ... 🙏", "tata krama nalika nggunakake Basa Jawa", ["angka", "werna", "dolanan"], "mudah"),
        () => makeQuestion("Tembung aran yaiku tembung kanggo nyebut ... 📘", "jeneng wong, barang, kewan, utawa papan", ["pakaryan", "kahanan", "swara"], "mudah"),
        () => makeQuestion("Tembung kriya nuduhake ... 🏃", "pakaryan utawa kegiatan", ["barang", "werna", "ukuran"], "mudah"),
        () => makeQuestion("Tembung sifat nerangake ... 😊", "sifat utawa kahanan", ["jeneng barang", "pakaryan", "alamat"], "mudah"),
        () => makeQuestion("Aksara Jawa yaiku ... 🔤", "tulisan tradisional masyarakat Jawa", ["lagu dolanan", "alat olahraga", "panganan"], "mudah"),
        () => makeQuestion("Dongeng Jawa biasane ngemot ... 🐉", "pesan moral", ["nomor telepon", "harga barang", "aturan matematika"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Basa krama luwih trep digunakake marang ... 🙏", "wong tuwa utawa guru", ["kanca sebaya", "boneka", "kewan"], "sedang"),
        () => makeQuestion("Ukara Jawa sing runtut yaiku ... ✍️", "Aku sinau Basa Jawa.", ["Sinau aku Jawa Basa.", "Aku.", "Basa mlaku apik."], "sedang"),
        () => makeQuestion("Maca aksara Jawa kudu ngerti ... 📖", "pasangan lan sandhangan", ["warna lan angka", "panganan lan minuman", "dolanan lan olahraga"], "sedang"),
        () => makeQuestion("Nulis aksara Jawa mbutuhake ... ✏️", "ketelitian", ["kemalasan", "teriakan", "asal-asalan"], "sedang"),
        () => makeQuestion("Paribasan lan bebasan yaiku ... 📜", "ungkapan tradisional Jawa", ["ukuran panjang", "alat musik", "jenis olahraga"], "sedang"),
        () => makeQuestion("Tembang macapat yaiku ... 🎶", "tembang tradisional Jawa", ["cerita lucu", "alat tulis", "panganan khas"], "sedang"),
        () => makeQuestion("Pidato Jawa kudu nganggo basa sing ... 🗣️", "sopan lan jelas", ["kasar", "acak", "ora jelas"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa unggah-ungguh basa penting? 🙏", "supaya komunikasi sopan lan ngajeni wong liya", ["supaya bisa ngece", "supaya ribut", "supaya ora sinau"], "sulit"),
        () => makeQuestion("Ukara ngoko 'Aku lunga' yen digawe krama dadi ...", "Kula tindak", ["Aku mangan", "Kowe lunga", "Balon abang"], "sulit"),
        () => makeQuestion("Mengapa aksara Jawa perlu dipelajari? 🔤", "amarga kalebu warisan budaya Jawa", ["amarga ora penting", "amarga kudu dilalekake", "amarga mung kanggo dolanan"], "sulit"),
        () => makeQuestion("Paribasan 'alon-alon waton kelakon' ngajari supaya ... 🐢", "sabar lan ati-ati", ["grusa-grusu", "males", "ngece"], "sulit"),
        () => makeQuestion("Paribasan 'sapa nandur bakal ngundhuh' tegese ... 🌱", "sapa tumindak bakal nampa akibat", ["sapa turu bakal mangan", "sapa dolan bakal lali", "sapa meneng bakal menang"], "sulit"),
        () => makeQuestion("Crita pengalaman sing apik kudu ditulis kanthi ... 📘", "runtut, jelas, lan gampang dimangerteni", ["acak", "ora jelas", "tanpa urutan"], "sulit"),
        () => makeQuestion("Tembang macapat nduweni aturan ... 🎶", "guru lagu lan guru wilangan", ["harga lan ukuran", "warna lan gambar", "panganan lan minuman"], "sulit"),
        () => makeQuestion("Cara nguri-uri budaya Jawa yaiku ... 🌟", "sinau basa, aksara, tembang, lan adat Jawa", ["nglalekake budaya", "ngece budaya", "ora gelem sinau"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateIPASKelas6(level = "campuran") {
      const mudah = [
        () => makeQuestion("IPAS mempelajari tentang ... 🌍", "alam dan kehidupan sosial", ["musik saja", "olahraga saja", "angka saja"], "mudah"),
        () => makeQuestion("Organ pernapasan utama manusia adalah ... 🫁", "paru-paru", ["lambung", "usus", "tulang"], "mudah"),
        () => makeQuestion("Pencernaan makanan dimulai dari ... 🍚", "mulut", ["kaki", "paru-paru", "telinga"], "mudah"),
        () => makeQuestion("Jantung berfungsi untuk ... ❤️", "memompa darah", ["mencerna makanan", "melihat benda", "menghasilkan suara"], "mudah"),
        () => makeQuestion("Matahari adalah pusat ... ☀️", "tata surya", ["rantai makanan", "pencernaan", "ekonomi"], "mudah"),
        () => makeQuestion("Rotasi bumi menyebabkan ... 🌎", "siang dan malam", ["hujan saja", "banjir saja", "gunung meletus"], "mudah"),
        () => makeQuestion("Gaya adalah ... ⚽", "dorongan atau tarikan", ["warna benda", "nama tempat", "jenis makanan"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Makhluk hidup berkembang biak untuk ... 🐣", "melestarikan jenisnya", ["menghilangkan makanan", "mengurangi udara", "merusak lingkungan"], "sedang"),
        () => makeQuestion("Ekosistem adalah hubungan antara ... 🌳", "makhluk hidup dan lingkungannya", ["angka dan huruf", "lagu dan tari", "warna dan gambar"], "sedang"),
        () => makeQuestion("Rantai makanan menunjukkan hubungan ... 🍎", "makan dan dimakan", ["jual dan beli saja", "membaca dan menulis", "bernyanyi dan menari"], "sedang"),
        () => makeQuestion("Energi listrik pada lampu berubah menjadi ... 💡", "cahaya", ["air", "batu", "tanah"], "sedang"),
        () => makeQuestion("Revolusi bumi adalah peredaran bumi mengelilingi ... ☀️", "matahari", ["bulan", "awan", "laut"], "sedang"),
        () => makeQuestion("Produksi adalah kegiatan ... 💰", "membuat atau menghasilkan barang", ["memakai barang", "membeli barang", "membuang barang"], "sedang"),
        () => makeQuestion("Globalisasi dipercepat oleh perkembangan ... 🌐", "teknologi dan internet", ["batu dan pasir", "tanah dan daun", "meja dan kursi"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa paru-paru harus dijaga kesehatannya? 🫁", "karena paru-paru membantu tubuh mendapatkan oksigen", ["agar tubuh tidak bernapas", "agar makanan tidak dicerna", "agar darah berhenti"], "sulit"),
        () => makeQuestion("Mengapa makanan perlu dicerna? 🍚", "agar zat gizi dapat diserap tubuh", ["agar makanan tetap utuh", "agar tubuh tidak mendapat energi", "agar makanan hilang"], "sulit"),
        () => makeQuestion("Jika jaring makanan rusak, akibatnya adalah ... 🍎", "keseimbangan ekosistem terganggu", ["semua makhluk hidup selalu aman", "tidak ada perubahan", "alam pasti semakin baik"], "sulit"),
        () => makeQuestion("Contoh perubahan energi yang benar adalah ... ⚡", "listrik menjadi cahaya pada lampu", ["air menjadi batu", "buku menjadi udara", "tanah menjadi suara"], "sulit"),
        () => makeQuestion("Mengapa rotasi bumi penting bagi kehidupan? 🌎", "karena menyebabkan pergantian siang dan malam", ["karena membuat bumi berhenti", "karena menghilangkan matahari", "karena menghentikan waktu"], "sulit"),
        () => makeQuestion("Distribusi dalam kegiatan ekonomi berarti ... 🛒", "menyalurkan barang dari produsen ke konsumen", ["membuat barang", "memakai barang", "membuang barang"], "sulit"),
        () => makeQuestion("Sikap bijak menghadapi globalisasi adalah ... 🌐", "memanfaatkan teknologi untuk belajar dan memilih pengaruh baik", ["meniru semua hal tanpa berpikir", "menggunakan internet untuk mengganggu", "melupakan budaya sendiri"], "sulit"),
        () => makeQuestion("Jika lingkungan kotor, dampaknya adalah ... 🌳", "dapat menimbulkan penyakit dan banjir", ["udara selalu bersih", "semua orang sehat", "sampah hilang sendiri"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateMatematikaKelas6(level = "campuran") {
      const mudah = [
        () => makeQuestion("Bilangan bulat terdiri dari bilangan positif, nol, dan ... 🔢", "bilangan negatif", ["pecahan", "desimal", "persen"], "mudah"),
        () => makeQuestion("Pecahan terdiri dari pembilang dan ... 🍰", "penyebut", ["pengali", "pembagi waktu", "hasil"], "mudah"),
        () => makeQuestion("Persen berarti per ... 📊", "seratus", ["sepuluh", "seribu", "satu"], "mudah"),
        () => makeQuestion("FPB adalah singkatan dari ... 🔍", "Faktor Persekutuan Terbesar", ["Faktor Pembagi Banyak", "Faktor Perkalian Besar", "Fungsi Pecahan Bilangan"], "mudah"),
        () => makeQuestion("KPK adalah singkatan dari ... 🔍", "Kelipatan Persekutuan Terkecil", ["Keliling Persegi Kecil", "Kumpulan Pecahan Kecil", "Kelipatan Pembagi Khusus"], "mudah"),
        () => makeQuestion("Bangun ruang memiliki panjang, lebar, dan ... 📦", "tinggi", ["warna", "suara", "rasa"], "mudah"),
        () => makeQuestion("Mean disebut juga ... 📉", "rata-rata", ["nilai tengah", "nilai terbanyak", "nilai terkecil"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("5 + (-3) = ... ➕", "2", ["8", "-8", "-2"], "sedang"),
        () => makeQuestion("-4 + 10 = ... ➕", "6", ["-6", "14", "-14"], "sedang"),
        () => makeQuestion("1/3 + 1/3 = ... 🍕", "2/3", ["1/6", "2/6", "3/3"], "sedang"),
        () => makeQuestion("3/5 - 1/5 = ... 🍰", "2/5", ["4/5", "2/10", "1/5"], "sedang"),
        () => makeQuestion("50% sama dengan ... 📊", "1/2", ["1/4", "3/4", "1/5"], "sedang"),
        () => makeQuestion("FPB dari 12 dan 18 adalah ... 🔍", "6", ["3", "12", "18"], "sedang"),
        () => makeQuestion("KPK dari 4 dan 6 adalah ... 🔍", "12", ["6", "24", "10"], "sedang"),
        () => makeQuestion("Keliling persegi dengan sisi 5 cm adalah ... 📏", "20 cm", ["10 cm", "25 cm", "15 cm"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Luas persegi dengan sisi 8 cm adalah ... 📐", "64 cm²", ["32 cm²", "16 cm²", "80 cm²"], "sulit"),
        () => makeQuestion("Volume kubus dengan sisi 4 cm adalah ... 📦", "64 cm³", ["16 cm³", "32 cm³", "48 cm³"], "sulit"),
        () => makeQuestion("Volume balok dengan panjang 6 cm, lebar 4 cm, dan tinggi 3 cm adalah ... 📦", "72 cm³", ["13 cm³", "24 cm³", "48 cm³"], "sulit"),
        () => makeQuestion("Jika skala peta 1:1000, maka 2 cm pada peta sama dengan ... 🗺️", "2000 cm sebenarnya", ["1000 cm sebenarnya", "200 cm sebenarnya", "20 cm sebenarnya"], "sulit"),
        () => makeQuestion("Kecepatan 60 km/jam artinya ... 🚗", "menempuh 60 km dalam 1 jam", ["menempuh 1 km dalam 60 jam", "menempuh 60 meter dalam 1 hari", "berhenti selama 60 menit"], "sulit"),
        () => makeQuestion("Debit 10 liter/menit artinya ... 💧", "10 liter air mengalir setiap 1 menit", ["1 liter air mengalir setiap 10 jam", "10 liter air diam", "air habis dalam 10 detik"], "sulit"),
        () => makeQuestion("Mean dari 70, 80, dan 90 adalah ... 📉", "80", ["70", "75", "90"], "sulit"),
        () => makeQuestion("Median dari data 4, 6, 8 adalah ... 📉", "6", ["4", "8", "18"], "sulit"),
        () => makeQuestion("Modus dari data 2, 3, 3, 4, 5 adalah ... 📉", "3", ["2", "4", "5"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePancasilaKelas6(level = "campuran") {
      const mudah = [
        () => makeQuestion("Pancasila adalah dasar negara ... 🇮🇩", "Indonesia", ["Malaysia", "Jepang", "Australia"], "mudah"),
        () => makeQuestion("Sila pertama mengajarkan kita untuk ... 🙏", "percaya dan bertakwa kepada Tuhan", ["bertengkar", "curang", "mengejek"], "mudah"),
        () => makeQuestion("Sila kedua mengajarkan sikap ... ❤️", "menghormati sesama manusia", ["membeda-bedakan", "mengejek", "menyakiti"], "mudah"),
        () => makeQuestion("Sila ketiga berbunyi ... 🤝", "Persatuan Indonesia", ["Keadilan Sosial", "Ketuhanan Yang Maha Esa", "Musyawarah"], "mudah"),
        () => makeQuestion("Hak adalah sesuatu yang kita ... 📖", "terima", ["buang", "rusak", "hindari"], "mudah"),
        () => makeQuestion("Kewajiban adalah sesuatu yang harus kita ... ✅", "lakukan", ["abaikan", "tinggalkan", "lupakan"], "mudah"),
        () => makeQuestion("Gotong royong berarti bekerja ... 🤝", "bersama-sama", ["sendiri-sendiri", "asal-asalan", "dengan marah"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Sila keempat mengajarkan kita untuk ... 🗳️", "bermusyawarah", ["memaksakan kehendak", "bertengkar", "menang sendiri"], "sedang"),
        () => makeQuestion("Sila kelima mengajarkan sikap ... ⚖️", "adil", ["curang", "pilih kasih", "egois"], "sedang"),
        () => makeQuestion("Norma adalah aturan yang berlaku dalam ... 📜", "masyarakat", ["permainan saja", "gambar", "angka"], "sedang"),
        () => makeQuestion("Demokrasi di sekolah dapat dilakukan saat ... 🗳️", "memilih ketua kelas", ["mencoret meja", "membuang sampah", "berlari di kelas"], "sedang"),
        () => makeQuestion("Keragaman budaya Indonesia harus ... 🎭", "dihargai", ["diejek", "dilupakan", "dirusak"], "sedang"),
        () => makeQuestion("Globalisasi dipercepat oleh perkembangan ... 🌐", "teknologi dan internet", ["batu dan pasir", "tanah dan daun", "meja dan kursi"], "sedang"),
        () => makeQuestion("Pelajar Pancasila harus bersikap ... 🌟", "jujur, mandiri, kreatif, dan gotong royong", ["curang dan malas", "egois dan kasar", "tidak peduli"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa toleransi beragama penting? 🙏", "agar hidup rukun dan saling menghormati", ["agar boleh memaksa agama", "agar bisa mengejek", "agar teman takut"], "sulit"),
        () => makeQuestion("Jika keputusan musyawarah berbeda dengan pendapatmu, sikap yang tepat adalah ... 🗳️", "menerima keputusan bersama", ["marah", "memaksa teman", "meninggalkan kelompok"], "sulit"),
        () => makeQuestion("Mengapa hak dan kewajiban harus seimbang? ⚖️", "agar kehidupan tertib dan adil", ["agar hanya meminta hak", "agar kewajiban diabaikan", "agar aturan tidak berlaku"], "sulit"),
        () => makeQuestion("Contoh sikap sesuai sila ketiga adalah ... 🤝", "gotong royong membersihkan lingkungan", ["bertengkar", "membeda-bedakan teman", "mengejek budaya lain"], "sulit"),
        () => makeQuestion("Pemilihan ketua kelas yang demokratis harus dilakukan dengan ... 🗳️", "jujur dan adil", ["curang", "paksaan", "ancaman"], "sulit"),
        () => makeQuestion("Sikap bijak menghadapi globalisasi adalah ... 🌐", "memanfaatkan teknologi untuk belajar dan memilih pengaruh baik", ["meniru semua hal tanpa berpikir", "menggunakan internet untuk mengganggu", "melupakan budaya sendiri"], "sulit"),
        () => makeQuestion("Mengapa hak anak harus dilindungi? 👧👦", "agar anak dapat tumbuh, belajar, dan merasa aman", ["agar anak tidak belajar", "agar hak orang lain diabaikan", "agar aturan tidak diperlukan"], "sulit"),
        () => makeQuestion("Contoh menjadi Pelajar Pancasila adalah ... 🌟", "rajin belajar, jujur, membantu teman, dan menghargai perbedaan", ["malas, curang, dan mengejek", "tidak peduli teman", "melanggar aturan"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generatePJOKKelas6(level = "campuran") {
      const mudah = [
        () => makeQuestion("PJOK membantu tubuh menjadi ... 🏃", "sehat, kuat, dan bugar", ["lemah", "malas", "mudah sakit"], "mudah"),
        () => makeQuestion("Kebugaran jasmani berarti tubuh mampu beraktivitas tanpa ... 💪", "cepat lelah", ["bergerak", "bernapas", "belajar"], "mudah"),
        () => makeQuestion("Gerak lokomotor adalah gerakan ... 🚶", "berpindah tempat", ["diam di tempat", "tanpa alat", "sambil tidur"], "mudah"),
        () => makeQuestion("Gerak non lokomotor dilakukan ... 🤸", "tanpa berpindah tempat", ["berlari jauh", "berpindah kelas", "melompat maju"], "mudah"),
        () => makeQuestion("Gerak manipulatif menggunakan ... ⚽", "alat atau benda", ["warna", "angka", "suara"], "mudah"),
        () => makeQuestion("Pemanasan dilakukan sebelum olahraga untuk ... 🔥", "mencegah cedera", ["membuat tubuh kaku", "membuat malas", "membuat sakit"], "mudah"),
        () => makeQuestion("Sportivitas berarti bermain dengan ... 🏆", "jujur", ["curang", "marah", "mengejek"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Atletik meliputi cabang olahraga ... 🏅", "lari, lompat, dan lempar", ["renang, tidur, makan", "gambar, warna, garis", "lagu, tari, musik"], "sedang"),
        () => makeQuestion("Permainan bola besar contohnya ... ⚽", "sepak bola, basket, dan voli", ["kasti, tenis, bulutangkis", "catur, congklak, kartu", "lari, lompat, lempar"], "sedang"),
        () => makeQuestion("Permainan bola kecil contohnya ... ⚾", "kasti, bulutangkis, dan tenis", ["sepak bola, basket, voli", "renang, senam, lari", "tidur, makan, mandi"], "sedang"),
        () => makeQuestion("Senam irama dilakukan mengikuti ... 🎶", "musik atau irama", ["warna baju", "angka", "gambar"], "sedang"),
        () => makeQuestion("Renang melatih kekuatan otot dan ... 🏊", "pernapasan", ["membaca", "menggambar", "berhitung"], "sedang"),
        () => makeQuestion("Pola hidup sehat dilakukan dengan ... 🍎", "makan bergizi, olahraga, dan tidur cukup", ["makan permen terus", "begadang", "tidak mandi"], "sedang"),
        () => makeQuestion("Kebersihan diri membantu mencegah ... 🧼", "penyakit", ["kesehatan", "semangat", "kebugaran"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa pemanasan dan pendinginan penting dalam olahraga? 🔥", "agar tubuh siap bergerak dan tidak mudah cedera", ["agar tubuh cepat sakit", "agar olahraga lebih berbahaya", "agar tubuh kaku"], "sulit"),
        () => makeQuestion("Mengapa kerja sama penting dalam permainan bola besar? ⚽", "karena permainan tim membutuhkan kekompakan", ["agar bisa bermain sendiri", "agar teman tidak ikut", "agar permainan kacau"], "sulit"),
        () => makeQuestion("Jika kalah dalam pertandingan, sikap sportif adalah ... 🏆", "menerima hasil dan menghargai lawan", ["marah", "menyalahkan teman", "curang"], "sulit"),
        () => makeQuestion("Mengapa keselamatan penting saat berenang? 🏊", "karena air bisa berbahaya jika tidak hati-hati", ["agar bisa bercanda berlebihan", "agar tidak perlu aturan", "agar berenang sendirian"], "sulit"),
        () => makeQuestion("Jika teman cedera saat olahraga, sikap yang tepat adalah ... 🛑", "menolong dan memberi tahu guru", ["menertawakan", "meninggalkan", "memarahinya"], "sulit"),
        () => makeQuestion("Contoh menjaga kebersihan diri setelah olahraga adalah ... 🧼", "mandi, ganti baju, dan mencuci tangan", ["langsung tidur tanpa mandi", "tidak ganti baju", "makan tanpa cuci tangan"], "sulit"),
        () => makeQuestion("Mengapa tubuh perlu tidur cukup? 😴", "agar tubuh pulih dan tetap sehat", ["agar semakin lelah", "agar mudah sakit", "agar tidak fokus"], "sulit"),
        () => makeQuestion("Cara menghindari cedera saat olahraga adalah ... 👟", "mengikuti aturan, memakai alat dengan benar, dan tidak ceroboh", ["mendorong teman", "bermain kasar", "mengabaikan guru"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    function generateSeniBudayaKelas6(level = "campuran") {
      const mudah = [
        () => makeQuestion("Seni budaya mencerminkan ... 🎨", "identitas suatu daerah atau bangsa", ["rumus matematika", "aturan olahraga", "harga barang"], "mudah"),
        () => makeQuestion("Unsur seni rupa antara lain ... 🌈", "garis, warna, bentuk, tekstur, ruang, dan titik", ["angka, uang, waktu", "lari, lompat, lempar", "hak dan kewajiban"], "mudah"),
        () => makeQuestion("Seni lukis dibuat menggunakan ... 🖌️", "cat atau media warna", ["bola", "sepatu", "uang"], "mudah"),
        () => makeQuestion("Kolase dibuat dengan cara ... ✂️", "menempel bahan", ["berlari", "menghitung", "menendang"], "mudah"),
        () => makeQuestion("Tempo adalah ... 🎼", "cepat lambatnya lagu", ["besar kecilnya gambar", "panjang pendek meja", "berat ringannya tas"], "mudah"),
        () => makeQuestion("Tari tradisional berasal dari ... 💃", "daerah tertentu", ["angka tertentu", "rumus tertentu", "alat tulis"], "mudah"),
        () => makeQuestion("Batik adalah kain khas ... 👘", "Indonesia", ["Jepang", "Australia", "Malaysia"], "mudah")
      ];
    
      const sedang = [
        () => makeQuestion("Menggambar bentuk berarti menggambar benda sesuai ... ✏️", "bentuk aslinya", ["harga aslinya", "suara aslinya", "rasa aslinya"], "sedang"),
        () => makeQuestion("Musik tradisional menggunakan alat musik khas ... 🎵", "daerah", ["angka", "rumus", "warna"], "sedang"),
        () => makeQuestion("Saat bernyanyi perlu memperhatikan ... 🎤", "nada, tempo, dan pernapasan", ["harga, ukuran, dan warna", "angka, tabel, dan rumus", "garis, luas, dan volume"], "sedang"),
        () => makeQuestion("Pola lantai tari adalah ... 👣", "garis yang dilalui penari", ["warna pakaian", "harga tiket", "nama alat tulis"], "sedang"),
        () => makeQuestion("Kerajinan dibuat dengan ... 🧵", "keterampilan tangan", ["tidur", "berlari", "membaca saja"], "sedang"),
        () => makeQuestion("Pameran seni bertujuan untuk ... 🎪", "menampilkan dan memperkenalkan karya seni", ["menyembunyikan karya", "merusak karya", "membuang karya"], "sedang"),
        () => makeQuestion("Apresiasi seni berarti ... 🌟", "menghargai karya seni", ["mengejek karya", "merusak karya", "mencoret karya"], "sedang")
      ];
    
      const sulit = [
        () => makeQuestion("Mengapa seni budaya perlu dilestarikan? 🇮🇩", "agar kekayaan bangsa tidak hilang", ["agar budaya dilupakan", "agar karya dirusak", "agar orang tidak kreatif"], "sulit"),
        () => makeQuestion("Mengapa unsur seni rupa penting dalam membuat karya? 🎨", "karena membantu karya terlihat indah dan bermakna", ["agar karya rusak", "agar warna hilang", "agar gambar tidak selesai"], "sulit"),
        () => makeQuestion("Mengapa kolase dan mozaik melatih ketelitian? ✂️", "karena bahan kecil harus disusun dengan rapi", ["karena bahannya dibuang", "karena tidak perlu berpikir", "karena semua karya harus sama"], "sulit"),
        () => makeQuestion("Mengapa tempo dan irama penting dalam musik? 🎼", "agar lagu terdengar teratur dan indah", ["agar lagu kacau", "agar suara hilang", "agar tidak perlu bernyanyi"], "sulit"),
        () => makeQuestion("Mengapa pola lantai penting dalam tari? 👣", "agar tarian terlihat rapi dan indah", ["agar penari bingung", "agar tari berhenti", "agar musik tidak terdengar"], "sulit"),
        () => makeQuestion("Batik disebut warisan budaya karena ... 👘", "memiliki nilai seni dan tradisi Indonesia", ["hanya kain biasa tanpa makna", "tidak perlu dijaga", "bukan karya bangsa"], "sulit"),
        () => makeQuestion("Jika melihat karya seni teman, sikap yang tepat adalah ... 😊", "menghargai dan memberi pujian baik", ["mengejek", "mencoret", "merusak"], "sulit"),
        () => makeQuestion("Contoh melestarikan seni budaya Indonesia adalah ... 🌟", "belajar tari daerah, memakai batik, dan menyanyikan lagu daerah", ["mengejek lagu daerah", "melupakan budaya", "merusak alat musik"], "sulit")
      ];
    
      const all = { mudah, sedang, sulit };
    
      if (level === "campuran" || level === "semua") {
        return pick([...mudah, ...sedang, ...sulit])();
      }
    
      return pick(all[level] || mudah)();
    }

    window.SD_AI_QUIZ.generate = function ({ grade, subject, level = "campuran", total = 25 }) {
      const result = [];

      if (String(grade) === "1" && subject === "Bahasa Indonesia") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateBahasaIndonesiaKelas1("mudah");
              if (r < 0.8) return generateBahasaIndonesiaKelas1("sedang");
              return generateBahasaIndonesiaKelas1("sulit");
            }
      
            return generateBahasaIndonesiaKelas1(level);
          }
        });
      }

      if (String(grade) === "1" && subject === "Bahasa Jawa") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateBahasaJawaKelas1("mudah");
              if (r < 0.8) return generateBahasaJawaKelas1("sedang");
              return generateBahasaJawaKelas1("sulit");
            }
      
            return generateBahasaJawaKelas1(level);
          }
        });
      }

      if (String(grade) === "1" && subject === "Matematika") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateMatematikaKelas1("mudah");
              if (r < 0.8) return generateMatematikaKelas1("sedang");
              return generateMatematikaKelas1("sulit");
            }
      
            return generateMatematikaKelas1(level);
          }
        });
      }

      if (String(grade) === "1" && subject === "Pendidikan Pancasila") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generatePancasilaKelas1("mudah");
              if (r < 0.8) return generatePancasilaKelas1("sedang");
              return generatePancasilaKelas1("sulit");
            }
      
            return generatePancasilaKelas1(level);
          }
        });
      }

      if (String(grade) === "1" && subject === "PJOK") {
        const result = [];
      
        function pushMany(type, count) {
          for (let i = 0; i < count; i++) {
            result.push(generatePJOKKelas1(type));
          }
        }
      
        if (level === "campuran" || level === "semua") {
          const mudahCount = Math.floor(total * 0.4);
          const sedangCount = Math.floor(total * 0.4);
          const sulitCount = total - mudahCount - sedangCount;
      
          pushMany("mudah", mudahCount);
          pushMany("sedang", sedangCount);
          pushMany("sulit", sulitCount);
        } else {
          pushMany(level, total);
        }
      
        return shuffle(result);
      }

      if (String(grade) === "1" && subject === "Seni dan Budaya") {
        const result = [];
      
        function pushMany(type, count) {
          for (let i = 0; i < count; i++) {
            result.push(generateSeniBudayaKelas1(type));
          }
        }
      
        if (level === "campuran" || level === "semua") {
          const mudahCount = Math.floor(total * 0.4);
          const sedangCount = Math.floor(total * 0.4);
          const sulitCount = total - mudahCount - sedangCount;
      
          pushMany("mudah", mudahCount);
          pushMany("sedang", sedangCount);
          pushMany("sulit", sulitCount);
        } else {
          pushMany(level, total);
        }
      
        return shuffle(result);
      }

      if (String(grade) === "2" && subject === "Bahasa Indonesia") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateBahasaIndonesiaKelas2("mudah");
              if (r < 0.8) return generateBahasaIndonesiaKelas2("sedang");
              return generateBahasaIndonesiaKelas2("sulit");
            }
      
            return generateBahasaIndonesiaKelas2(level);
          }
        });
      }

      if (String(grade) === "2" && subject === "Bahasa Jawa") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateBahasaJawaKelas2("mudah");
              if (r < 0.8) return generateBahasaJawaKelas2("sedang");
              return generateBahasaJawaKelas2("sulit");
            }
      
            return generateBahasaJawaKelas2(level);
          }
        });
      }

      if (String(grade) === "2" && subject === "Matematika") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateMatematikaKelas2("mudah");
              if (r < 0.8) return generateMatematikaKelas2("sedang");
              return generateMatematikaKelas2("sulit");
            }
      
            return generateMatematikaKelas2(level);
          }
        });
      }

      if (String(grade) === "2" && subject === "Pendidikan Pancasila") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generatePancasilaKelas2("mudah");
              if (r < 0.8) return generatePancasilaKelas2("sedang");
              return generatePancasilaKelas2("sulit");
            }
      
            return generatePancasilaKelas2(level);
          }
        });
      }

      if (String(grade) === "2" && subject === "PJOK") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generatePJOKKelas2("mudah");
              if (r < 0.8) return generatePJOKKelas2("sedang");
              return generatePJOKKelas2("sulit");
            }
      
            return generatePJOKKelas2(level);
          }
        });
      }

      if (String(grade) === "2" && subject === "Seni dan Budaya") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateSeniBudayaKelas2("mudah");
              if (r < 0.8) return generateSeniBudayaKelas2("sedang");
              return generateSeniBudayaKelas2("sulit");
            }
      
            return generateSeniBudayaKelas2(level);
          }
        });
      }

      if (String(grade) === "3" && subject === "Bahasa Indonesia") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateBahasaIndonesiaKelas3("mudah");
              if (r < 0.8) return generateBahasaIndonesiaKelas3("sedang");
              return generateBahasaIndonesiaKelas3("sulit");
            }
      
            return generateBahasaIndonesiaKelas3(level);
          }
        });
      }

      if (String(grade) === "3" && subject === "Bahasa Jawa") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateBahasaJawaKelas3("mudah");
              if (r < 0.8) return generateBahasaJawaKelas3("sedang");
              return generateBahasaJawaKelas3("sulit");
            }
      
            return generateBahasaJawaKelas3(level);
          }
        });
      }

      if (String(grade) === "3" && subject === "Matematika") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateMatematikaKelas3("mudah");
              if (r < 0.8) return generateMatematikaKelas3("sedang");
              return generateMatematikaKelas3("sulit");
            }
      
            return generateMatematikaKelas3(level);
          }
        });
      }
      if (String(grade) === "3" && subject === "Pendidikan Pancasila") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generatePancasilaKelas3("mudah");
              if (r < 0.8) return generatePancasilaKelas3("sedang");
              return generatePancasilaKelas3("sulit");
            }
      
            return generatePancasilaKelas3(level);
          }
        });
      }

      if (String(grade) === "3" && subject === "PJOK") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generatePJOKKelas3("mudah");
              if (r < 0.8) return generatePJOKKelas3("sedang");
              return generatePJOKKelas3("sulit");
            }
      
            return generatePJOKKelas3(level);
          }
        });
      }

      if (String(grade) === "3" && subject === "Seni dan Budaya") {
        return generateUniqueQuestions({
          grade,
          subject,
          level,
          total,
          generator: () => {
            if (level === "campuran" || level === "semua") {
              const r = Math.random();
      
              if (r < 0.4) return generateSeniBudayaKelas3("mudah");
              if (r < 0.8) return generateSeniBudayaKelas3("sedang");
              return generateSeniBudayaKelas3("sulit");
            }
      
            return generateSeniBudayaKelas3(level);
          }
        });
      }

if (String(grade) === "4" && subject === "Bahasa Indonesia") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateBahasaIndonesiaKelas4("mudah");
        if (r < 0.8) return generateBahasaIndonesiaKelas4("sedang");
        return generateBahasaIndonesiaKelas4("sulit");
      }

      return generateBahasaIndonesiaKelas4(level);
    }
  });

}

if (String(grade) === "4" && subject === "Bahasa Jawa") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateBahasaJawaKelas4("mudah");
        if (r < 0.8) return generateBahasaJawaKelas4("sedang");
        return generateBahasaJawaKelas4("sulit");
      }

      return generateBahasaJawaKelas4(level);
    }
  });

}

if (String(grade) === "4" && subject === "Ilmu Pengetahuan Alam dan Sosial (IPAS)") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateIPASKelas4("mudah");
        if (r < 0.8) return generateIPASKelas4("sedang");
        return generateIPASKelas4("sulit");
      }

      return generateIPASKelas4(level);
    }
  });
}

if (String(grade) === "4" && subject === "Matematika") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateMatematikaKelas4("mudah");
        if (r < 0.8) return generateMatematikaKelas4("sedang");
        return generateMatematikaKelas4("sulit");
      }

      return generateMatematikaKelas4(level);
    }
  });
}

if (String(grade) === "4" && subject === "Pendidikan Pancasila") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generatePancasilaKelas4("mudah");
        if (r < 0.8) return generatePancasilaKelas4("sedang");
        return generatePancasilaKelas4("sulit");
      }

      return generatePancasilaKelas4(level);
    }
  });
}

if (String(grade) === "4" && subject === "PJOK") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generatePJOKKelas4("mudah");
        if (r < 0.8) return generatePJOKKelas4("sedang");
        return generatePJOKKelas4("sulit");
      }

      return generatePJOKKelas4(level);
    }
  });
}

if (String(grade) === "4" && subject === "Seni dan Budaya") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateSeniBudayaKelas4("mudah");
        if (r < 0.8) return generateSeniBudayaKelas4("sedang");
        return generateSeniBudayaKelas4("sulit");
      }

      return generateSeniBudayaKelas4(level);
    }
  });
}

if (String(grade) === "5" && subject === "Bahasa Indonesia") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateBahasaIndonesiaKelas5("mudah");
        if (r < 0.8) return generateBahasaIndonesiaKelas5("sedang");
        return generateBahasaIndonesiaKelas5("sulit");
      }

      return generateBahasaIndonesiaKelas5(level);
    }
  });
}

if (String(grade) === "5" && subject === "Bahasa Jawa") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateBahasaJawaKelas5("mudah");
        if (r < 0.8) return generateBahasaJawaKelas5("sedang");
        return generateBahasaJawaKelas5("sulit");
      }

      return generateBahasaJawaKelas5(level);
    }
  });
}

if (String(grade) === "5" && subject === "Ilmu Pengetahuan Alam dan Sosial (IPAS)") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateIPASKelas5("mudah");
        if (r < 0.8) return generateIPASKelas5("sedang");
        return generateIPASKelas5("sulit");
      }

      return generateIPASKelas5(level);
    }
  });
}

if (String(grade) === "5" && subject === "Matematika") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateMatematikaKelas5("mudah");
        if (r < 0.8) return generateMatematikaKelas5("sedang");
        return generateMatematikaKelas5("sulit");
      }

      return generateMatematikaKelas5(level);
    }
  });
}

if (String(grade) === "5" && subject === "Pendidikan Pancasila") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generatePancasilaKelas5("mudah");
        if (r < 0.8) return generatePancasilaKelas5("sedang");
        return generatePancasilaKelas5("sulit");
      }

      return generatePancasilaKelas5(level);
    }
  });
}

if (String(grade) === "5" && subject === "PJOK") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generatePJOKKelas5("mudah");
        if (r < 0.8) return generatePJOKKelas5("sedang");
        return generatePJOKKelas5("sulit");
      }

      return generatePJOKKelas5(level);
    }
  });
}

if (String(grade) === "5" && subject === "Seni dan Budaya") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateSeniBudayaKelas5("mudah");
        if (r < 0.8) return generateSeniBudayaKelas5("sedang");
        return generateSeniBudayaKelas5("sulit");
      }

      return generateSeniBudayaKelas5(level);
    }
  });
}

if (String(grade) === "6" && subject === "Bahasa Indonesia") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateBahasaIndonesiaKelas6("mudah");
        if (r < 0.8) return generateBahasaIndonesiaKelas6("sedang");
        return generateBahasaIndonesiaKelas6("sulit");
      }

      return generateBahasaIndonesiaKelas6(level);
    }
  });
}

if (String(grade) === "6" && subject === "Bahasa Jawa") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateBahasaJawaKelas6("mudah");
        if (r < 0.8) return generateBahasaJawaKelas6("sedang");
        return generateBahasaJawaKelas6("sulit");
      }

      return generateBahasaJawaKelas6(level);
    }
  });
}

if (String(grade) === "6" && subject === "Ilmu Pengetahuan Alam dan Sosial (IPAS)") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateIPASKelas6("mudah");
        if (r < 0.8) return generateIPASKelas6("sedang");
        return generateIPASKelas6("sulit");
      }

      return generateIPASKelas6(level);
    }
  });
}

if (String(grade) === "6" && subject === "Matematika") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateMatematikaKelas6("mudah");
        if (r < 0.8) return generateMatematikaKelas6("sedang");
        return generateMatematikaKelas6("sulit");
      }

      return generateMatematikaKelas6(level);
    }
  });
}

if (String(grade) === "6" && subject === "Pendidikan Pancasila") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generatePancasilaKelas6("mudah");
        if (r < 0.8) return generatePancasilaKelas6("sedang");
        return generatePancasilaKelas6("sulit");
      }

      return generatePancasilaKelas6(level);
    }
  });
}

if (String(grade) === "6" && subject === "PJOK") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generatePJOKKelas6("mudah");
        if (r < 0.8) return generatePJOKKelas6("sedang");
        return generatePJOKKelas6("sulit");
      }

      return generatePJOKKelas6(level);
    }
  });
}

if (String(grade) === "6" && subject === "Seni dan Budaya") {
  return generateUniqueQuestions({
    grade,
    subject,
    level,
    total,
    generator: () => {
      if (level === "campuran" || level === "semua") {
        const r = Math.random();

        if (r < 0.4) return generateSeniBudayaKelas6("mudah");
        if (r < 0.8) return generateSeniBudayaKelas6("sedang");
        return generateSeniBudayaKelas6("sulit");
      }

      return generateSeniBudayaKelas6(level);
    }
  });
}

      return generateFromMateri({ grade, subject, level, total });
    };
  })();