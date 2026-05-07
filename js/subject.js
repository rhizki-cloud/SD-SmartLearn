// js/subject.js
(function () {
  "use strict";

  const userName = (localStorage.getItem("sd_name") || "").trim();
  if (userName) window.SDAPP?.setActiveUserIdFromName?.(userName);

  const gradeKey = window.SDAPP?.userKey?.("grade") || "sd_grade";
  const params = new URLSearchParams(location.search);

  let grade = params.get("grade") || localStorage.getItem(gradeKey) || "1";
  if (params.get("grade")) localStorage.setItem(gradeKey, grade);

  const gradeBadge = document.getElementById("gradeBadge");
  const subjectList = document.getElementById("subjectList");
  const titleEl = document.getElementById("subjectTitle");
  const descEl = document.getElementById("subjectDesc");
  const materialBox = document.getElementById("materialBox");
  const quizBox = document.getElementById("quizBox");
  const markDoneBtn = document.getElementById("markDoneBtn");

  const content = window.SD_CONTENT || {};
  const subjectsByGrade = content.subjectsByGrade || {};
  const subjectsMeta = content.subjectsMeta || {};
  const materi = content.materi || {};
  const kuis = content.kuis || {};

  let currentBabIndex = 0;
  let currentBabList = [];

  function cleanAudioText(text) {
    return window.SD_AUDIO?.cleanText
      ? window.SD_AUDIO.cleanText(text)
      : String(text || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  }

  function getProgressNow() {
    return window.SDAPP?.getProgress?.() || {};
  }

  function setDone(subjectId) {
    const key = `${grade}_${subjectId}`;
    const p = getProgressNow();
    p[key] = true;
    window.SDAPP?.setProgress?.(p);
  }

  function getSubjectsByGrade(g) {
    return (subjectsByGrade[g] || []).map((id) => ({
      id,
      icon: subjectsMeta[id]?.icon || "📘",
      desc: subjectsMeta[id]?.desc || ""
    }));
  }

  function renderBadge() {
    if (!gradeBadge) return;

    const phase = window.SD_CONTENT?.curriculum?.grades?.[grade]?.phase;
    gradeBadge.textContent = phase ? `Kelas ${grade} • ${phase}` : `Kelas ${grade}`;
  }

  function renderSubjects() {
    if (!subjectList) return;

    subjectList.innerHTML = "";

    const progress = getProgressNow();
    const subjects = getSubjectsByGrade(grade);

    subjects.forEach((s) => {
      const key = `${grade}_${s.id}`;
      const done = !!progress[key];

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "list-group-item list-group-item-action d-flex justify-content-between align-items-center";

      btn.innerHTML = `
        <span>${s.icon} ${s.id}</span>
        <span class="badge ${done ? "text-bg-success" : "text-bg-light border"}">
          ${done ? "Selesai" : "Belum"}
        </span>
      `;

      btn.onclick = () => openSubject(s);
      subjectList.appendChild(btn);
    });

    if (!subjects.length) {
      subjectList.innerHTML = `<div class="text-muted small">Belum ada mapel untuk kelas ${grade}.</div>`;
    }
  }

  function renderMaterial(data, subjectId) {
    if (!materialBox) return;

    currentBabIndex = 0;
    currentBabList = [];

    if (!data || !Array.isArray(data) || data.length === 0) {
      materialBox.innerHTML = `
        <div class="text-muted">
          Materi belum diisi. Tambahkan di 
          <code>window.SD_CONTENT.materi["${grade}"]["${subjectId}"]</code>.
        </div>
      `;
      updateBabNav();
      return;
    }

    if (typeof data[0] === "string") {
      currentBabList = [
        {
          judul: "Ringkasan Materi",
          paragraf: data.join("\n")
        }
      ];
    } else {
      currentBabList = data;
    }

    renderCurrentBab();
  }

  function renderCurrentBab() {
    if (!materialBox) return;

    const bab = currentBabList[currentBabIndex];

    if (!bab) {
      materialBox.innerHTML = `<div class="text-muted">Bab belum tersedia.</div>`;
      updateBabNav();
      return;
    }

    const judulText = bab.judul || `Bab ${currentBabIndex + 1}`;

    const judul = `<h3 class="bab-title">${judulText}</h3>`;

    const paragraf = bab.paragraf
      ? `<div class="bab-body">${String(bab.paragraf)
          .split("\n")
          .filter(Boolean)
          .map((p) => `<p>${String(p).replace(/<audio[\s\S]*?<\/audio>/gi, "")}</p>`)
          .join("")}</div>`
      : "";

    const contoh =
      Array.isArray(bab.contoh) && bab.contoh.length
        ? `<div class="bab-extra">
            <div class="fw-bold mb-1">Contoh:</div>
            <ul>${bab.contoh.map((c) => `<li>${c}</li>`).join("")}</ul>
          </div>`
        : "";

    const ayoIngat = bab.ayoIngat
      ? `<div class="alert alert-warning py-2 px-3 mb-3">
          <b>Ayo ingat:</b> ${bab.ayoIngat}
        </div>`
      : "";

    const latihan =
      Array.isArray(bab.latihanMini) && bab.latihanMini.length
        ? `<div class="bab-extra">
            <div class="fw-bold mb-1">Latihan mini:</div>
            <ul>${bab.latihanMini.map((t) => `<li>${t}</li>`).join("")}</ul>
          </div>`
        : "";

    const audioText = cleanAudioText([
      judulText,
      bab.paragraf || "",
      Array.isArray(bab.contoh) ? `Contoh. ${bab.contoh.join(". ")}` : "",
      bab.ayoIngat ? `Ayo ingat. ${bab.ayoIngat}` : "",
      Array.isArray(bab.latihanMini) ? `Latihan mini. ${bab.latihanMini.join(". ")}` : ""
    ].join(". "));

    materialBox.innerHTML = `
      <div class="bab-card">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div>${judul}</div>
          <button 
            type="button" 
            class="btn-audio-materi" 
            id="readMaterialBtn"
            data-audio="${encodeURIComponent(audioText)}"
          >
            🔊 Dengar
          </button>
        </div>

        ${paragraf}
        ${contoh}
        ${ayoIngat}
        ${latihan}
      </div>
    `;

    materialBox.querySelector("#readMaterialBtn")?.addEventListener("click", () => {
      const text = decodeURIComponent(
        materialBox.querySelector("#readMaterialBtn")?.getAttribute("data-audio") || ""
      );
      window.SD_AUDIO?.speak?.(text);
    });

    updateBabNav();
  }

  function updateBabNav() {
    const prevBtn = document.getElementById("prevBabBtn");
    const nextBtn = document.getElementById("nextBabBtn");
    const counter = document.getElementById("babCounter");

    const total = currentBabList.length || 1;

    if (counter) counter.textContent = `Bab ${currentBabIndex + 1}/${total}`;
    if (prevBtn) prevBtn.disabled = currentBabIndex <= 0;
    if (nextBtn) nextBtn.disabled = currentBabIndex >= total - 1;
  }

  const prevBabBtn = document.getElementById("prevBabBtn");
  const nextBabBtn = document.getElementById("nextBabBtn");

  if (prevBabBtn) {
    prevBabBtn.onclick = () => {
      if (currentBabIndex > 0) {
        window.SD_AUDIO?.stop?.();
        currentBabIndex--;
        renderCurrentBab();
      }
    };
  }

  if (nextBabBtn) {
    nextBabBtn.onclick = () => {
      if (currentBabIndex < currentBabList.length - 1) {
        window.SD_AUDIO?.stop?.();
        currentBabIndex++;
        renderCurrentBab();
      }
    };
  }

  function shuffleArray(arr) {
    const a = arr.slice();

    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  function shuffleOptions(question) {
    const pairs = (question.a || []).map((text, idx) => ({ text, idx }));
    const mixed = shuffleArray(pairs);
    const newCorrect = mixed.findIndex((p) => p.idx === question.correct);

    return {
      ...question,
      a: mixed.map((p) => p.text),
      correct: newCorrect
    };
  }

  function renderQuiz(itemsRaw, subjectId) {
    if (!quizBox) return;

    itemsRaw = itemsRaw || [];

    quizBox.innerHTML = `
      <div class="quiz-controls mb-3">
        <div class="quiz-left">
          <div class="quiz-field">
            <label class="form-label small mb-1">Tingkat</label>
            <select class="form-select form-select-sm" id="levelSelect">
              <option value="semua">Semua</option>
              <option value="mudah">Mudah</option>
              <option value="sedang">Sedang</option>
              <option value="sulit">Sulit</option>
            </select>
          </div>

          <label class="form-check small quiz-check">
            <input class="form-check-input" type="checkbox" id="shuffleCheck" checked>
            <span class="form-check-label">Acak soal</span>
          </label>
        </div>

        <button class="btn btn-outline-primary btn-sm quiz-start" id="startQuizBtn">Mulai</button>
      </div>

      <div id="quizInner"></div>
    `;

    const levelSelect = quizBox.querySelector("#levelSelect");
    const shuffleCheck = quizBox.querySelector("#shuffleCheck");
    const startQuizBtn = quizBox.querySelector("#startQuizBtn");
    const quizInner = quizBox.querySelector("#quizInner");

    startQuizBtn.onclick = () => {
      window.SD_AUDIO?.stop?.();

      const level = levelSelect.value;

      const aiItems = window.SD_AI_QUIZ?.generate?.({
        grade,
        subject: subjectId,
        level: level === "semua" ? "campuran" : level,
        total: 25
      });

      let items = aiItems && aiItems.length ? aiItems : itemsRaw.slice();

      if (level !== "semua") {
        items = items.filter((x) => (x.level || "mudah") === level);
      }

      if (!items.length) {
        quizInner.innerHTML = `<div class="text-muted">Tidak ada soal untuk level ini.</div>`;
        return;
      }

      if (shuffleCheck.checked) items = shuffleArray(items);
      items = items.map(shuffleOptions);

      let idx = 0;
      let score = 0;
      const total = items.length;

      function draw() {
        window.SD_AUDIO?.stop?.();

        const it = items[idx];

        const badge =
          it.level === "mudah"
            ? "text-bg-success"
            : it.level === "sedang"
            ? "text-bg-warning"
            : "text-bg-danger";

        const questionAudio = cleanAudioText(it.q);

        quizInner.innerHTML = `
          <div class="d-flex justify-content-between small text-muted mb-2">
            <div>Soal ${idx + 1}/${total}</div>
            <div>Skor: ${score}</div>
          </div>

          <div class="mb-2">
            <span class="badge ${badge}">${it.level || "mudah"}</span>
          </div>

          <div class="quiz-question-row mb-2">
            <div class="fw-semibold">${it.q}</div>
            <button 
              type="button" 
              class="btn-audio-quiz" 
              id="readQuestionBtn"
              data-audio="${encodeURIComponent(questionAudio)}"
            >
              🔊
            </button>
          </div>

          <div class="d-grid gap-2">
            ${(it.a || [])
              .map(
                (opt, i) => `
                  <button class="btn btn-outline-primary text-start quiz-option-btn" data-i="${i}">
                    ${opt}
                  </button>
                `
              )
              .join("")}
          </div>
        `;

        quizInner.querySelector("#readQuestionBtn")?.addEventListener("click", () => {
          const text = decodeURIComponent(
            quizInner.querySelector("#readQuestionBtn")?.getAttribute("data-audio") || ""
          );
          window.SD_AUDIO?.speak?.(text);
        });

        quizInner.querySelectorAll("button[data-i]").forEach((btn) => {
          btn.onclick = () => {
            window.SD_AUDIO?.stop?.();

            const i = Number(btn.getAttribute("data-i"));
            const isCorrect = i === it.correct;

            if (isCorrect) {
              score++;
              window.SDAPP?.fx?.yay?.();
              window.SDAPP?.fx?.correct?.();
            } else {
              window.SDAPP?.fx?.wrong?.();
              btn.classList.add("shake");
            }

            idx++;

            if (idx >= total) {
              window.SDAPP?.level?.addXP?.(score * 10, "Kuis");

              quizInner.innerHTML = `
                <div class="fw-bold">Kuis selesai 🎉</div>
                <div>Nilai: <span class="fw-bold">${score}</span> / ${total}</div>
                <button class="btn btn-outline-primary mt-2" id="retryQuiz">Ulangi</button>
              `;

              quizInner.querySelector("#retryQuiz").onclick = () => {
                window.SD_AUDIO?.stop?.();
                idx = 0;
                score = 0;
                draw();
              };

              return;
            }

            draw();
          };
        });
      }

      draw();
    };
  }

  function openSubject(s) {
    window.SD_AUDIO?.stop?.();

    if (titleEl) titleEl.textContent = s.id;
    if (descEl) descEl.textContent = s.desc || "";

    if (markDoneBtn) {
      markDoneBtn.disabled = false;
      markDoneBtn.textContent = "✅ Selesai";
    }

    window.SDAPP?.fx?.tap?.();

    renderMaterial(materi?.[grade]?.[s.id], s.id);
    renderQuiz(kuis?.[grade]?.[s.id] || [], s.id);

    if (markDoneBtn) {
      markDoneBtn.onclick = () => {
        window.SD_AUDIO?.stop?.();

        const progressBefore = getProgressNow();
        const key = `${grade}_${s.id}`;
        const alreadyDone = !!progressBefore[key];
        
        setDone(s.id);
        renderSubjects();
        
        if (!alreadyDone) {
            window.SDAPP?.stars?.add?.(1);
            window.SDAPP?.level?.addXP?.(250, "Mapel selesai");
        }
        window.SDAPP?.fx?.yay?.();

        if (window.SDAPP?.fx?.confetti) {
          window.SDAPP.fx.confetti();
        }

        window.SDAPP?.mascot?.say?.("Hebat! Mapel selesai, kamu dapat 1 bintang ⭐", "proud");

        markDoneBtn.textContent = "🎉 Selesai!";
        markDoneBtn.disabled = true;

        setTimeout(() => {
          markDoneBtn.textContent = "✅ Sudah Selesai";
        }, 900);
      };
    }
  }

  renderBadge();
  renderSubjects();

  window.SDAPP?.ui?.renderProfileButton?.();
})();