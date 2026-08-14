/* ============================================================================
   players — one YouTube playlist per section, wired to the real IFrame API

   Rules this module keeps:
     · no iframe exists until its section is within one viewport
     · exactly one player is ever playing
     · leaving a section fades the volume to zero over ~600ms and then pauses,
       remembering the position; returning seeks back and fades up
     · every control drives the API or is visibly disabled
     · a section with no playlist ID never creates an iframe at all
     · no API key, anywhere
   ========================================================================= */

import { SECTIONS } from './sections.js';
import { formatTime, clamp } from './util.js';
import { playlistUrl } from './render.js';

const API_SRC = 'https://www.youtube.com/iframe_api';
const FADE_MS = 600;
const SEEK_STEP = 5;

let apiPromise = null;

/** Load the IFrame API once, on demand. Never loaded if no section has an ID. */
function loadApi() {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    if (window.YT && window.YT.Player) return resolve(window.YT);

    const timer = setTimeout(() => reject(new Error('The YouTube player did not load.')), 15000);
    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      if (typeof previous === 'function') previous();
      resolve(window.YT);
    };

    const script = document.createElement('script');
    script.src = API_SRC;
    script.async = true;
    script.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('The YouTube player could not be reached.'));
    });
    document.head.append(script);
  });

  return apiPromise;
}

const ERROR_TEXT = {
  2: 'That playlist could not be opened.',
  5: 'This recording will not play in this browser.',
  100: 'This recording is no longer available.',
  101: 'The owner does not allow this recording to be played outside YouTube.',
  150: 'The owner does not allow this recording to be played outside YouTube.',
};

/* ========================================================================== */

class SectionPlayer {
  constructor(section, root) {
    this.section = section;
    this.root = root;
    /* A section is either a playlist or one recording. Both are legitimate
       for a cultural record — sometimes there is a definitive take rather
       than a selection — so both are supported, and a single track simply
       has nothing for previous and next to move between. */
    this.playlistId = section.youtubePlaylistId || '';
    this.videoId = section.youtubeVideoId || '';
    this.single = Boolean(this.videoId && !this.playlistId);
    this.id = this.playlistId || this.videoId;

    this.yt = null;
    this.mounting = null;
    this.playing = false;
    this.wantsPlay = false;   // set by a real press; the only thing that lets
    this.suspended = false;   // playback resume on scroll-back
    this.position = 0;
    this.volume = 100;
    this.fadeFrame = null;
    this.ticker = null;
    this.duration = 0;

    this.q = {
      mount: root.querySelector('.player__mount'),
      thumb: root.querySelector('.player__thumb'),
      thumbMark: root.querySelector('.player__thumb-mark'),
      title: root.querySelector('.player__track-title'),
      artist: root.querySelector('.player__artist'),
      sep: root.querySelector('.player__sep'),
      out: root.querySelector('.player__out'),
      note: root.querySelector('.player__note'),
      bar: root.querySelector('.player__bar'),
      fill: root.querySelector('.player__bar-fill'),
      knob: root.querySelector('.player__bar-knob'),
      cur: root.querySelector('.player__time--cur'),
      dur: root.querySelector('.player__time--dur'),
      prev: root.querySelector('.player__btn--prev'),
      play: root.querySelector('.player__btn--play'),
      next: root.querySelector('.player__btn--next'),
    };

    if (this.id) this.bind();
  }

  get state() { return this.root.dataset.state; }

  setState(state) { this.root.dataset.state = state; }

  /* ------------------------------------------------------------- wiring -- */

  bind() {
    this.q.play.addEventListener('click', () => this.toggle());
    this.bindScrub();

    // Nothing to step between on a single recording, so the controls say so
    // rather than sitting there doing nothing when pressed.
    if (this.single) {
      for (const btn of [this.q.prev, this.q.next]) {
        btn.disabled = true;
        btn.setAttribute('aria-label', `${this.section.nameRoman} is a single recording`);
      }
      return;
    }

    this.q.prev.addEventListener('click', () => this.step('previous'));
    this.q.next.addEventListener('click', () => this.step('next'));
  }

