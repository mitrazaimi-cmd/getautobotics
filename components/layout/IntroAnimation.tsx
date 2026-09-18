/**
 * Brand intro: the logo appears large in the middle of the screen, then fades
 * and lifts away to reveal the page.
 *
 * - Rendered in the HTML, so there is no flash of the page before it appears
 * - Pure CSS, so it also completes without JavaScript
 * - Plays on every load of the home page
 *   (to play it only once per visit, see the note in app/globals.css)
 * - Skipped entirely under `prefers-reduced-motion: reduce`
 * - `pointer-events: none` and `aria-hidden`, so it never blocks clicks or screen readers
 */
export function IntroAnimation() {
  return (
    <div className="intro" aria-hidden="true">
      {/* Plain <img>: this must paint immediately, without the image optimizer */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="intro-logo" src="/logo.png" alt="" width={449} height={242} fetchPriority="high" />
    </div>
  );
}
