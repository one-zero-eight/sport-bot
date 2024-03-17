/**
 * Returns a copy of the string with all "&", "<", and ">" characters
 * replaced with their corresponding HTML entities.
 *
 * @see https://core.telegram.org/bots/api#html-style
 */
export function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll('&', '&amp;') // must be first
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
