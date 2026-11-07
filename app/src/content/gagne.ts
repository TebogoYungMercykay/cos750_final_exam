import type { GagneEvent, Module, Section, TaggedSection } from './types'

/** The Gagné event each kind of section usually plays. A section may override it with its own `event`. */
export const SECTION_EVENT: Record<Section['type'], GagneEvent> = {
  text: 4,
  tree: 4,
  figure: 4,
  compare: 4,
  explore: 5,
  animate: 5,
  frontier: 5,
  try: 6,
  reflect: 9,
}

export const eventOf = (section: TaggedSection): GagneEvent => section.event ?? SECTION_EVENT[section.type]

/**
 * The events a lesson covers. The hook gains attention (1), the outcome is
 * stated on the intro screen (2), the recall links to prior learning (3), a
 * guided try both elicits performance (6) and gives feedback (7), the
 * checkpoint assesses (8), and the takeaways aid retention (9).
 */
export function lessonEvents(m: Module): Set<GagneEvent> {
  const events = new Set<GagneEvent>([1, 2, 3])
  for (const section of m.sections) {
    const event = eventOf(section)
    events.add(event)
    if (event === 6) events.add(7)
  }
  if (m.quiz.length > 0) events.add(8)
  if (m.summary.length > 0) events.add(9)
  return events
}
