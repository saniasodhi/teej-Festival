/* ============================================================================
   render — build the backdrop and the five chapters from js/sections.js

   Nothing about a section is written in the HTML. Colours, copy, artwork and
   playlist IDs all arrive from one file, so there is one place to change them.
   ========================================================================= */

import { SECTIONS, CREDITS } from './sections.js';
import { el, icon, hexToRgb, mixToRgb } from './util.js';

/* The paper colour small accent text is lifted toward. Matches --paper. */
const PAPER = '#F4EBDB';

const ICONS = {
  prev: ['0 0 24 24', '<path d="M7 6h2.2v12H7zM19 6v12l-9-6z"/>'],
  next: ['0 0 24 24', '<path d="M14.8 6H17v12h-2.2zM5 6l9 6-9 6z"/>'],
  play: ['0 0 24 24', '<path d="M7 4.5 20 12 7 19.5z"/>'],
  pause: ['0 0 24 24', '<path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/>'],
  out: ['0 0 12 12', '<path d="M4 2h6v6M10 2 2.5 9.5" fill="none" stroke="currentColor" stroke-linecap="round"/>'],
  chev: ['0 0 12 12', '<path d="m2.5 4.5 3.5 3.5 3.5-3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>'],
  // the peengh again, standing in for a thumbnail that has not loaded
  peengh: ['0 0 32 32', '<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6.5Q15 2.6 27 7"/><path d="M9 5.5 13.8 23.4M21 5.5 23.8 23.4"/><path d="M12.1 23.8h13.4"/></g>'],
};

const mk = (name) => icon(ICONS[name][0], ICONS[name][1]);

/* Where the light sits in the placeholder gradient. It follows the text: the
   lit part of the frame is the part the words are not standing on. */
const ANCHOR_GEOMETRY = {
  left: { ax: '74%', ay: '26%', bx: '18%' },
  right: { ax: '26%', ay: '24%', bx: '80%' },
  centre: { ax: '50%', ay: '20%', bx: '50%' },
};

/* --------------------------------------------------------------- backdrop -- */

export function renderBackdrop(root) {
  const scenes = new Map();

  for (const s of SECTIONS) {
    const geo = ANCHOR_GEOMETRY[s.anchor] || ANCHOR_GEOMETRY.left;

    const scene = el('div', {
      class: 'scene',
      'data-id': s.id,
      'data-visible': 'false',
      style: sectionVars(s) + `--ax:${geo.ax};--ay:${geo.ay};--bx:${geo.bx};`,
    });

    const art = el('div', { class: 'scene__art scene__art--placeholder' });
    scene.append(art, el('div', { class: 'scene__wash' }), el('div', { class: 'scene__fx' }));

    // Sections without artwork keep the palette gradient and make no request.
    // The first section is eager; the rest wait until they are nearly on screen.
    if (s.artworkWide && s.artworkTall) {
      attachArtwork(scene, art, s, s.id === SECTIONS[0].id);
    }

    root.prepend(scene);
    scenes.set(s.id, scene);
  }

  return scenes;
}

/** Per-section custom properties, as both hex and rgb triplets. */
function sectionVars(s) {
  const [c1, c2, c3, c4] = s.palette;
  return (
    `--c1:${c1};--c2:${c2};--c3:${c3};--c4:${c4};--accent:${s.accentColor};` +
    `--c1-rgb:${hexToRgb(c1)};--c2-rgb:${hexToRgb(c2)};` +
    `--c3-rgb:${hexToRgb(c3)};--c4-rgb:${hexToRgb(c4)};` +
    `--accent-rgb:${hexToRgb(s.accentColor)};` +
    `--accent-text:rgb(${mixToRgb(s.accentColor, PAPER, 0.78)});` +
    `--art-pos:${s.focus || '50% 50%'};` +
    `--art-pos-tall:${s.focusTall || '50% 50%'};`
  );
}

/* Wide for landscape, tall for portrait. The tall file is a reframe of the
   same illustration, not a crop of the wide one.

   The picture goes inside the placeholder element rather than beside it, so
   there is exactly one parallax target per scene and the palette gradient is
   still underneath if the file never arrives. */
