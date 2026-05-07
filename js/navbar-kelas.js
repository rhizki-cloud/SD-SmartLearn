(function () {
  "use strict";

  const btn = document.getElementById("navKelasBtn");
  if (!btn) return;

  const name = (localStorage.getItem("sd_name") || "").trim();

  if (name) {
    window.SDAPP?.setActiveUserIdFromName?.(name);
  }

  const gradeKey = window.SDAPP?.userKey?.("grade") || "sd_grade";

  function getActiveGrade() {
    return (
      localStorage.getItem(gradeKey) ||
      localStorage.getItem("sd_grade") ||
      "1"
    );
  }

  function updateButton() {
    const grade = getActiveGrade();
    btn.textContent = `📚 Kelas ${grade}`;
    btn.href = `subject.html?grade=${grade}`;
  }

  updateButton();

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const grade = getActiveGrade();
    localStorage.setItem(gradeKey, grade);
    localStorage.setItem("sd_grade", grade);

    window.SDAPP?.fx?.tap?.();

    location.href = `subject.html?grade=${grade}`;
  });
})();