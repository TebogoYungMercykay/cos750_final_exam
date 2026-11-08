import { ArrowLeft, Lock, Printer } from 'lucide-react'
import { useState } from 'react'
import { BADGES, type BadgeId } from '../content/badges'
import { MODULES, OUTCOMES, OUTCOME_IDS } from '../content/modules'
import { useProgress } from '../state/progress'
import { href } from '../state/router'
import { mastery, percent, READY } from '../state/scoring'
import { MasteryBars } from './Readiness'

const REFLECTION_TITLES = Object.fromEntries(
  MODULES.flatMap((m) => m.sections.flatMap((s) => (s.type === 'reflect' ? [[s.id, m.title]] : []))),
)

const dated = (at: number) => new Date(at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })

export function ProgressPage() {
  const { progress } = useProgress()
  const [today] = useState(() => Date.now())
  const checks = progress.assessments
  const best = checks.length ? Math.max(...checks.map((a) => a.overall)) : null
  const notes = Object.entries(progress.reflections).filter(([, text]) => text)
  const levels = Object.fromEntries(OUTCOME_IDS.map((lo) => [lo, mastery(progress.results, lo)]))
  const ready = OUTCOME_IDS.filter((lo) => (levels[lo] ?? 0) >= READY)
  const review = OUTCOME_IDS.filter((lo) => !ready.includes(lo))

  return (
    <div className="page">
      <a className="back" href={href({ name: 'home' })}>
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </a>
      <header className="page-head">
        <p className="eyebrow">{progress.name}</p>
        <h1 className="display-2">
          My <em>progress</em>
        </h1>
      </header>

      <div className="progress-grid">
        <section className="card" aria-labelledby="mastery-title">
          <h2 id="mastery-title" className="display-4">
            Mastery per learning outcome
          </h2>
          <p className="muted">
            Based on your last 10 answers for each outcome. 70% or more means you are ready for that part of the
            lecture.
          </p>
          <MasteryBars values={levels} />
          <h3 className="subhead">Compared with yourself</h3>
          <ul className="history">
            <li>
              <span>Warm-up, before the lessons</span>
              <strong>{progress.warmup ? `${progress.warmup.score} of ${progress.warmup.of}` : 'not taken'}</strong>
            </li>
            {checks.length > 0 && (
              <li>
                <span>First readiness check, {dated(checks[0].at)}</span>
                <strong>{percent(checks[0].overall)}</strong>
              </li>
            )}
            {checks.length > 1 && (
              <li>
                <span>Latest readiness check, {dated(checks[checks.length - 1].at)}</span>
                <strong>{percent(checks[checks.length - 1].overall)}</strong>
              </li>
            )}
            {best !== null && (
              <li>
                <span>
                  Best of {checks.length} check{checks.length > 1 ? 's' : ''}
                </span>
                <strong>{percent(best)}</strong>
              </li>
            )}
          </ul>
        </section>

        <section className="card" aria-labelledby="badges-title">
          <h2 id="badges-title" className="display-4">
            Badges
          </h2>
          <ul className="badges">
            {(Object.keys(BADGES) as BadgeId[]).map((id) => {
              const badge = BADGES[id]
              const earned = progress.badges.includes(id)
              const Icon = earned ? badge.icon : Lock
              return (
                <li key={id} className={earned ? 'is-earned' : undefined}>
                  <span className="badge-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{badge.name}</strong>
                    <span className="muted">{badge.description}</span>
                    <span className="visually-hidden">{earned ? 'Earned.' : 'Not earned yet.'}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="card lecture-card progress-notes" aria-labelledby="card-title" data-tour="progress-card">
          <h2 id="card-title" className="display-4">
            My lecture card
          </h2>
          <p className="muted">
            {progress.name}, {dated(today)}.
            <span className="no-print"> Take this to the lecture. Print it, or save it as a PDF.</span>
          </p>
          <div className="lecture-card-grid">
            <div>
              <h3 className="subhead">Ready for</h3>
              {ready.length ? (
                <ul className="card-list">
                  {ready.map((lo) => (
                    <li key={lo}>
                      <strong>{OUTCOMES[lo].short}</strong> {percent(levels[lo]!)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Nothing at 70% yet.</p>
              )}
            </div>
            <div>
              <h3 className="subhead">To review, or ask about in the lecture</h3>
              {review.length ? (
                <ul className="card-list">
                  {review.map((lo) => (
                    <li key={lo}>
                      <strong>{OUTCOMES[lo].short}</strong>{' '}
                      {levels[lo] === null ? 'not practised yet' : percent(levels[lo]!)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Nothing: every outcome is at 70% or more.</p>
              )}
            </div>
          </div>
          <h3 className="subhead">My notes</h3>
          {notes.length ? (
            <ul className="notes">
              {notes.map(([id, text]) => (
                <li key={id}>
                  <span className="note-kicker">{REFLECTION_TITLES[id] ?? id}</span>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Notes you save in the lessons appear here.</p>
          )}
          <div className="row no-print">
            <button type="button" className="btn" onClick={() => window.print()}>
              <Printer size={18} aria-hidden="true" />
              Print or save as PDF
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
