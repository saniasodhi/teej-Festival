/* ============================================================================
   TEEYAN
   A scrolling record of the Punjabi women's monsoon festival.

   main — assemble the page, in the order the page needs it
   ========================================================================= */

import { renderBackdrop, renderChapters } from './render.js';
import { initAtmosphere } from './atmosphere.js';
import { initScroll } from './scroll.js';
import { initPlayers } from './players.js';
import { initKeys } from './keys.js';
import { initTitleCard } from './title-card.js';

const backdrop = document.getElementById('backdrop');
const journey = document.getElementById('journey');

const scenes = renderBackdrop(backdrop);
const chapters = renderChapters(journey);

initAtmosphere(scenes);

const scroll = initScroll({ scenes, chapters });

initKeys();

const players = initPlayers();

const FIRST = 'sawan';

initTitleCard({
  /* Music under the card is the first section's own. Turning it on there and
     walking into Sawan with it already playing needs no handover. */
  music: {
    available: players.hasMusic(FIRST),
    play: () => players.play(FIRST),
  },

  onEnter: () => {
    // Both of these belong to arriving, not to the page having quietly
    // finished loading behind the card: the copy should reveal on entry, and
    // nothing should fetch a YouTube iframe for a visitor who never enters.
    scroll.startReveals();
    players.start();
  },
});
