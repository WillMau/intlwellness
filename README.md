# INTL Wellness — wellness center marketing site

A hand-coded, static marketing site (no framework, no build step). The goal of
this first build is **capturing founding-member waitlist leads**. Brand name,
copy, and details are **placeholders** for design preview.

```
index.html              ← all page markup
assets/css/style.css    ← all styling + design tokens (top of file)
assets/js/main.js        ← nav, scroll-reveal, form handling
assets/img/             ← (empty) drop real photography here if/when you add it
```

## Run it locally

Just open `index.html` in a browser. Or serve it (nicer for fonts/caching):

```bash
# from the project root
python -m http.server 8000     # → http://localhost:8000
# or
npx serve .
```

## Deploy

It's static — host anywhere:

- **Netlify / Vercel:** drag-and-drop the folder, or connect the repo. Zero config.
- **Cloudflare Pages / GitHub Pages / S3:** upload as-is.

## Things you'll likely change

### 1. Brand name
The brand name "INTL Wellness" appears in: the page title/meta (`index.html`
`<head>`), the `.wordmark` in the nav and footer, and body copy. Find-and-replace
`INTL Wellness` to change it.

**The hero "INTL" acronym** is the brand concept: INTL is a question ("when you
look in the mirror, what do you see?") and the rows cycle through answers,
drifting from the struggle to who you become, then resting on the final set.

- The cycling words live in the **`SETS` array in `assets/js/main.js`** — four
  words per set (each starting with I, N, T, L), struggle → strength. Edit/add/
  reorder sets there. The animation rests on the **last** set.
- The words in `index.html` (inside each `<span class="ac-word">`) are only the
  resting / no-JS fallback — keep them matching the **last** `SETS` entry.
- Pacing (hold time between sets, etc.) is the `HOLD`/`STAGGER`/`FIRST_AT`
  constants in the `heroIntro` function.

### 2. Colors / type
All design tokens live at the top of `style.css` under `:root`. Swap the palette
or fonts there once and the whole site follows.

### 3. Waitlist form — ✅ wired to Formspree
The form posts to Formspree endpoint `https://formspree.io/f/xwvdoljq`. It's set
in two places (kept in sync): the `<form action="…">` in `index.html` (no-JS
fallback) and the `fetch(…)` call in `main.js` (handles the inline success/error
message without a page reload). To change the destination, update **both**.

Notes:
- Submissions land in the Formspree dashboard for that endpoint; set up email
  notifications there.
- A hidden `_gotcha` honeypot field filters basic spam bots.
- **First submission:** Formspree usually emails you once to confirm/activate a
  new form before it starts delivering — send one test signup to trigger that.

### 4. Real photography (optional)
The watery gradient/SVG art is intentional and self-contained — no stock photos,
which keeps it from looking generic. If the owner wants real imagery later, drop
files in `assets/img/` and place them in the hero / membership sections.

## Roadmap (not built yet — phase 2)

Per the project notes, the eventual platform also needs: member login, community
& bulletin boards, paid community chat, and intake forms. Those are a separate,
larger build (auth + database + payments). This static site is the brand front
door; the gated platform can live behind a `/members` login when you're ready.
