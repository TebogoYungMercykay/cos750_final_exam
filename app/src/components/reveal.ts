/** Header height plus breathing room; matches `scroll-margin-top` on `.reveal-target`. */
const TOP_CLEARANCE = 88

/**
 * Brings a new result into view and moves focus to it, so keyboard and screen
 * reader users land on it too. Scrolls only when the result starts above the
 * header or below the middle of the window, so a result already in view stays put.
 */
export function reveal(el: HTMLElement | null) {
  if (!el) return
  const top = el.getBoundingClientRect().top
  if (top < TOP_CLEARANCE || top > window.innerHeight / 2) {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    el.scrollIntoView?.({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
  }
  el.focus({ preventScroll: true })
}
