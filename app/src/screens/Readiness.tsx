import { ArrowLeft, ArrowRight, BookOpen, ChartColumn, Dumbbell, GraduationCap, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Quiz } from '../components/QuestionCard'
import { reveal } from '../components/reveal'
import { readinessSet } from '../content/assessment'
import { OUTCOMES, OUTCOME_IDS } from '../content/modules'
import { REVIEW } from '../content/playground'
import type { Question } from '../content/types'
import { useProgress } from '../state/progress'
import { href } from '../state/router'
import { appRng } from '../state/rng'
import { percent, READY, summarise, type Summary } from '../state/scoring'

export function MasteryBars({ values }: { values: Partial<Record<string, number | null>> }) {
  return (
    <ul className="mastery">
      {OUTCOME_IDS.map((lo) => {
        const value = values[lo] ?? null
        return (
          <li key={lo}>
            <span className="mastery-label">{OUTCOMES[lo].short}</span>
            <span className="mastery-track" aria-hidden="true">
              <span
                className={value !== null && value >= READY ? 'is-good' : 'is-low'}
                style={{ width: percent(value ?? 0) }}
              />
              <i style={{ left: percent(READY) }} />
            </span>
            <span className="mastery-value">{value === null ? 'not yet' : percent(value)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function Readiness() {
  const { progress, addAssessment, award } = useProgress()
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro')
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<Summary | null>(null)
  const [attempt, setAttempt] = useState(0)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const weak = result ? OUTCOME_IDS.filter((lo) => (result.perOutcome[lo] ?? 0) < READY) : []
  const best = progress.assessments.length ? Math.max(...progress.assessments.map((a) => a.overall)) : null
  /** The attempt before the one just finished; the newest entry is the result on screen. */
  const previous = phase === 'result' ? progress.assessments.at(-2) : undefined

  const begin = () => {
    setQuestions(readinessSet(appRng))
    setAttempt((n) => n + 1)
    setPhase('quiz')
  }

  useEffect(() => {
    if (phase === 'result') reveal(resultRef.current)
  }, [phase])

  return (
    <div className="page narrow">
      <a className="back" href={href({ name: 'home' })}>
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </a>
      <header className="page-head">
        <p className="eyebrow">
          <GraduationCap size={16} aria-hidden="true" />
          Twelve questions
        </p>
        <h1 className="display-2">
          Lecture <em>readiness</em> check
        </h1>
      </header>

      {phase === 'intro' && (
        <div className="card rise">
          <p className="lede">
            Two questions for each learning outcome. Several use freshly generated trees, so each attempt is different.
          </p>
          <p>
            Hints are still available, but each hint or wrong attempt lowers the credit for that question. At the end
            you get a mastery score per outcome and a personal review plan.
          </p>
          {best !== null && (
            <p className="muted">
              Previous best: {percent(best)} over {progress.assessments.length} attempt
              {progress.assessments.length > 1 ? 's' : ''}.
            </p>
          )}
          <div className="row" data-tour="check-start">
            <button type="button" className="btn btn-primary btn-lg" onClick={begin}>
              Start
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="card rise">
          <Quiz
            questions={questions}
            revealFirst={attempt > 1}
            onFinish={(answers) => {
              const summary = summarise(answers)
              addAssessment({ at: Date.now(), overall: summary.overall, perOutcome: summary.perOutcome })
              if (OUTCOME_IDS.every((lo) => (summary.perOutcome[lo] ?? 0) >= READY)) award('ready')
              setResult(summary)
              setPhase('result')
            }}
          />
        </div>
      )}

      {phase === 'result' && result && (
        <div className="card rise">
          <h2 className="display-3 reveal-target" tabIndex={-1} ref={resultRef}>
            {weak.length ? 'Almost there. Here is your review plan.' : 'You are ready for the lecture.'}
          </h2>
          <p>
            Overall: <strong>{percent(result.overall)}</strong>. The marker on each bar is the 70% needed to count as
            ready.
          </p>
          <MasteryBars values={result.perOutcome} />
          <h3 className="subhead">Compared with yourself</h3>
          <ul className="history">
            {progress.warmup && (
              <li>
                <span>Warm-up, before the lessons</span>
                <strong>
                  {progress.warmup.score} of {progress.warmup.of}
                </strong>
              </li>
            )}
            {previous ? (
              <>
                <li>
                  <span>Overall</span>
                  <strong>
                    was {percent(previous.overall)}, now {percent(result.overall)}
                  </strong>
                </li>
                {OUTCOME_IDS.map((lo) => {
                  const was = previous.perOutcome[lo]
                  const now = result.perOutcome[lo]
                  return was === undefined || now === undefined ? null : (
                    <li key={lo}>
                      <span>{OUTCOMES[lo].short}</span>
                      <strong>
                        was {percent(was)}, now {percent(now)}
                      </strong>
                    </li>
                  )
                })}
              </>
            ) : (
              <li>
                <span>This is your first readiness check. Take it again later to see how far you have come.</span>
              </li>
            )}
          </ul>

          {weak.length > 0 ? (
            <>
              <h3 className="display-4">Recommended before the lecture</h3>
              <ul className="plan">
                {weak.map((lo) => (
                  <li key={lo}>
                    <span>
                      <strong>{OUTCOMES[lo].short}</strong>
                      <span className="muted">{OUTCOMES[lo].text}</span>
                    </span>
                    <span className="row">
                      <a className="btn" href={href({ name: 'practice', topic: lo })}>
                        <Dumbbell size={18} aria-hidden="true" />
                        Practise
                      </a>
                      <a className="btn" href={href({ name: 'playground', ...REVIEW[lo] })}>
                        <Play size={18} aria-hidden="true" />
                        {REVIEW[lo].label}
                      </a>
                      <a className="btn btn-quiet" href={href({ name: 'lesson', id: OUTCOMES[lo].module })}>
                        <BookOpen size={18} aria-hidden="true" />
                        Redo lesson
                      </a>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="callout">
              Bring your questions to the lecture. You have the foundations to follow along and to engage with the
              harder parts, such as deletion and balancing.
            </p>
          )}
          <div className="row">
            <button type="button" className="btn" onClick={begin}>
              <RotateCcw size={18} aria-hidden="true" />
              Try a new set
            </button>
            <a className="btn btn-quiet" href={href({ name: 'progress' })}>
              <ChartColumn size={18} aria-hidden="true" />
              See my progress
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