  bindScrub() {
    const bar = this.q.bar;
    let dragging = false;

    const ratioFrom = (event) => {
      const r = bar.getBoundingClientRect();
      return clamp((event.clientX - r.left) / r.width, 0, 1);
    };

    const seekTo = (ratio) => {
      if (!this.yt || !this.duration) return;
      this.position = ratio * this.duration;
      this.yt.seekTo(this.position, true);
      this.paint(this.position, this.duration);
    };

    bar.addEventListener('pointerdown', (e) => {
      if (!this.yt || !this.duration) return;
      dragging = true;
      bar.classList.add('is-scrubbing');
      bar.setPointerCapture(e.pointerId);
      seekTo(ratioFrom(e));
    });

    bar.addEventListener('pointermove', (e) => { if (dragging) seekTo(ratioFrom(e)); });

    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove('is-scrubbing');
      if (bar.hasPointerCapture(e.pointerId)) bar.releasePointerCapture(e.pointerId);
    };
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);

    bar.addEventListener('keydown', (e) => {
      if (!this.yt || !this.duration) return;
      const jump = { ArrowLeft: -SEEK_STEP, ArrowRight: SEEK_STEP, PageDown: -30, PageUp: 30 };
      let next = null;
      if (e.key in jump) next = this.position + jump[e.key];
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = this.duration;
      if (next === null) return;
      e.preventDefault();
      seekTo(clamp(next, 0, this.duration) / this.duration);
    });
  }

  /* -------------------------------------------------------------- mount -- */

  /** The playlist embed URL. Built here rather than passed as playerVars so
      the iframe is already pointed at youtube.com before the API touches it —
      see the attach step below for why that matters. */
  embedUrl() {
    const params = new URLSearchParams({
      enablejsapi: '1',
      playsinline: '1',
      controls: '0',
      disablekb: '1',
      rel: '0',
      modestbranding: '1',
      iv_load_policy: '3',
    });
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      params.set('origin', location.origin);
    }
    if (this.single) {
      return `https://www.youtube.com/embed/${this.videoId}?${params}`;
    }
    params.set('list', this.playlistId);
    return `https://www.youtube.com/embed/videoseries?${params}`;
  }

  /** Where "Open on YouTube" and the error fallback should send people. */
  externalUrl() {
    return this.single
      ? `https://www.youtube.com/watch?v=${this.videoId}`
      : `https://www.youtube.com/playlist?list=${this.playlistId}`;
  }

  /** Create the iframe. Called when the section is a viewport away, or on a
      press, whichever happens first. */
  ensure() {
    if (!this.id || this.yt || this.mounting) return this.mounting || Promise.resolve();

    this.setState('loading');

    this.mounting = loadApi()
      .then((YT) => new Promise((resolve, reject) => {
        const frame = document.createElement('iframe');
        frame.src = this.embedUrl();
        frame.title = `${this.section.nameRoman} playlist`;
        frame.allow = 'autoplay; encrypted-media; picture-in-picture';
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.setAttribute('frameborder', '0');
        frame.tabIndex = -1;              // the pill above is the control surface

        const failed = setTimeout(
          () => reject(new Error('The player did not become ready.')), 15000);

        // Attach only once the frame is really at youtube.com. Attaching
        // sooner makes the API's first handshake message target an origin the
        // still-blank frame does not have yet, which the browser logs as a
        // cross-origin postMessage warning.
        let attached = false;
        const attach = () => {
          if (attached) return;
          attached = true;
          this.yt = new YT.Player(frame, {
            events: {
              onReady: () => { clearTimeout(failed); this.onReady(); resolve(); },
              onStateChange: (e) => this.onStateChange(e),
              onError: (e) => this.onError(e),
            },
          });
        };

        frame.addEventListener('load', attach, { once: true });
        setTimeout(attach, 6000);   // in case load never fires

        const slot = this.q.mount.firstElementChild;
        slot.replaceWith(frame);
      }))
      .catch((err) => {
        this.fail(err && err.message ? err.message : 'This recording could not be loaded.');
      });

    return this.mounting;
  }

  onReady() {
    try { this.yt.setVolume(this.volume); } catch { /* not attached yet */ }
    this.readMetadata();
  }

  onStateChange(e) {
    const YT = window.YT;
    if (!YT) return;

    if (e.data === YT.PlayerState.PLAYING) {
      stopEveryoneExcept(this);
      this.playing = true;
      this.root.dataset.playing = 'true';
      this.q.play.setAttribute('aria-label', `Pause — ${this.section.nameRoman}`);
      this.startTicker();
    } else {
      this.playing = false;
      this.root.dataset.playing = 'false';
      this.q.play.setAttribute('aria-label', `Play — ${this.section.nameRoman}`);
      this.stopTicker();
      if (e.data === YT.PlayerState.ENDED) this.position = 0;
    }

    this.readMetadata();
  }

  onError(e) {
    this.fail(ERROR_TEXT[e.data] || 'This recording could not be played.');
  }

  /** Never guess. If the API gives nothing, the section name is all we show. */
  readMetadata() {
    if (!this.yt || this.state === 'error') return;

    let data = null;
    try { data = this.yt.getVideoData ? this.yt.getVideoData() : null; } catch { data = null; }

    const title = data && data.title ? data.title : '';
    const author = data && data.author ? data.author : '';

    if (!title) {
      this.q.title.textContent = this.section.nameRoman;
      return;
    }

    this.setState('ready');
    this.q.title.textContent = title;
    this.q.title.setAttribute('title', title);
    this.q.artist.textContent = author;
    this.q.sep.hidden = !author;

    if (data.video_id) this.setThumb(data.video_id);

    try {
      const d = this.yt.getDuration();
      if (Number.isFinite(d) && d > 0) {
        this.duration = d;
        this.paint(this.yt.getCurrentTime(), d);
      }
    } catch { /* duration is not ready yet; the ticker will pick it up */ }
  }

  setThumb(videoId) {
    if (this.thumbFor === videoId) return;
    this.thumbFor = videoId;

    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.addEventListener('load', () => {
      const old = this.q.thumb.querySelector('img');
      if (old) old.remove();
      this.q.thumb.append(img);
      this.q.thumbMark.hidden = true;
    }, { once: true });
    // If it never loads, the peengh mark simply stays. Nothing to report.
    img.addEventListener('error', () => { this.q.thumbMark.hidden = false; }, { once: true });
    img.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
  }

  fail(message) {
    this.setState('error');
    this.stopTicker();
    this.playing = false;
    this.root.dataset.playing = 'false';
    this.q.note.textContent = message + ' ';

    const href = this.externalUrl();
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Open on YouTube';
    this.q.note.append(link);

    for (const b of [this.q.prev, this.q.play, this.q.next]) b.disabled = true;
  }

  /* ------------------------------------------------------------ controls -- */

  async toggle() {
    if (!this.id) return;
    if (this.playing) return this.pauseByUser();

    this.wantsPlay = true;
    await this.ensure();
    if (!this.yt || this.state === 'error') return;

    stopEveryoneExcept(this);
    this.cancelFade();
    this.yt.setVolume(this.volume);
    if (this.position > 0.5) this.yt.seekTo(this.position, true);
    this.yt.playVideo();
  }

  pauseByUser() {
    this.wantsPlay = false;
    this.cancelFade();
    if (!this.yt) return;
    this.position = this.safeTime();
    this.yt.pauseVideo();
    this.yt.setVolume(this.volume);
  }

  async step(direction) {
    this.wantsPlay = true;
    await this.ensure();
    if (!this.yt || this.state === 'error') return;
    this.position = 0;
    this.cancelFade();
    this.yt.setVolume(this.volume);
    if (direction === 'next') this.yt.nextVideo();
    else this.yt.previousVideo();
  }

  /* --------------------------------------------------------- scroll away -- */

  /** Fade out, then pause. Audio is never cut dead. */
  async suspend() {
    if (!this.yt || !this.playing) return;
    this.suspended = true;
    this.position = this.safeTime();
    await this.fadeTo(0, FADE_MS);
    if (this.suspended && this.yt) this.yt.pauseVideo();
  }

  /** Come back to where it was left. Consent was given on the first press. */
  async resume() {
    this.suspended = false;
    if (!this.yt || !this.wantsPlay || this.playing) return;
    stopEveryoneExcept(this);
    this.cancelFade();
    if (Math.abs(this.safeTime() - this.position) > 0.6) this.yt.seekTo(this.position, true);
    this.yt.setVolume(0);
    this.yt.playVideo();
    await this.fadeTo(this.volume, FADE_MS);
  }

  /** Another section started. Stop without clearing wantsPlay. */
  yield() {
    if (!this.yt || !this.playing) return;
    this.position = this.safeTime();
    this.cancelFade();
    this.yt.pauseVideo();
  }

  fadeTo(target, ms) {
    this.cancelFade();
    return new Promise((resolve) => {
      if (!this.yt || typeof this.yt.getVolume !== 'function') return resolve();
      let from;
      try { from = this.yt.getVolume(); } catch { return resolve(); }
      const start = performance.now();
      const step = (now) => {
        const k = clamp((now - start) / ms, 0, 1);
        try { this.yt.setVolume(Math.round(from + (target - from) * k)); } catch { /* torn down */ }
        if (k < 1) this.fadeFrame = requestAnimationFrame(step);
        else { this.fadeFrame = null; resolve(); }
      };
      this.fadeFrame = requestAnimationFrame(step);
    });
  }

  cancelFade() {
    if (this.fadeFrame) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
  }

  /* -------------------------------------------------------------- ticker -- */

  startTicker() {
    this.stopTicker();
    this.ticker = setInterval(() => {
      if (!this.yt) return this.stopTicker();
      const t = this.safeTime();
      let d = this.duration;
      try { d = this.yt.getDuration(); } catch { /* keep the last known */ }
      if (Number.isFinite(d) && d > 0) this.duration = d;
      this.position = t;
      this.paint(t, this.duration);
    }, 250);
  }

  stopTicker() {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
  }

  safeTime() {
    try { return this.yt.getCurrentTime() || 0; } catch { return this.position; }
  }

  paint(current, duration) {
    const ratio = duration > 0 ? clamp(current / duration, 0, 1) : 0;
    this.q.fill.style.width = `${(ratio * 100).toFixed(2)}%`;
    this.q.knob.style.left = `${(ratio * 100).toFixed(2)}%`;
    this.q.cur.textContent = formatTime(current);
    this.q.dur.textContent = formatTime(duration);
    this.q.bar.setAttribute('aria-valuenow', Math.round(ratio * 100));
    this.q.bar.setAttribute('aria-valuetext', `${formatTime(current)} of ${formatTime(duration)}`);
  }
}

