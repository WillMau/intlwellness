/* ============================================================
   INTL WELLNESS — Coaching Assessment wizard
   Vanilla JS. Multi-step navigation + FormSubmit submit.
   ============================================================ */
(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var form = document.getElementById("intakeForm");
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll(".step"));
  var total = steps.length;
  var current = 0;

  var btnBack = document.getElementById("btnBack");
  var btnNext = document.getElementById("btnNext");
  var btnSubmit = document.getElementById("btnSubmit");
  var status = document.getElementById("formStatus");

  var progressBar = document.getElementById("progressBar");
  var progressStep = document.getElementById("progressStep");
  var progressTitle = document.getElementById("progressTitle");

  /* ----- Live outputs for sliders ----- */
  form.querySelectorAll('input[type="range"]').forEach(function (range) {
    var out = range.parentElement.querySelector("output");
    if (!out) return;
    var sync = function () { out.textContent = range.value; };
    range.addEventListener("input", sync);
    sync();
  });

  /* ----- Render current step ----- */
  function render() {
    steps.forEach(function (s, i) { s.classList.toggle("is-active", i === current); });

    var pct = Math.round(((current + 1) / total) * 100);
    progressBar.style.width = pct + "%";
    progressStep.textContent = "Step " + (current + 1) + " of " + total;
    progressTitle.textContent = steps[current].getAttribute("data-step");

    btnBack.hidden = current === 0;
    var last = current === total - 1;
    btnNext.hidden = last;
    btnSubmit.hidden = !last;

    status.textContent = "";
    status.className = "form__status";

    // Scroll the form back into view (progress bar is sticky)
    var top = document.querySelector(".intake__head");
    if (top) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ----- Validate visible step only ----- */
  function validateStep() {
    var fields = steps[current].querySelectorAll("input, textarea, select");
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) {
        fields[i].reportValidity();
        return false;
      }
    }
    return true;
  }

  btnNext.addEventListener("click", function () {
    if (!validateStep()) return;
    if (current < total - 1) { current++; render(); }
  });

  btnBack.addEventListener("click", function () {
    if (current > 0) { current--; render(); }
  });

  // Enter advances instead of submitting (except inside textareas)
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      if (current < total - 1) btnNext.click();
    }
  });

  /* ----- Submit ----- */
  form.addEventListener("submit", function (e) {
    // Validate the final step, then submit natively so FormSubmit can show its
    // captcha and redirect to the branded thank-you page.
    if (!validateStep()) { e.preventDefault(); return; }
    btnSubmit.textContent = "Sending…";
    // no preventDefault → native submit proceeds (captcha → thanks page)
  });

  render();
})();
