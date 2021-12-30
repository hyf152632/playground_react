/**
 * get the max z-index in current html elements
 */
export default function getCurrentMaxZIndex() {
  return Math.max(
    ...Array.from(document.querySelectorAll("body *"))
      .map((a) => parseFloat(window.getComputedStyle(a).zIndex))
      .filter((n) => !Number.isNaN(n)),
    0
  );
}