/* ---------------------------------------------------------------- registry -- */

const players = [];

function stopEveryoneExcept(keep) {
  for (const p of players) if (p !== keep) p.yield();
}

export function initPlayers() {
  players.length = 0;
  const observed = [];

  for (const section of SECTIONS) {
    const root = document.querySelector(`.player[data-id="${section.id}"]`);
    if (!root) continue;

    const player = new SectionPlayer(section, root);
    players.push(player);

    // player.id is a playlist or a single recording, whichever was supplied.
    if (!player.id) {
      root.querySelector('.player__track-title').textContent = section.nameRoman;
      continue;
    }

    observed.push([player, document.getElementById(section.id)]);
  }

  /** Begin watching. Held until the visitor enters, so a page that is only
      ever looked at costs nobody three YouTube iframes. */
  function start() {
    for (const [player, chapter] of observed) {
      // Mount when the section is a viewport away from entering.
      new IntersectionObserver((entries, observer) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          observer.disconnect();
          player.ensure();
        }
      }, { rootMargin: '100% 0px 100% 0px' }).observe(chapter);

      // Half the section on screen is the line between playing and not.
      new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) player.resume();
          else player.suspend();
        }
      }, { threshold: 0.5 }).observe(chapter);
    }
  }

  /** Start a section's music from outside the scroll system.

      The title card uses this on the first section, so the music the visitor
      turns on under the card is simply Sawan's — it carries straight through
      the entry with nothing to hand over and nothing to crossfade, and the
      button already says "Enter Sawan". Returns false if that section has no
      recording, so the caller can leave its control out rather than offer a
      dead one. */
  async function play(id) {
    const player = players.find((p) => p.section.id === id);
    if (!player || !player.id) return false;
    await player.toggle();
    return true;
  }

  const hasMusic = (id) => {
    const player = players.find((p) => p.section.id === id);
    return Boolean(player && player.id);
  };

  return { players, start, play, hasMusic };
}

/** The player belonging to whichever section is nearest the middle of the
    screen — what the spacebar acts on. */
export function nearestPlayer() {
  const middle = window.innerHeight / 2;
  let best = null;
  let bestGap = Infinity;

  for (const p of players) {
    const chapter = document.getElementById(p.section.id);
    if (!chapter) continue;
    const r = chapter.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    const gap = Math.abs((r.top + r.height / 2) - middle);
    if (gap < bestGap) { bestGap = gap; best = p; }
  }

  return best;
}
