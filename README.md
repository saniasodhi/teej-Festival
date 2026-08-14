# TEEYAN — ਤੀਆਂ

A scrolling record of Teeyan, the Punjabi women's monsoon festival: five places
in a village during Sawan, each with its own artwork, colour and music.

Static HTML, CSS and vanilla JavaScript. No framework, no build step, no
backend. Drop the folder into a repository, turn on GitHub Pages, and it runs.

---

## Music

All five sections have a playlist, and all five were checked end to end — they
load, cue, report metadata and play:

| Section | Playlist | First track |
|---|---|---|
| ਸਾਉਣ Sawan | Best of Punjabi Folk Songs | Kache Kothe Mittran De — Tips Punjabi |
| ਪੇਕੇ Peke | Prakash Kaur & Surinder Kaur — Punjabi Folk | Charkha Chanan Da — Saregama Punjabi |
| ਮਹਿੰਦੀ ਤੇ ਫੁਲਕਾਰੀ Mehendi te Phulkari | Folk Flavor — instrumental | Suee Ve Suee — Catrack Entertainment |
| ਪੀਂਘ Peengh | Surinder Kaur | Dachi Waleya — SagaHits |
| ਗਿੱਧਾ Giddha | Gidha Boliyan — Traditional | Giddha Boliyan — Aman Bajwa |

**These are a starting set, not a curated one.** Listen to them and swap
anything that does not belong — this is a cultural record and what stands for
each moment is an editorial call, not a technical one. To change one, replace
`youtubePlaylistId` in [`js/sections.js`](js/sections.js) with the `list=` value
from any playlist URL:

```
https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                      └──────────── this ────────────┘
```

Leave `youtubePlaylistUrl` empty and the player links to `music.youtube.com`
for that ID. Set it only if you want the link to go somewhere else.

Check any replacement plays before you ship it — a fair number of playlists have
embedding disabled by the owner, which the player reports honestly but which
means no music. An empty ID is not broken either: that section shows a disabled
player saying no recording is linked yet, and **no iframe is created for it**.

## Artwork

Two crops per section in `assets/art/`. All five are in:

| Section | Wide (16:9) | Tall (9:16) | Status |
|---|---|---|---|
| Sawan | `sawan-wide.webp` | `sawan-tall.webp` | in |
| Peke | `peke-wide.webp` | `peke-tall.webp` | in |
| Mehendi te Phulkari | `mehendi-wide.webp` | `mehendi-tall.webp` | in |
| Peengh | `peengh-wide.webp` | `peengh-tall.webp` | in |
| Giddha | `giddha-wide.webp` | `giddha-tall.webp` | in |

### The title card film

`assets/video/teeyan-title.mp4` (1280×720, 10s, 2.6 MB) loops silently behind
the wordmark, graded down hard so the card keeps its register. It is
decorative: `aria-hidden`, no controls, not focusable, and it never makes a
sound — the brief's "do not autoplay" rule is about the music.

`teeyan-title-poster.jpg` is the first thing painted and stands in for the
video entirely when `prefers-reduced-motion` is set, when autoplay is refused,
or if the file fails. The card looks deliberate in all three cases. Playback
stops and the decoder is released the moment the card leaves.

To replace it, drop in a new mp4 under the same name and regenerate the poster
from a representative frame. Then re-check contrast — the type is measured
against the **worst frame of the whole loop**, not one screenshot, because a
still is not a test of moving footage.

Ship a `.jpg` of each name too — it is the fallback for browsers without WebP,
and the `<img>` `src` itself.

Then fill in that section's two fields in `js/sections.js`:

```js
artworkWide: ART + 'peke-wide',
artworkTall: ART + 'peke-tall',
```

Availability is **per section**, not global, because the art arrives one
illustration at a time. A section whose two fields are empty draws a gradient
from its own palette and **makes no image request**, so the console stays clean
while the rest are still being painted. The alt text for all five is already
written in `sections.js`, in the documentary voice the rest of the site uses —
correct it if your illustration shows something different.

The tall version should be the illustration **reframed vertically**, not the
wide one cropped or squashed. Which crop loads is decided by viewport
orientation, so a tablet held upright gets the tall one too. Compress hard:
five full-bleed illustrations at two crops each is the whole weight of the site.

**Artwork must carry no text or lettering.** Every word on the page is real
HTML sitting over the image.

Once the Giddha illustration lands, replace `assets/og-image.jpg` with a
1200×630 crop of it. The one shipped is a placeholder in the Giddha palette.

