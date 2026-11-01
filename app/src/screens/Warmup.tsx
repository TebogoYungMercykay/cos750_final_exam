import { ArrowLeft, ArrowRight, Sprout } from 'lucide-react'
import { useState } from 'react'
import { CONFIDENCE, needsGuidance, WARMUP } from '../content/assessment'
import { Quiz } from '../components/QuestionCard'
import { useProgress } from '../state/progress'
import { href } from '../state/router'

export function Warmup() {
  const { update, award } = useProgress()
  const [phase, setPhase] = useState<'confidence' | 'quiz' | 'done'>('confidence')
  const [confidence, setConfidence] = useState<number | null>(null)
  const [outcome, setOutcome] = useState<{ correct: number; guided: boolean } | null>(null)

  return (
    <div className="page narrow">
      <a className="back" href={href({ name: 'home' })}>
        <ArrowLeft size={16} aria-hidden="true" /> Home
      </a>
      <header className="page-head">
        <p className="eyebrow">
          <Sprout size={16} aria-hidden="true" />
          Two minutes
        </p>
        <h1 className="display-2">
          A quick <em>warm-up</em>
        </h1>
      </header>

      {phase === 'confidence' && (
        <div className="card rise">
          <p className="lede">Have you worked with trees in programming before?</p>
          <div className="options">
            {CONFIDENCE.map((text, i) => (
              <button
                type="button"
                key={text}
                className={`option${confidence === i ? ' is-selected' : ''}`}
                aria-pressed={confidence === i}
                onClick={() => setConfidence(i)}
              >
                {text}
              </button>
            ))}
          </div>
          <p className="muted">
            Any answer is fine; this app assumes no prior knowledge. Next come four quick questions on ideas we will
            build on. They do not count for marks.
          </p>
          <div className="row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={confidence === null}
              onClick={() => setPhase('quiz')}
            >
              Continue
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="card rise">
          <Quiz
            questions={WARMUP}
            onFinish={(answers) => {
              const correct = answers.filter((a) => a.score === 1).length
              const guided = needsGuidance(correct, confidence ?? 0)
              update({
                warmup: { score: correct, of: answers.length, confidence: confidence ?? 0 },
                mode: guided ? 'guided' : 'standard',
              })
              award('warmup')
              setOutcome({ correct, guided })
              setPhase('done')
            }}
          />
        </div>
      )}

      {phase === 'done' && outcome && (
        <div className="card rise">
          <h2 className="display-3">
            You got {outcome.correct} of {WARMUP.length}.
          </h2>
          {outcome.guided ? (
            <>
              <p>
                <strong>Guided mode</strong> is now on: hints are shown from the start and animations run slower. You
                can switch modes at any time with the button at the top.
              </p>
              <div className="callout">
                <strong>A quick refresher before you start</strong>
                <ul>
                  <li>
                    <strong>Stack:</strong> last in, first out, like a pile of plates. Recursion uses one behind the
                    scenes, the <em>call stack</em>.
                  </li>
                  <li>
                    <strong>Queue:</strong> first in, first out, like a line at the canteen.
                  </li>
                  <li>
                    <strong>Recursion:</strong> a function that solves a problem by calling itself on a smaller part,
                    until it reaches a simple base case.
                  </li>
                  <li>
                    <strong>Halving:</strong> if every step throws away half of the options, even a million options take
                    only about 20 steps.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <p>
              You are in <strong>standard mode</strong>. Hints appear when you need them. Prefer more support? Switch to
              guided mode at the top at any time.
            </p>
          )}
          <div className="row">
            <a className="btn btn-primary" href={href({ name: 'lesson', id: 'm1' })}>
              Start lesson 1: Trees 101
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
