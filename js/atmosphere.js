/* ============================================================================
   atmosphere — the weather in each scene

   Rain falls only on Sawan, the bulb flickers only in the inner room, and the
   dust hangs only over the giddha. Everything here animates transform and
   opacity through CSS keyframes; this module only places the elements and
   gives each one its own timing, so nothing pulses in unison.
   ========================================================================= */

import { SECTIONS } from './sections.js';
import { el } from './util.js';

const RAIN_DROPS = 46;
const MOTES = 32;

export function initAtmosphere(scenes) {
  for (const section of SECTIONS) {
    const scene = scenes.get(section.id);
    if (!scene) continue;
    const fx = scene.querySelector('.scene__fx');

    if (section.fx === 'rain') buildRain(fx);
    else if (section.fx === 'motes') buildMotes(fx);
    else if (section.fx === 'flicker') fx.append(el('div', { class: 'lamp' }));
  }
}

/* Thin and sparse. Monsoon rain read from a distance is lines, not sheets. */
function buildRain(fx) {
  const frag = document.createDocumentFragment();

  for (let i = 0; i < RAIN_DROPS; i += 1) {
    const duration = 0.85 + Math.random() * 0.9;
    frag.append(el('div', {
      class: 'rain__drop',
      style:
        `left:${(Math.random() * 108 - 6).toFixed(2)}%;` +
        `height:${(9 + Math.random() * 9).toFixed(1)}vh;` +
        `opacity:${(0.2 + Math.random() * 0.45).toFixed(2)};` +
        `animation-duration:${duration.toFixed(2)}s;` +
        `animation-delay:-${(Math.random() * duration).toFixed(2)}s;`,
    }));
  }

  fx.append(frag);
}

/* Dust lifted by a courtyard full of dancing, caught in low dusk light. */
function buildMotes(fx) {
  const frag = document.createDocumentFragment();

  for (let i = 0; i < MOTES; i += 1) {
    const size = 1.5 + Math.random() * 3.5;
    const duration = 13 + Math.random() * 16;
    frag.append(el('div', {
      class: 'mote',
      style:
        `left:${(Math.random() * 100).toFixed(2)}%;` +
        `top:${(30 + Math.random() * 70).toFixed(2)}%;` +
        `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
        `--o:${(0.14 + Math.random() * 0.42).toFixed(2)};` +
        `--dx:${(Math.random() * 90 - 45).toFixed(0)}px;` +
        `--dy:${(-70 - Math.random() * 150).toFixed(0)}px;` +
        `animation-duration:${duration.toFixed(1)}s;` +
        `animation-delay:-${(Math.random() * duration).toFixed(1)}s;`,
    }));
  }

  fx.append(frag);
}
