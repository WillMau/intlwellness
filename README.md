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

### 3. Forms — wired to FormSubmit (free, multi-recipient)
Both forms post to **FormSubmit** so submissions reach two inboxes with no paid
plan and no shared account:
- Waitlist → `index.html` `<form action="https://formsubmit.co/ajax/william.mau@gmail.com">`
- Assessment → `intake.html`, same primary address

Recipients are set in the markup:
- **Primary:** `william.mau@gmail.com` (in the form `action`)
- **CC:** `cmbnyc@hotmail.com` (hidden `_cc` field)
- `_subject` sets the email subject; `_template=table` formats it; `_captcha=false`
  skips the captcha; `_honey` is the spam honeypot.

Notes:
- **Activation required once:** FormSubmit emails the primary address a one-time
  confirmation link on the first submission. Until it's clicked, nothing is
  delivered. Send one test through each form and click the link.
- **Email exposure:** the two addresses are visible in page source (FormSubmit
  requires the real address for `_cc`). Acceptable for now; to hide the primary,
  activate then swap the `action` for FormSubmit's alias URL (`/el/<hash>`).
- **Better privacy option:** Web3Forms hides recipient emails server-side (they're
  tied to an access key, not in the HTML). Requires a free signup for the key.

### 4. Real photography (optional)
The watery gradient/SVG art is intentional and self-contained — no stock photos,
which keeps it from looking generic. If the owner wants real imagery later, drop
files in `assets/img/` and place them in the hero / membership sections.

## Roadmap (not built yet — phase 2)

Per the project notes, the eventual platform also needs: member login, community
& bulletin boards, paid community chat, and intake forms. Those are a separate,
larger build (auth + database + payments). This static site is the brand front
door; the gated platform can live behind a `/members` login when you're ready.
