// js/content/kelas-1/content-kelas-1.js
(function () {
    "use strict";
  
    window.SD_CONTENT = window.SD_CONTENT || {};
    SD_CONTENT.materi = SD_CONTENT.materi || {};
    SD_CONTENT.kuis = SD_CONTENT.kuis || {};
  
    SD_CONTENT.materi["5"] = SD_CONTENT.materi["5"] || {};
    SD_CONTENT.kuis["5"] = SD_CONTENT.kuis["5"] || {};
  
    window.SD_Q = window.SD_Q || function (q, a, correct, level = "mudah") {
      return { q, a, correct, level };
    };
  })();