function attachArtwork(scene, art, s, eager) {
  /* Keyed on orientation, not width. What decides which crop belongs is the
     shape of the viewport, so a tablet held upright gets the vertical reframe
     the same as a phone does. */
  const picture = el('picture');
  picture.append(
    el('source', { media: '(orientation: portrait)', type: 'image/webp', srcset: `${s.artworkTall}.webp` }),
    el('source', { media: '(orientation: portrait)', type: 'image/jpeg', srcset: `${s.artworkTall}.jpg` }),
    el('source', { type: 'image/webp', srcset: `${s.artworkWide}.webp` }),
  );

  const img = el('img', {
    src: `${s.artworkWide}.jpg`,
    alt: s.alt,
    decoding: 'async',
    loading: eager ? 'eager' : 'lazy',
    fetchpriority: eager ? 'high' : 'low',
  });

  img.addEventListener('error', () => {
    // Keep the palette gradient and say so, rather than show a torn frame.
    picture.remove();
    scene.append(el('p', { class: 'scene__art-error', text: `${s.nameRoman} artwork unavailable` }));
  }, { once: true });

  picture.append(img);
  art.append(picture);
  // The wash exists to give a palette gradient its section colour. A real
  // illustration already has that colour, so it gets a much lighter touch.
  scene.classList.add('scene--art');
}

/* ---------------------------------------------------------------- chapters -- */

export function renderChapters(main) {
  const chapters = [];

  for (const s of SECTIONS) {
    const section = el('section', {
      class: 'chapter',
      id: s.id,
      'data-anchor': s.anchor,
      'data-active': 'false',
      'aria-labelledby': `name-${s.id}`,
      style: sectionVars(s),
    });

    const block = el('div', { class: 'chapter__block' });

    /* The words are wrapped separately from the player so the contrast scrim
       can be anchored to the type itself. A scrim anchored to the viewport
       drifts away from the copy as the viewport changes shape, which is how
       the tablet sizes ended up with an eyebrow on bare sunlit wall. */
    /* Gurmukhi carries the heading; the Roman and the English sit under it on
       one small line. Nothing is folded away behind a trigger — each section
       is its name, two sentences and its music, and the scroll carries you. */
    const lede = el('div', { class: 'chapter__lede' }, [
      el('h2', { class: 'chapter__name', id: `name-${s.id}` }, [
        el('span', { class: 'chapter__gurmukhi', lang: 'pa', text: s.nameGurmukhi }),
        /* The spaces around the dot are real text nodes. Adjacent inline
           elements concatenate without one, and the dot itself is hidden from
           assistive tech, so without them this reads as "SawanThe Rains Break". */
        el('span', { class: 'chapter__sub' }, [
          el('span', { class: 'chapter__roman', lang: 'pa-Latn', text: s.nameRoman }),
          ' ',
          el('span', { class: 'chapter__dot', 'aria-hidden': 'true', text: '·' }),
          ' ',
          el('span', { class: 'chapter__english', text: s.nameEnglish }),
        ]),
      ]),
      el('div', { class: 'chapter__rule', 'aria-hidden': 'true' }),
      el('p', { class: 'chapter__copy', text: s.copy }),
    ]);

    block.append(lede, renderPlayerShell(s));

    const frame = el('div', { class: 'chapter__frame' });
    frame.append(block);
    section.append(frame);

    /* The colophon sits after the frame, not inside the block. Inside, it made
       the last section's lockup ~150px taller than every other one, which
       pushed the heading up out of the scrim and onto a lit courtyard floor.
       Below the frame it also reads better: the artwork dissolves into black
       and the record signs off. */
    if (s.id === SECTIONS[SECTIONS.length - 1].id) {
      section.classList.add('chapter--last');
      section.append(renderCredits());
    }
    main.append(section);
    chapters.push(section);
  }

  return chapters;
}

/* The expandable `more` block was removed: it broke the scroll into stops and
   its trigger sat on every section. The longer prose and the boliyan are still
   in js/sections.js as `detail` and `boli` — nothing was deleted — so it can
   be brought back by restoring this function and the call in renderChapters. */

