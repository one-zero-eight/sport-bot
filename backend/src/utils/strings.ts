/**
 * Splits a string like in Python's `str.split` function.
 */
export function split(str: string, sep: string, maxSplit: number = -1): string[] {
  const parts = str.split(sep)
  if (maxSplit < 0) {
    return parts
  }
  const splitsLeft = parts.slice(0, maxSplit)
  const rest = parts.slice(maxSplit)
  if (rest.length > 0) {
    splitsLeft.push(rest.join(sep))
  }
  return splitsLeft
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
