/* ============================================================
   INTL Wellness — cinematic intro sequence
   Plays once per browser. Begin card (needed for audio autoplay)
   → narrated INTL resolve → hands the letters off to the hero
   as the site fades in. Skippable at any time.

   NOTE (proof of concept): runs on a fixed timeline so it works
   with NO audio yet. When the ElevenLabs MP3 lands in
   assets/audio/intro.mp3, it plays in parallel; retune BEATS
   timings to match the final voiceover.
   ============================================================ */
(function () {
  "use strict";

  // If the early decision script didn't opt us in, do nothing.
  if (!document.documentElement.classList.contains("will-intro")) return;

  // We're taking control — cancel the dead-man switch that would
  // otherwise tear the overlay down if this script failed to load.
  if (window.__introDead) { clearTimeout(window.__introDead); window.__introDead = null; }

  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

  document.addEventListener("DOMContentLoaded", function () {
    var intro   = document.getElementById("intro");
    var gate    = document.getElementById("introGate");
    var beginBt = document.getElementById("introBegin");
    var skipBt  = document.getElementById("introSkip");
    var cap     = document.getElementById("introCap");
    var wordmark = document.getElementById("introWordmark");
    var audio   = document.getElementById("introAudio");
    var music   = document.getElementById("introMusic");
    var bubbleBox = document.getElementById("introBubbles");
    if (!intro || !beginBt) { teardown(true); return; }

    document.body.style.overflow = "hidden";

    /* rising bubbles — pseudo-random but deterministic (no Math.random reliance) */
    if (bubbleBox) {
      var seeds = [7, 23, 41, 58, 12, 77, 34, 91, 5, 63, 19, 88, 46, 29, 70, 52, 3, 81];
      seeds.forEach(function (s, i) {
        var b = document.createElement("span");
        b.className = "bubble";
        var size = 5 + (s % 22);                 // 5–27px
        var leftPct = (s * 5.3) % 100;
        var dur = 9 + (s % 11);                   // 9–20s
        var delay = -((s * 1.7) % 14);            // negative → already in motion
        var drift = ((i % 2 ? 1 : -1) * (10 + (s % 40))) + "px";
        b.style.width = b.style.height = size + "px";
        b.style.left = leftPct + "%";
        b.style.animationDuration = dur + "s";
        b.style.animationDelay = delay + "s";
        b.style.setProperty("--drift", drift);
        bubbleBox.appendChild(b);
      });
    }

    var timers = [];
    var done = false;

    /* ---------- caption helper ---------- */
    function showCap(text) {
      cap.classList.remove("show");
      requestAnimationFrame(function () {
        cap.textContent = text;
        requestAnimationFrame(function () { cap.classList.add("show"); });
      });
    }

    /* ---------- the sequence (ms from Begin) ----------
       INTL stays put; only the captions change, synced to the ACTUAL
       ElevenLabs word timestamps for assets/audio/intro.mp3. Re-record
       the VO → re-pull the character timestamps → update these numbers. */
    var BEATS = [
      { t: 150,   fn: function () { showCap("Look in the mirror."); } },
      { t: 1614,  fn: function () { showCap("What do you see?"); } },
      { t: 3634,  fn: function () { showCap("Someone tired. Someone running on empty."); } },
      { t: 7082,  fn: function () { showCap("Someone still waiting to begin."); } },
      { t: 10019, fn: function () { showCap("Now, look again."); } },
      { t: 12806, fn: function () { showCap("Intentional."); } },
      { t: 14443, fn: function () { showCap("Nourished."); } },
      { t: 15720, fn: function () { showCap("Transformed."); } },
      { t: 17299, fn: function () { showCap("Limitless."); } },
      { t: 19284, fn: function () { showCap("This is INTL Wellness."); } },
      { t: 22129, fn: function () { showCap("The answer was always you."); } },
      { t: 24700, fn: function () { handoff(); } }
    ];

    /* ---------- start ---------- */
    beginBt.addEventListener("click", function () {
      intro.classList.add("is-playing");
      if (music) { try { music.volume = 0.32; music.currentTime = 0; music.play().catch(function () {}); } catch (e) {} }
      if (audio) { try { audio.currentTime = 0; audio.play().catch(function () {}); } catch (e) {} }
      BEATS.forEach(function (b) { timers.push(setTimeout(b.fn, b.t)); });
    });

    skipBt.addEventListener("click", function () { fadeOut(); });

    /* ---------- handoff: morph the INTL onto the site's letters, then fade ----------
       Each intro letter (I,N,T,L) flies to the position/size of the matching
       leading letter in the hero's INTL column, so the letters feel continuous.
       The scene dissolves around them, then the whole overlay fades to reveal
       the page already sitting underneath in the same spot. */
    function handoff() {
      intro.classList.add("intro--out");            // fade the scene (not the letters yet)
      var heroLetters = document.querySelectorAll(".hero .acronym .ac-letter");
      var introLetters = wordmark ? wordmark.querySelectorAll("span") : [];

      if (introLetters.length && heroLetters.length === introLetters.length && introLetters[0].animate) {
        for (var i = 0; i < introLetters.length; i++) {
          (function (from, to) {
            var f = from.getBoundingClientRect();
            var l = to.getBoundingClientRect();
            if (!f.height || !l.height) return;
            // Scale by height (uniform across letters); line-heights are matched
            // in CSS so aligning the top-left corners aligns the glyphs.
            var scale = l.height / f.height;
            from.style.transformOrigin = "top left";
            from.animate(
              [{ transform: "translate(0,0) scale(1)" },
               { transform: "translate(" + (l.left - f.left) + "px," + (l.top - f.top) + "px) scale(" + scale + ")" }],
              { duration: 1500, easing: EASE, fill: "forwards" }
            );
          })(introLetters[i], heroLetters[i]);
        }
        timers.push(setTimeout(fadeOut, 1650));      // let the letters land, then fade the overlay
      } else {
        timers.push(setTimeout(fadeOut, 1600));      // fallback: plain fade
      }
    }

    function fadeOut() {
      clearTimers();
      if (audio) { try { audio.pause(); } catch (e) {} }
      // gently fade the ambient music out over ~2s
      if (music) {
        var fade = setInterval(function () {
          if (music.volume > 0.006) { music.volume = Math.max(0, music.volume - 0.006); }
          else { clearInterval(fade); try { music.pause(); } catch (e) {} }
        }, 40);
      }
      intro.style.transition = "opacity 2s ease";
      intro.style.opacity = "0";
      timers.push(setTimeout(function () { teardown(false); }, 2050));
    }

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function teardown(immediate) {
      if (done) return; done = true;
      document.documentElement.classList.remove("will-intro");
      if (intro) intro.style.display = "none";
      document.body.style.overflow = "";
      // hero letters are in place — kick off the power-word cycle on the page
      if (window.__heroStartWords) { try { window.__heroStartWords(); } catch (e) {} }
      try { localStorage.setItem("intl_intro_seen", "1"); } catch (e) {}
    }
  });
})();
