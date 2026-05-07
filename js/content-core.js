// js/content-core.js
window.SD_CONTENT = window.SD_CONTENT || {};

Object.assign(window.SD_CONTENT, {
  curriculum: {
    grades: {
      "1": { phase: "Fase A" },
      "2": { phase: "Fase A" },
      "3": { phase: "Fase B" },
      "4": { phase: "Fase C" },
      "5": { phase: "Fase C" },
      "6": { phase: "Fase C" }
    }
  },

  subjectsByGrade: {
    "1": ["Pendidikan Pancasila","Bahasa Indonesia","Matematika","PJOK","Seni dan Budaya","Bahasa Jawa"],
    "2": ["Pendidikan Pancasila","Bahasa Indonesia","Matematika","PJOK","Seni dan Budaya","Bahasa Jawa"],
    "3": ["Pendidikan Pancasila","Bahasa Indonesia","Matematika","PJOK","Seni dan Budaya","Bahasa Jawa"],
    "4": ["Pendidikan Pancasila","Bahasa Indonesia","Matematika","Ilmu Pengetahuan Alam dan Sosial (IPAS)","PJOK","Seni dan Budaya","Bahasa Jawa"],
    "5": ["Pendidikan Pancasila","Bahasa Indonesia","Matematika","Ilmu Pengetahuan Alam dan Sosial (IPAS)","PJOK","Seni dan Budaya","Bahasa Jawa"],
    "6": ["Pendidikan Pancasila","Bahasa Indonesia","Matematika","Ilmu Pengetahuan Alam dan Sosial (IPAS)","PJOK","Seni dan Budaya","Bahasa Jawa"]
  },

  subjectsMeta: {
    "Pendidikan Pancasila": { icon: "🇮🇩", desc: "Nilai Pancasila, aturan, hak & kewajiban, dan sikap baik." },
    "Bahasa Indonesia": { icon: "📖", desc: "Membaca, menulis, menyimak, berbicara, dan memahami teks." },
    "Matematika": { icon: "➗", desc: "Bilangan, operasi hitung, bentuk, pengukuran, dan pemecahan masalah." },
    "Ilmu Pengetahuan Alam dan Sosial (IPAS)": { icon: "🌏", desc: "Fenomena alam & sosial, lingkungan, sains dasar, dan masyarakat." },
    "PJOK": { icon: "🏃", desc: "Gerak dasar, kebugaran, permainan, dan hidup sehat." },
    "Seni dan Budaya": { icon: "🎨", desc: "Menggambar, musik, tari, dan apresiasi karya." },
    "Bahasa Jawa": { icon: "🗣️", desc: "Kosakata, unggah-ungguh, cerita rakyat, dan aksara Jawa." }
  },

  materi: window.SD_CONTENT.materi || { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} },
  kuis: window.SD_CONTENT.kuis || { "1": {}, "2": {}, "3": {}, "4": {}, "5": {}, "6": {} }
});