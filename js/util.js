/* ============================================================================
   util — small shared helpers
   ========================================================================= */

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** '#0C272C' -> '12, 39, 44', for use inside rgba(). */
export function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

/**
 * Blend two hex colours, returning 'r, g, b'.
 *
 * Used to lift each section's accent toward the paper colour for small text.
 * A mid-tone accent sitting on a dark ground tops out around 4.5:1 however
 * hard the scrim works, so label text uses a tint of it rather than the
 * accent itself. Rules, stitching and player controls keep the pure colour.
 */
export function mixToRgb(hex, towardHex, amount) {
  const parse = (h) => {
    const s = h.replace('#', '').trim();
    const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
    const n = parseInt(full, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const a = parse(hex);
  const b = parse(towardHex);
  return a.map((v, i) => Math.round(v + (b[i] - v) * amount)).join(', ');
}

/** Seconds -> 4:07 (or 1:04:07). Returns '–:––' for anything unusable. */
export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '–:––';
  const s = Math.floor(seconds % 60);
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m);
  return `${h > 0 ? h + ':' : ''}${mm}:${String(s).padStart(2, '0')}`;
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Build an element in one call. */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'style') node.setAttribute('style', v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of [].concat(children)) {
    if (c) node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

/** Inline SVG from a path/shape string, sized by CSS. */
export function icon(viewBox, inner) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = inner;
  return svg;
}

/** Split a detail string on blank lines into paragraphs. */
export const paragraphs = (text) => text.split('\n\n').map((p) => p.trim()).filter(Boolean);
