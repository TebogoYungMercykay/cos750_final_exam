export const MAX_NAME = 30

/** Letters from any language, with single spaces or hyphens between parts: Thabo, Zoë, Mary-Jane, Le Roux. */
const NAME = /^\p{L}+(?:[ -]\p{L}+)*$/u

/** The name to save, trimmed, or null when it breaks the rule above or is too long. */
export function cleanName(text: string): string | null {
  const name = text.trim()
  return name.length > 0 && name.length <= MAX_NAME && NAME.test(name) ? name : null
}

/** The first letter, as a capital, for the avatar. */
export const initialOf = (name: string) => ([...name.trim()][0] ?? '?').toLocaleUpperCase()

/** One of four theme shades, chosen by the first letter, so a name always gets the same colour. */
export const toneOf = (name: string) => (initialOf(name).codePointAt(0) ?? 0) % 4
