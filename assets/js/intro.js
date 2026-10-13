/* ============================================================
   INTL Wellness — cinematic intro sequence
   Plays once per browser. Begin card (needed for audio autoplay)
   → Christian's narrated script (~2 min) → hands the letters off
   to the hero as the site fades in. Skippable at any time.

   The timeline follows the voiceover's playback position, and
   falls back to a wall clock if the audio can't play, so it
   still runs (silently) with no audio.
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
    // main.js (loaded after us) arms a fallback that starts the hero words if
    // we never call back. We always do (teardown), so cancel it — otherwise it
    // would fire mid-intro now that the intro runs ~2 minutes.
    if (window.__heroSafety) { clearTimeout(window.__heroSafety); window.__heroSafety = null; }

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

    /* ---------- I·N·T·L glow ----------
       Each wordmark letter lights as the narrator names it:
       intention, nourished, trust, love. */
    var letterEls = wordmark ? wordmark.querySelectorAll("span") : [];
    function lightLetter(n) {
      if (!letterEls[n]) return;
      wordmark.classList.add("is-lighting");
      letterEls[n].classList.add("lit");
    }

    /* ---------- the sequence (ms into the voiceover) ----------
       Christian's script, in short caption chunks, synced to the ACTUAL
       ElevenLabs character timestamps for assets/audio/intro.mp3. Re-record
       the VO → re-pull the character timestamps → update these numbers. */
    var BEATS = [
      { t: 0,      fn: function () { showCap("Most people fail on their wellness journey"); } },
      { t: 2597,   fn: function () { showCap("no matter what they try"); } },
      { t: 4129,   fn: function () { showCap("because they are doing it wrong."); } },
      { t: 7101,   fn: function () { showCap("People who truly want to feel, look and live better"); } },
      { t: 11351,  fn: function () { showCap("usually fail because they are trying to change"); } },
      { t: 13522,  fn: function () { showCap("their lifestyle and behaviors"); } },
      { t: 15368,  fn: function () { showCap("based on externally perceived needs."); } },
      { t: 18421,  fn: function () { showCap("They don't realize that the time to assess"); } },
      { t: 20789,  fn: function () { showCap("who they actually are is the key to success."); } },
      { t: 24806,  fn: function () { showCap("Knowing what can be transformed from within you"); } },
      { t: 27767,  fn: function () { showCap("is essential to gain control of your life"); } },
      { t: 30635,  fn: function () { showCap("and will give you the power to live out your life"); } },
      { t: 32980,  fn: function () { showCap("with intention and real heartfelt satisfaction."); } },
      { t: 37972,  fn: function () { showCap("What do you see when you look in the mirror?"); } },
      { t: 41594,  fn: function () { showCap("Is it someone who's been irrationally trying"); } },
      { t: 43684,  fn: function () { showCap("the latest fad diet or workout app promising success"); } },
      { t: 47551,  fn: function () { showCap("while never achieving or maintaining your goals?"); } },
      { t: 51115,  fn: function () { showCap("Do you see a good person"); } },
      { t: 52624,  fn: function () { showCap("who has neglected their own wants and feelings"); } },
      { t: 55225,  fn: function () { showCap("because you are responsible for so many others"); } },
      { t: 58093,  fn: function () { showCap("or overwhelmed at work?"); } },
      { t: 60542,  fn: function () { showCap("Are you the adult who hides"); } },
      { t: 61855,  fn: function () { showCap("some traumas and disappointments that you can't seem to shake"); } },
      { t: 65384,  fn: function () { showCap("and somehow still defines you?"); } },
      { t: 68078,  fn: function () { showCap("Or someone who feels lonely and adrift"); } },
      { t: 70655,  fn: function () { showCap("while surrounded by people?"); } },
      { t: 73917,  fn: function () { showCap("Close your eyes for just a moment"); } },
      { t: 75856,  fn: function () { showCap("and imagine what your life could be"); } },
      { t: 78781,  fn: function () { showCap("if you felt confident with your ability to shape your future."); } },
      { t: 83867,  fn: function () { showCap("Do you now see someone"); } },
      { t: 85086,  fn: function () { showCap("that moves through their life with intention"); } },
      { t: 86599,  fn: function () { lightLetter(0); } },
      { t: 87326,  fn: function () { showCap("without being swept along for the ride?"); } },
      { t: 90206,  fn: function () { showCap("Are you now living your life"); } },
      { t: 91517,  fn: function () { showCap("feeling nourished by the choices you now make?"); } },
      { t: 92009,  fn: function () { lightLetter(1); } },
      { t: 94792,  fn: function () { showCap("Do you trust your better self"); } },
      { t: 95248,  fn: function () { lightLetter(2); } },
      { t: 96301,  fn: function () { showCap("to handle the obstacles life throws your way?"); } },
      { t: 99679,  fn: function () { showCap("Do you feel the love for the person you have become"); } },
      { t: 100577, fn: function () { lightLetter(3); } },
      { t: 102744, fn: function () { showCap("and the love others share with you?"); } },
      { t: 106401, fn: function () { showCap("The coaches and practitioners of the INTL Wellness program"); } },
      { t: 110349, fn: function () { showCap("can guide you through the process of discovering"); } },
      { t: 112590, fn: function () { showCap("the strength you possess"); } },
      { t: 114192, fn: function () { showCap("to create the life you have always desired."); } },
      { t: 117489, fn: function () { showCap("We show you the path to follow"); } },
      { t: 119521, fn: function () { showCap("that is unique to each one of us."); } },
      { t: 122261, fn: function () { showCap("You will find the secret to your success"); } },
      { t: 124350, fn: function () { showCap("has always been within you."); } },
      { t: 127600, fn: function () { handoff(); } }          // speech ends ~126.1s
    ];

    /* ---------- clock ----------
       Beats follow the voiceover's own playback position, so a two-minute
       MP3 that buffers on a slow connection doesn't drift from its captions.
       If the audio won't play, errors, ends, or stalls for 4s (e.g. iOS
       backgrounding), a wall clock carries on from wherever it left off. */
    var useAudio = false, base = 0, mark = 0, next = 0, ticker = null;
    var lastAudioT = -1, lastAdvance = 0;
    function toClock() {
      if (!useAudio) return;
      base = audio.currentTime * 1000; mark = Date.now(); useAudio = false;
    }
    function tick() {
      if (useAudio) {
        var at = audio.currentTime * 1000;
        if (at !== lastAudioT) { lastAudioT = at; lastAdvance = Date.now(); }
        else if (Date.now() - lastAdvance > 4000) toClock();
      }
      var t = useAudio ? audio.currentTime * 1000 : base + (Date.now() - mark);
      while (next < BEATS.length && BEATS[next].t <= t) BEATS[next++].fn();
    }

    /* ---------- music ----------
       The score (assets/audio/intro-ambient.mp3) is one continuous ~2:15 track
       that fades itself out around the handoff. iOS ignores <audio>.volume, so
       route it through a Web Audio gain node (which iOS honours) and fall back
       to .volume where Web Audio isn't available. */
    var MUSIC_LEVEL = 0.65;
    var musicCtx = null, musicGain = null;
    function startMusic() {
      if (!music) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) throw new Error("no Web Audio");
        var ctx = new AC();
        var src = ctx.createMediaElementSource(music);
        var gain = ctx.createGain();
        gain.gain.value = MUSIC_LEVEL;
        src.connect(gain); gain.connect(ctx.destination);
        if (ctx.state === "suspended" && ctx.resume) ctx.resume();
        musicCtx = ctx; musicGain = gain;
      } catch (e) {
        try { music.volume = MUSIC_LEVEL; } catch (e2) {}
      }
      try { music.currentTime = 0; music.play().catch(function () {}); } catch (e) {}
    }

    /* ---------- start ---------- */
    beginBt.addEventListener("click", function () {
      intro.classList.add("is-playing");
      startMusic();
      mark = Date.now();
      if (audio) {
        audio.addEventListener("ended", toClock);
        audio.addEventListener("error", toClock);
        try {
          audio.currentTime = 0;
          var p = audio.play();
          if (p && p.then) p.then(function () { useAudio = true; lastAdvance = Date.now(); }).catch(function () {});
        } catch (e) {}
      }
      ticker = setInterval(tick, 100);
      tick();
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

    var musicFade = null;
    function stopMusic() {
      if (musicFade) { clearInterval(musicFade); musicFade = null; }
      if (music) { try { music.pause(); music.currentTime = 0; } catch (e) {} }
    }
    function fadeOut() {
      clearTimers();
      if (audio) { try { audio.pause(); } catch (e) {} }
      // Try to fade the music, but ALWAYS hard-stop it — iOS ignores volume
      // changes, so we can't rely on the volume reaching zero to pause it.
      if (music) {
        if (musicGain) {
          try {
            var now = musicCtx.currentTime;
            musicGain.gain.setValueAtTime(musicGain.gain.value, now);
            musicGain.gain.linearRampToValueAtTime(0, now + 2);
          } catch (e) {}
        }
        var steps = 0;
        musicFade = setInterval(function () {
          steps++;
          try { if (!musicGain && music.volume > 0.05) music.volume = Math.max(0, music.volume - 0.05); } catch (e) {}
          if (steps >= 40 || (!musicGain && music.volume <= 0.05)) { stopMusic(); }   // ~2s cap, then stop no matter what
        }, 50);
      }
      intro.style.transition = "opacity 2s ease";
      intro.style.opacity = "0";
      timers.push(setTimeout(function () { teardown(false); }, 2050));
    }

    function clearTimers() {
      timers.forEach(clearTimeout); timers = [];
      if (ticker) { clearInterval(ticker); ticker = null; }
    }

    function teardown(immediate) {
      if (done) return; done = true;
      if (audio) { try { audio.pause(); } catch (e) {} }
      stopMusic();                       // guarantee audio + music are stopped
      if (musicCtx && musicCtx.close) {  // release the audio thread (battery on phones)
        try { var c = musicCtx.close(); if (c && c.catch) c.catch(function () {}); } catch (e) {}
      }
      document.documentElement.classList.remove("will-intro");
      if (intro) intro.style.display = "none";
      document.body.style.overflow = "";
      // hero letters are in place — kick off the power-word cycle on the page
      if (window.__heroStartWords) { try { window.__heroStartWords(); } catch (e) {} }
      try { localStorage.setItem("intl_intro_seen", "1"); } catch (e) {}
    }
  });
})();
