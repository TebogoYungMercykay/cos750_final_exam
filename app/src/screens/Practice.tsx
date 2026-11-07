import { ArrowLeft, Shuffle } from 'lucide-react'
import { useState } from 'react'
import { QuestionCard } from '../components/QuestionCard'
import { questionFor } from '../content/assessment'
import { MODULE_BY_ID, OUTCOMES, OUTCOME_IDS } from '../content/modules'
import type { OutcomeId, Question } from '../content/types'
import { useProgress } from '../state/progress'
import { href } from '../state/router'
import { appRng } from '../state/rng'
import { mastery, percent } from '../state/scoring'

export function Practice({ topic }: { topic?: OutcomeId }) {
  const { progress, record, solvedPractice, award } = useProgress()
  const [question, setQuestion] = useState<Question | null>(() => (topic ? questionFor(topic, appRng) : null))
  const [session, setSession] = useState(0)

  return (
    <div className="page">
      <a className="back" href={href({ name: 'home' })}>
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </a>
      <header className="page-head">
        <p className="eyebrow">Unlimited</p>
        <h1 className="display-2">
          Practice <em>gym</em>
        </h1>
        <p className="lede">Every exercise uses a freshly generated tree, so you can practise as often as you like.</p>
      </header>

      {!topic && (
        <ul className="tiles">
          {OUTCOME_IDS.map((lo) => {
            const Icon = MODULE_BY_ID[OUTCOMES[lo].module].icon
            const score = mastery(progress.results, lo)
            return (
              <li key={lo}>
                <a className="tile" href={href({ name: 'practice', topic: lo })}>
                  <span className="tile-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="tile-title">{OUTCOMES[lo].short}</span>
                  <span className="tile-text">{OUTCOMES[lo].text}</span>
                  {score !== null && <span className="pill">Mastery {percent(score)}</span>}
                </a>
              </li>
            )
          })}
        </ul>
      )}

      {topic && question && (
        <div className="card rise">
          <div className="row row-split">
            <p className="eyebrow">
              {OUTCOMES[topic].short}
              <span className="muted">
                {' '}
                This session: {session}. Total solved: {progress.practiceSolved}.
              </span>
            </p>
            <a className="btn btn-quiet" href={href({ name: 'practice' })}>
              <Shuffle size={18} aria-hidden="true" />
              Change topic
            </a>
          </div>
          <QuestionCard
            key={question.id}
            question={question}
            reveal={session > 0}
            onDone={(answer) => {
              record(answer.lo, answer.score)
              if (answer.score > 0) {
                solvedPractice()
                if (progress.practiceSolved + 1 >= 10) award('practice10')
              }
              setSession((n) => n + 1)
              setQuestion(questionFor(topic, appRng))
            }}
          />
        </div>
      )}
    </div>
  )
}
