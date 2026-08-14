/* ============================================================================
   title card — entry, and the one scroll cue on the site

   Pressing enter and scrolling both work, because the cue says scrolling
   works. Nothing plays on entry; the press only gives the browser the
   interaction it wants before any audio is allowed to start later.
   ========================================================================= */

export function initTitleCard({ onEnter, music }) {
  const card = document.getElementById('title-card');
  const button = document.getElementById('enter');
  const main = document.getElementById('journey');
  const film = document.getElementById('title-film');
  const video = document.getElementById('title-video');
  let entered = false;

  // Nothing behind the card should be reachable while it is up.
  main.setAttribute('inert', '');
  main.setAttribute('tabindex', '-1');

  /* The footage is decorative and silent. It fades in once there is a frame to
     show; if it cannot load or cannot autoplay, the poster is already there
     and nothing about the card changes. */
  function startFilm() {
    if (!video) return;
    const show = () => film.classList.add('is-visible');

    /* Reveal on whichever comes first, and unconditionally after a beat. The
       poster means there is always something worth showing, so nothing here
       should ever be able to leave the element stuck at zero opacity — an
       earlier version gated this on `loadeddata` alone, which never fires if
       playback is refused and preload stops at metadata. */
    if (video.readyState >= 2) show();
    video.addEventListener('loadeddata', show, { once: true });
    video.addEventListener('canplay', show, { once: true });
    video.addEventListener('error', show, { once: true });
    setTimeout(show, 1500);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();      // hold on the poster
      return;
    }

    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(show);
  }

  function stopFilm() {
    if (!video) return;
    try { video.pause(); } catch { /* already gone */ }
    video.removeAttribute('src');
    const source = video.querySelector('source');
    if (source) source.removeAttribute('src');
    video.load();   // releases the decoder once the card is out of the way
  }

  function enter() {
    if (entered) return;
    entered = true;

    document.body.classList.remove('is-locked');
    main.removeAttribute('inert');
    card.classList.add('is-leaving');
    card.setAttribute('aria-hidden', 'true');

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      card.hidden = true;
      stopFilm();
      main.focus({ preventScroll: true });
    };
    card.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 1200);   // in case the transition never fires

    detach();
    if (typeof onEnter === 'function') onEnter();
  }

  const SCROLL_KEYS = new Set([' ', 'Spacebar', 'ArrowDown', 'PageDown', 'End', 'Enter']);

  const onKey = (e) => {
    if (!SCROLL_KEYS.has(e.key)) return;
    if (e.key === 'Enter' && e.target !== button) return;
    e.preventDefault();
    enter();
  };

  const onWheel = (e) => { if (e.deltaY > 0) enter(); };
  const onTouch = () => enter();

  function detach() {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('touchmove', onTouch);
    window.removeEventListener('keydown', onKey);
  }

  /* The sound control. Only offered if the first section actually has a
     recording behind it — an inert speaker button would be exactly the fake
     control this site is meant not to have. */
  const sound = document.getElementById('sound');
  if (sound) {
    if (!music || !music.available) {
      sound.closest('.title-card__sound').remove();
    } else {
      let playing = false;
      sound.addEventListener('click', async () => {
        const label = sound.querySelector('.title-card__sound-label');
        if (playing) {
          await music.play();          // toggles the same player back off
          playing = false;
        } else {
          sound.setAttribute('aria-busy', 'true');
          playing = await music.play();
          sound.removeAttribute('aria-busy');
        }
        sound.setAttribute('aria-pressed', String(playing));
        label.textContent = playing ? 'Music playing' : 'Play the music';
      });
    }
  }

  button.addEventListener('click', enter);
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('keydown', onKey);

  // Landing on a deep link should not put the card in the way.
  if (location.hash && document.getElementById(location.hash.slice(1))) {
    requestAnimationFrame(enter);
  } else {
    startFilm();
  }

  return { enter };
}
