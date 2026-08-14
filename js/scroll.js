/* ============================================================================
   scroll — the crossfade, the parallax and the colour temperature

   Native scrolling is untouched. All this does is read scrollY once per frame
   and write opacity and transform. No layout property is ever animated, and
   nothing is measured inside the frame loop.
   ========================================================================= */

import { SECTIONS } from './sections.js';
import { clamp, prefersReducedMotion } from './util.js';

export function initScroll({ scenes, chapters }) {
  const reduce = prefersReducedMotion();
  const tintCool = document.getElementById('tint-cool');
  const tintWarm = document.getElementById('tint-warm');

  let metrics = [];
  let queued = false;

  function measure() {
    metrics = chapters.map((chapter, i) => {
      const scene = scenes.get(chapter.id);
      return {
        chapter,
        scene,
        art: scene.querySelector('.scene__art'),
        frame: chapter.querySelector('.chapter__frame'),
        block: chapter.querySelector('.chapter__block'),
        warmth: SECTIONS[i].warmth,
        top: chapter.getBoundingClientRect().top + window.scrollY,
        height: chapter.offsetHeight,
        visible: null,
        active: null,
      };
    });
    update();
  }

  function update() {
    queued = false;
    const vh = window.innerHeight;
    const viewTop = window.scrollY;
    const viewBottom = viewTop + vh;
    const mid = viewTop + vh / 2;

    let warmSum = 0;
    let weight = 0;

    for (const m of metrics) {
      const bottom = m.top + m.height;

      // How much of the screen this section occupies. Two neighbours always
      // sum to 1, and a section taller than the viewport stays at 1 the whole
      // way through it — which a centre-distance measure would not do.
      const coverage = clamp(
        (Math.min(bottom, viewBottom) - Math.max(m.top, viewTop)) / vh, 0, 1);

      // Bent so a dissolve passes through a little darkness rather than a flat
      // 50/50 mix — Sawan and Peke are the same courtyard at different hours,
      // and at half strength each they ghost like a misregistered print.
      // 1.9 killed the ghosting but dimmed every partial-coverage moment with
      // it, which was most of the scroll. 1.45 keeps the dip (midpoint sums to
      // ~0.73) and lets the paintings stay lit; the halved parallax below does
      // the rest of the work.
      const alpha = Math.pow(coverage, 1.45);
      const visible = alpha > 0.004;

      if (m.visible !== visible) {
        m.scene.dataset.visible = visible ? 'true' : 'false';
        m.visible = visible;
        if (!visible) m.scene.style.opacity = '0';
      }

      // How far through the section we are, -1 to 1. Driven by scroll position
      // within the section rather than by distance from its centre, because the
      // frame is pinned for the first half and a centre-distance measure would
      // spend most of its range while nothing is on screen.
      const d = clamp((viewTop - m.top) / Math.max(1, m.height - vh), 0, 1) * 2 - 1;

      if (visible) {
        m.scene.style.opacity = alpha.toFixed(3);
        // Halved from 6%. Two sections mid-dissolve sit at opposite ends of
        // this range, so on paintings that share a viewpoint the displacement
        // is exactly the misregistration you see. 3.5% each way still reads as
        // depth and is well inside the 10vh of slack the element carries.
        if (!reduce) m.art.style.transform = `translate3d(0, ${(d * 3.5).toFixed(2)}%, 0)`;
        warmSum += m.warmth * alpha;
        weight += alpha;
      }

      // Copy clears faster than artwork, so words never sit over the wrong
      // place. Gone by the time the section is under half the screen.
      if (coverage > 0.001) {
        const copyAlpha = clamp((coverage - 0.46) / 0.34, 0, 1);
        m.frame.style.opacity = copyAlpha.toFixed(3);
        if (!reduce) m.block.style.transform = `translate3d(0, ${(-d * 1.6).toFixed(2)}rem, 0)`;

        // Interactive as soon as it is legible. A section that is visibly
        // there but refuses the pointer is worse than one that is simply gone,
        // so this tracks the fade rather than sitting at some safe midpoint.
        const active = copyAlpha > 0.12;
        if (m.active !== active) {
          m.chapter.dataset.active = active ? 'true' : 'false';
          m.active = active;
        }
      } else if (m.active !== false) {
        m.frame.style.opacity = '0';
        m.chapter.dataset.active = 'false';
        m.active = false;
      }
    }

    // Cool at Sawan, hot at Giddha, interpolated by whatever is on screen.
    // The curve lifts the middle of the journey so each place is warmer than
    // the one before it, which the palettes alone would not deliver.
    const warmth = weight > 0 ? warmSum / weight : 0;
    // Soft-light tint darkens midtones as well as shifting them, so these are
    // deliberately light. The journey still reads cool to hot; the paintings
    // are doing most of that themselves.
    tintWarm.style.opacity = (0.04 + 0.24 * Math.pow(warmth, 0.72)).toFixed(3);
    tintCool.style.opacity = ((1 - warmth) * 0.18).toFixed(3);
  }

  function request() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  /* ---------------------------------------------------------- reveal ----- */

  // Held back until the visitor enters, so arriving in a section is what
  // triggers its copy — not the page having quietly loaded behind the card.
  const revealer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-revealed');
      revealer.unobserve(e.target);
    }
  }, { threshold: 0.18 });

  function startReveals() {
    for (const c of chapters) revealer.observe(c);
  }

  /* ---------------------------------------------------------- listeners -- */

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(measure, 220));

  // Covers everything that changes section height: the viewport, font swap,
  // artwork arriving, and a detail block opening.
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.querySelector('.journey'));
  } else {
    window.addEventListener('resize', () => measure());
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  // A keyboard user tabbing into a section that is off screen should be taken
  // there, or focus lands on something they cannot see.
  document.addEventListener('focusin', (e) => {
    const chapter = e.target.closest && e.target.closest('.chapter');
    if (!chapter) return;
    const r = chapter.getBoundingClientRect();
    if (r.top < -40 || r.bottom > window.innerHeight + 40) {
      chapter.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  });

  measure();

  return { measure, update, startReveals };
}