**Check the contrast after adding each one.** The scrim is tuned against real
artwork, not guessed: the type is hidden, the background behind each line is
sampled, and the WCAG ratio is computed against the lightest pixel under the
glyphs. Sawan currently clears AA at every target size, the tightest being
4.65:1. A brighter illustration in the copy zone may need its scrim stops
adjusted in `css/responsive.css` and `css/chapters.css`.

---

## Running it locally

The JavaScript is ES modules, so opening `index.html` from the filesystem will
not work — browsers block module loading over `file://`. Serve the folder:

```bash
python -m http.server 8123
```

Then open `http://localhost:8123`.

## Deploying

Push to a repository and enable GitHub Pages on the branch. Nothing else.

Every path in the site is relative, so it works identically at
`https://user.github.io/repo-name/` and at a domain root. There is no build
config, no base href, and no absolute `/assets/...` anywhere — if you add one,
the subpath deployment will break.

`.nojekyll` is included so GitHub Pages serves the files as they are.

---

## How it is put together

```
index.html          markup shell; sections are generated, not hand-written
js/
  sections.js       ALL content, colour, artwork and playlist config
  main.js           assembles the page
  render.js         builds the backdrop and the five chapters from sections.js
  scroll.js         crossfade, parallax, colour temperature, reveals
  players.js        YouTube IFrame API: one player per section
  detail.js         the expandable blocks
  atmosphere.js     rain, lamp flicker, dust motes
  keys.js           spacebar plays the section you are looking at
  util.js           small shared helpers
css/
  base.css          fonts, tokens, reset
  atmosphere.css    the five stacked backgrounds and their weather
  chapters.css      section layout, type lockup, the scrim
  detail.css        disclosure and boli
  player.css        the pill
  title-card.css    entry overlay
  responsive.css    1440 / 1024 / 768 / 430 / 375
assets/
  wordmark.svg      ਤੀਆਂ as outlines — see below
  favicon.svg, favicon-32.png, apple-touch-icon.png
  og-image.jpg      placeholder; replace with Giddha artwork
  fonts/            Fraunces and Karla, subset, self-hosted
  art/              your ten illustrations go here
```

### Pacing

Each section is **two viewports tall**. The first is a hold — the artwork sits
still and the words are pinned over it — and the second is the dissolve into
the next place. The frame is `position: sticky` inside a grid row that is
explicitly `200dvh`; a sticky element can only travel within its own grid area,
so an `auto` row pins nothing. To make a place hold longer or shorter, change
that one row height in `css/chapters.css`.

### The headings

Section names are set in Gurmukhi as **live text** in a self-hosted Noto Serif
Gurmukhi, subset to the Gurmukhi block (15KB). Live text is correct here: the
browser shapes it, so the matras and the bindi land where a Punjabi reader
expects, and it stays selectable and readable by assistive tech.

### The wordmark

`assets/wordmark.svg` is the word ਤੀਆਂ set in Noto Serif Gurmukhi, shaped with
HarfBuzz and converted to outlines. It is also inlined in `index.html` so the
title card cannot fail to render it.

**Do not replace it with live webfont text, and never regenerate it with an
image model.** Image models produce malformed Gurmukhi that looks fine to
someone who cannot read it and wrong to anyone who can. If you need to change
the wordmark, set it in a real Gurmukhi typeface, convert to outlines, and
export the path.

### Behaviour worth knowing

- **One player at a time.** Starting one pauses the others.
- **Scrolling away** fades the volume to zero over 600ms, *then* pauses, and
  stores the position. Scrolling back seeks to that position and fades up.
  Nothing is ever cut dead.
- **Iframes are lazy.** A section's player is only built when the section comes
  within one viewport. Sections without a playlist ID never build one.
- **Spacebar** plays or pauses the section nearest the middle of the screen,
  unless focus is already inside a control.
- **Escape** closes an open detail block. Only one is open at a time.
- **`prefers-reduced-motion`** turns off parallax, rain, grain drift, dust and
  flicker. The crossfades stay — they are opacity only, and they are what makes
  the journey readable.
- **No API keys.** The IFrame Player API does not need one, and there is none
  anywhere in the source.

---

## Sources and credits

Written from Punjabi oral tradition and standard accounts of the festival. The
lok geet and the boli quoted in the detail blocks are anonymous oral tradition,
attributed by form rather than to an author, which is the honest attribution
for them.

Music is embedded from YouTube rather than self-hosted. Self-hosting folk
recordings would mean serving copyrighted audio without a licence and would
strip the artist credit a cultural record ought to keep. The embed carries the
credit.

Typefaces — Fraunces, Karla and Noto Serif Gurmukhi — are used under the SIL
Open Font License 1.1.
