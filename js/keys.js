/* ============================================================================
   keys — spacebar plays the section you are looking at

   Only when focus is not inside something that already uses the key. If the
   visitor is on a button, a link or the seek bar, the browser's own behaviour
   wins.
   ========================================================================= */

import { nearestPlayer } from './players.js';

const INTERACTIVE = [
  'a[href]', 'button', 'input', 'select', 'textarea', 'summary',
  '[contenteditable=""]', '[contenteditable="true"]', '[tabindex]',
].join(',');

export function initKeys() {
  document.addEventListener('keydown', (event) => {
    if (event.key !== ' ' && event.key !== 'Spacebar') return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const target = event.target;
    if (target && target.closest && target.closest(INTERACTIVE)) return;

    const player = nearestPlayer();
    if (!player || !player.id) return;

    event.preventDefault();   // otherwise the page jumps a screen
    player.toggle();
  });
}
