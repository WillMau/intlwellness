/* ============================================================
   INTL WELLNESS — interactions
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  "use strict";

  /* ----- Footer year ----- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Hero intro: "INTL Wellness" → drop INTL into a column → words ----- */
  (function heroIntro() {
    // Scope to the hero — the intro overlay may contain its own INTL element,
    // and a bare ".acronym" would match that first and leave the hero blank.
    var acronym = document.querySelector(".hero .acronym") || document.querySelector(".acronym");
    if (!acronym) return;

    var letters = [].slice.call(acronym.querySelectorAll(".ac-letter"));
    var words = [].slice.call(acronym.querySelectorAll(".ac-word"));
    var wellness = acronym.querySelector(".ac-wellness");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canAnimate = typeof acronym.animate === "function";

    /* ──────────────────────────────────────────────────────────────
       POWER WORDS. Once the intro lands INTL on the page, the rows
       cycle through these — every set positive and strong (the intro
       already told the struggle → becoming story). Write WHOLE words
       (each must start with I, N, T, L in order); the big I/N/T/L is
       drawn separately, so only the rest renders ("Inspired" → I +
       "nspired"). No duplicates.
       ────────────────────────────────────────────────────────────── */
    var SETS = [
      ["Intentional", "Nourished", "Transformed", "Limitless"],
      ["Inspired",    "Nurtured",  "Thriving",    "Lifted"],
      ["Invincible",  "New",       "Tenacious",   "Loved"],
      ["Ignited",     "Noble",     "Tranquil",    "Luminous"]
    ];
    // Render everything after the leading letter (which is shown by .ac-letter).
    function rest(word) { return word.slice(1); }

    // Fallback: just show the final layout.
    function showFinal() {
      letters.concat(words).forEach(function (el) {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      if (wellness) wellness.style.display = "none";
    }

    var willIntro = document.documentElement.classList.contains("will-intro");

    if (reduce || !canAnimate || !letters.length) {
      showFinal();
      return;
    }

    var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
    var STAGGER = 130, HOLD = 3800;

    // Reveal (or swap) one set of words across the four rows.
    function revealSet(setIdx, swap, startDelay) {
      words.forEach(function (el, i) {
        if (swap) {
          var out = el.animate(
            [{ opacity: 1, transform: "translateY(0)" },
             { opacity: 0, transform: "translateY(-0.28em)" }],
            { duration: 360, delay: i * 70, easing: EASE, fill: "forwards" });
          out.onfinish = function () {
            el.textContent = rest(SETS[setIdx][i]);
            el.animate(
              [{ opacity: 0, transform: "translateY(0.3em)" },
               { opacity: 1, transform: "translateY(0)" }],
              { duration: 520, easing: EASE, fill: "both" });
          };
        } else {
          el.animate(
            [{ opacity: 0, transform: "translateX(-0.18em)" },
             { opacity: 1, transform: "translateX(0)" }],
            { duration: 780, delay: startDelay + i * STAGGER, easing: EASE, fill: "both" });
        }
      });
    }

    // Flood the first set in, then loop through all the power-word sets.
    var cycleStarted = false;
    function startWordCycle(firstDelay) {
      if (cycleStarted) return; cycleStarted = true;
      words.forEach(function (el, i) { el.textContent = rest(SETS[0][i]); });
      revealSet(0, false, firstDelay);
      var current = 0;
      var SWAP_MS = 360 + 3 * 70 + 520;
      function cycle() {
        current = (current + 1) % SETS.length;
        revealSet(current, true, 0);
        setTimeout(cycle, SWAP_MS + HOLD);
      }
      setTimeout(cycle, firstDelay + 780 + 3 * STAGGER + HOLD);
    }

    // Show just the vertical INTL initials at rest (words stay hidden).
    function showLettersOnly() {
      letters.forEach(function (el) { el.style.opacity = "1"; el.style.transform = "none"; });
      if (wellness) wellness.style.display = "none";
    }

    // Intro visit: the cinematic intro morphs its INTL onto these letters, then
    // calls window.__heroStartWords() to begin the power-word cycle in place.
    if (willIntro) {
      showLettersOnly();
      window.__heroStartWords = function () { startWordCycle(150); };
      setTimeout(function () { startWordCycle(0); }, 30000); // safety if intro never calls back
      return;
    }

    function play() {
      // 1. Measure each letter's FINAL (stacked) position within the heading.
      var box = acronym.getBoundingClientRect();
      var fin = letters.map(function (el) {
        var r = el.getBoundingClientRect();
        return { left: r.left - box.left, top: r.top - box.top, width: r.width };
      });

      // 2. Build the horizontal row positions (all on the first line, left→right).
      var rowTop = fin[0].top;
      var x = fin[0].left;
      var horiz = letters.map(function (_, i) {
        var pos = { x: x, y: rowTop };
        x += fin[i].width;
        return pos;
      });
      var wellnessX = x + fin[0].width * 0.35; // a space, then "Wellness"

      if (wellness) {
        wellness.style.left = wellnessX + "px";
        wellness.style.top = rowTop + "px";
      }

      // Phase A — fade INTL + Wellness in as one horizontal wordmark.
      letters.forEach(function (el, i) {
        el.animate([{ opacity: 0 }, { opacity: 1 }],
          { duration: 500, delay: i * 70, easing: EASE, fill: "both" });
      });
      if (wellness) {
        wellness.animate(
          [{ opacity: 0, offset: 0 },
           { opacity: 1, offset: 0.22 },
           { opacity: 1, offset: 0.66 },   // hold "INTL Wellness"
           { opacity: 0, offset: 1 }],     // Phase B — Wellness fades out
          { duration: 2200, easing: "ease", fill: "both" });
      }

      // Phase C — INTL drops from the row down into a vertical column.
      letters.forEach(function (el, i) {
        var dx = horiz[i].x - fin[i].left;
        var dy = horiz[i].y - fin[i].top;
        el.animate(
          [{ transform: "translate(" + dx + "px," + dy + "px)" },
           { transform: "translate(0, 0)" }],
          { duration: 950, delay: 2150 + i * 90, easing: EASE, fill: "both" });
      });

      // Phase D — flood the first set in, then cycle the power words.
      startWordCycle(3050);
    }

    // Measure only once the display font is ready (letter widths depend on it).
    var ran = false;
    function go() { if (ran) return; ran = true; try { play(); } catch (e) { showFinal(); } }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(go);
      setTimeout(go, 1500); // safety net if fonts hang
    } else {
      go();
    }
  })();

  /* ----- Replay intro (footer link) ----- */
  var replay = document.getElementById("replayIntro");
  if (replay) {
    replay.addEventListener("click", function (e) {
      e.preventDefault();
      try { localStorage.removeItem("intl_intro_seen"); } catch (_) {}
      // Re-enter the intro cleanly: reload if already forced, else go home forced.
      if (/[?&]intro\b/.test(location.search)) location.reload();
      else location.href = "/?intro";
    });
  }

  /* ----- Nav: solid background after scroll ----- */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Mobile menu ----- */
  var toggle = document.getElementById("navToggle");
  var body = document.body;
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    // Close on link click
    document.querySelectorAll(".nav__links a").forEach(function (link) {
      link.addEventListener("click", function () {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----- Scroll reveal (IntersectionObserver) ----- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  // Apply per-element delay from data-delay
  revealEls.forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) el.style.setProperty("--d", d);
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ----- Waitlist form ----- */
  var form = document.getElementById("waitlistForm");
  var status = document.getElementById("formStatus");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form__status";

      if (!form.checkValidity()) {
        status.textContent = "Please add your name and a valid email.";
        status.classList.add("is-error");
        form.reportValidity();
        return;
      }

      var btn = form.querySelector("button[type=submit]");
      var original = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending…";

      // ── Submit to the form endpoint (FormSubmit, set in the HTML action) ──
      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            status.textContent =
              "Thank you. You're on the founding waitlist, and we'll be in touch as spots open.";
            status.classList.add("is-success");
          } else {
            return res.json().then(function (data) {
              var msg =
                data && data.errors && data.errors.length
                  ? data.errors.map(function (e) { return e.message; }).join(", ")
                  : "Something went wrong. Please try again.";
              throw new Error(msg);
            });
          }
        })
        .catch(function (err) {
          status.textContent =
            err && err.message
              ? err.message
              : "We couldn't reach the server. Please try again in a moment.";
          status.classList.add("is-error");
        })
        .finally(function () {
          btn.disabled = false;
          btn.textContent = original;
        });
    });
  }
})();