/* The pill's markup. players.js wires it to the real API, or leaves it
   honestly disabled when neither a playlist nor a recording has been given. */
function renderPlayerShell(s) {
  const has = Boolean(s.youtubePlaylistId || s.youtubeVideoId);

  const player = el('div', {
    class: 'player',
    'data-id': s.id,
    'data-state': has ? 'idle' : 'disabled',
    'data-playing': 'false',
    role: 'group',
    'aria-label': `Music for ${s.nameRoman}`,
  });

  const mount = el('div', { class: 'player__mount', 'aria-hidden': 'true' });
  mount.append(el('div', { id: `yt-${s.id}` }));

  const thumbMark = el('div', { class: 'player__thumb-mark' });
  thumbMark.append(mk('peengh'));
  const thumb = el('div', { class: 'player__thumb' }, [thumbMark]);

  const out = el('a', {
    class: 'player__out',
    href: playlistUrl(s),
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': s.youtubePlaylistId
      ? `Open the ${s.nameRoman} playlist in YouTube Music`
      : `Open the ${s.nameRoman} recording in YouTube Music`,
  }, [el('span', { class: 'player__out-label', text: 'YouTube Music' })]);
  out.append(mk('out'));

  const meta = el('div', { class: 'player__meta' }, [
    el('div', { class: 'player__meta-text' }, [
      el('p', { class: 'player__track-title', text: s.nameRoman }),
      el('p', { class: 'player__sub' }, [
        el('span', { class: 'player__artist', text: '' }),
        el('span', { class: 'player__sep', 'aria-hidden': 'true', text: '·' }),
        el('span', { class: 'player__section', text: s.nameRoman }),
      ]),
    ]),
    out,
  ]);

  const bar = el('div', {
    class: 'player__bar',
    role: 'slider',
    tabindex: '0',
    'aria-label': `Seek within the ${s.nameRoman} track`,
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': '0',
    'aria-valuetext': 'Not playing',
  }, [
    el('div', { class: 'player__bar-fill' }),
    el('div', { class: 'player__bar-knob' }),
  ]);

  const scrub = el('div', { class: 'player__scrub' }, [
    el('span', { class: 'player__time player__time--cur', text: '0:00' }),
    bar,
    el('span', { class: 'player__time player__time--dur', text: '0:00' }),
  ]);

  const note = el('p', { class: 'player__note' });
  if (!has) note.textContent = `No recording is linked to ${s.nameRoman} yet.`;

  const body = el('div', { class: 'player__body' }, [meta, scrub, note]);

  const transport = el('div', { class: 'player__transport' });
  for (const [name, label] of [['prev', 'Previous track'], ['play', 'Play'], ['next', 'Next track']]) {
    const btn = el('button', {
      class: `player__btn player__btn--${name}`,
      type: 'button',
      'aria-label': `${label} — ${s.nameRoman}`,
      disabled: !has,
    });
    if (name === 'play') {
      const p = mk('play'); p.setAttribute('class', 'player__icon--play');
      const q = mk('pause'); q.setAttribute('class', 'player__icon--pause');
      btn.append(p, q);
    } else {
      btn.append(mk(name));
    }
    transport.append(btn);
  }

  const pill = el('div', { class: 'player__pill' }, [thumb, body, transport]);
  player.append(mount, pill);

  if (!has) out.remove();

  return player;
}

/** An explicit URL wins; otherwise send people to the ID on YouTube Music. */
export function playlistUrl(s) {
  if (s.youtubePlaylistUrl) return s.youtubePlaylistUrl;
  if (s.youtubePlaylistId) return `https://music.youtube.com/playlist?list=${s.youtubePlaylistId}`;
  if (s.youtubeVideoId) return `https://music.youtube.com/watch?v=${s.youtubeVideoId}`;
  return '';
}

function renderCredits() {
  const footer = el('footer', { class: 'chapter__colophon' });
  const inner = el('div', { class: 'chapter__colophon-inner' });
  for (const line of CREDITS) inner.append(el('p', { text: line }));
  footer.append(inner);
  return footer;
}
