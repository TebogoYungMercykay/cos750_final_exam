import { ArrowLeft, Lock, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { BADGES, type BadgeId } from '../content/badges'
import { MODULES, OUTCOME_IDS } from '../content/modules'
import { useProgress } from '../state/progress'
import { href } from '../state/router'
import { mastery, percent } from '../state/scoring'
import { MasteryBars } from './Readiness'

const REFLECTION_TITLES = Object.fromEntries(
  MODULES.flatMap((m) => m.sections.filter((s) => s.type === 'reflect').map((s) => [s.id, m.title])),
)

export function ProgressPage() {
  const { progress, reset } = useProgress()
  const [confirming, setConfirming] = useState(false)
  const best = progress.assessments.length ? Math.max(...progress.assessments.map((a) => a.overall)) : null
  const notes = Object.entries(progress.reflections).filter(([, text]) => text)

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
            {best !== null && ` Best readiness check: ${percent(best)}.`}
          </p>
          <MasteryBars values={Object.fromEntries(OUTCOME_IDS.map((lo) => [lo, mastery(progress.results, lo)]))} />
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

        <section className="card progress-notes" aria-labelledby="notes-title">
          <h2 id="notes-title" className="display-4">
            My reflection notes
          </h2>
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
            <p className="muted">Notes you save in the lessons appear here. Take them to the lecture.</p>
          )}
        </section>
      </div>

      <div className="danger-zone">
        {confirming ? (
          <div className="row" role="group" aria-label="Confirm reset">
            <span>Delete all progress, badges and notes on this device?</span>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                reset()
                setConfirming(false)
              }}
            >
              Yes, reset
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-quiet" onClick={() => setConfirming(true)}>
            <Trash2 size={18} aria-hidden="true" />
            Reset progress
          </button>
        )}
      </div>
    </div>
  )
}
