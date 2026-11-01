import { ArrowRight, CircleCheck, Eye, Info, Lightbulb } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { insertSlot } from '../engine/bst'
import type { PlacedSlot } from '../engine/layout'
import { traversalOrder, TRAVERSALS } from '../engine/traces'
import type { Answer, Question } from '../content/types'
import { useProgress } from '../state/progress'
import { credit } from '../state/scoring'
import { TreeView, type NodeState } from './TreeView'

type Status = 'open' | 'solved' | 'revealed'

interface QuestionCardProps {
  question: Question
  index?: number
  total?: number
  onDone: (answer: Answer) => void
}

const LETTERS = 'ABCDEF'

export function QuestionCard({ question: q, index = 0, total = 1, onDone }: QuestionCardProps) {
  const { progress } = useProgress()
  const guided = progress.mode === 'guided'
  const [mistakes, setMistakes] = useState(0)
  const [hintsAsked, setHintsAsked] = useState(0)
  const [wrongOptions, setWrongOptions] = useState<number[]>([])
  const [sequence, setSequence] = useState<number[]>([])
  const [flash, setFlash] = useState<number | string | null>(null)
  const [status, setStatus] = useState<Status>('open')
  const flashTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  const hints = q.hints
  const shownHints = Math.min(hints.length, Math.max(mistakes, hintsAsked, guided ? 1 : 0))
  const closed = status !== 'open'
  const order = q.type === 'order' ? traversalOrder(q.tree, q.kind) : []
  const slot = q.type === 'slot' ? insertSlot(q.tree, q.value) : null

  const miss = (target?: number | string) => {
    setMistakes((m) => m + 1)
    if (target !== undefined) {
      setFlash(target)
      window.clearTimeout(flashTimer.current)
      flashTimer.current = window.setTimeout(() => setFlash(null), 700)
    }
  }

  const chooseOption = (i: number) => {
    if (closed || q.type !== 'mcq' || wrongOptions.includes(i)) return
    if (i === q.answer) setStatus('solved')
    else {
      setWrongOptions((w) => [...w, i])
      miss()
    }
  }

  const chooseNode = (key: number) => {
    if (closed) return
    if (q.type === 'order') {
      if (sequence.includes(key)) return
      if (key === order[sequence.length]) {
        const next = [...sequence, key]
        setSequence(next)
        if (next.length === order.length) setStatus('solved')
      } else miss(key)
    } else if (q.type === 'node') {
      if (q.answer.includes(key)) setStatus('solved')
      else miss(key)
    }
  }

  const chooseSlot = (s: PlacedSlot) => {
    if (closed || !slot) return
    if (s.parent === slot.parent && s.side === slot.side) setStatus('solved')
    else miss(s.id)
  }

  const nodeState = (key: number): NodeState | '' => {
    if (flash === key) return 'wrong'
    if (q.type === 'order') {
      if (sequence.includes(key)) return 'visited'
      return status === 'revealed' ? 'dim' : ''
    }
    if (q.type === 'node' && closed && q.answer.includes(key)) return 'correct'
    if ('violation' in q && closed && q.violation === key) return 'violation'
    return ''
  }

  const badge = (key: number) => {
    if (q.type !== 'order') return null
    const done = sequence.indexOf(key)
    if (done >= 0) return done + 1
    return status === 'revealed' ? order.indexOf(key) + 1 : null
  }

  const finish = () => {
    const attempts = Math.max(mistakes, hintsAsked)
    onDone({
      id: q.id,
      lo: q.lo,
      score: credit(attempts, status === 'revealed'),
      mistakes,
      hintsUsed: hintsAsked,
      revealed: status === 'revealed',
    })
  }

  return (
    <div className="question">
      {total > 1 && (
        <p className="question-count">
          Question {index + 1} of {total}
        </p>
      )}
      <p className="question-prompt">{q.prompt}</p>
      {q.code && <pre className="code code-block">{q.code}</pre>}

      {'tree' in q && q.tree !== undefined && (
        <TreeView
          tree={q.tree}
          label={q.type === 'mcq' ? 'Tree for this question' : 'Question tree, select to answer'}
          state={nodeState}
          badge={q.type === 'order' ? badge : undefined}
          onNode={q.type === 'order' || q.type === 'node' ? chooseNode : undefined}
          slots={q.type === 'slot'}
          onSlot={chooseSlot}
          slotState={(s) =>
            flash === s.id
              ? 'wrong'
              : closed && slot && s.parent === slot.parent && s.side === slot.side
                ? 'correct'
                : ''
          }
        />
      )}

      {q.type === 'order' && (
        <p className="sequence">
          <span className="chips-label">{TRAVERSALS[q.kind].label} so far</span>
          {sequence.length ? (
            sequence.map((key) => (
              <span key={key} className="chip">
                {key}
              </span>
            ))
          ) : (
            <em>select the first node</em>
          )}
        </p>
      )}

      {q.type === 'mcq' && (
        <div className="options" role="group" aria-label="Answer options">
          {q.options.map((text, i) => {
            const mark = closed && i === q.answer ? ' is-correct' : wrongOptions.includes(i) ? ' is-wrong' : ''
            return (
              <button
                type="button"
                key={i}
                className={`option${mark}`}
                onClick={() => chooseOption(i)}
                disabled={closed || wrongOptions.includes(i)}
              >
                <span className="option-letter" aria-hidden="true">
                  {LETTERS[i]}
                </span>
                {text}
              </button>
            )
          })}
        </div>
      )}

      {!closed && mistakes > 0 && (
        <p className="feedback is-wrong" role="status">
          Not quite. {mistakes === 1 && hints.length ? 'Have a look at the hint below.' : 'Try again.'}
        </p>
      )}

      {!closed && shownHints > 0 && (
        <ol className="hints">
          {hints.slice(0, shownHints).map((hint, i) => (
            <li key={i}>
              <Lightbulb size={16} aria-hidden="true" />
              <span>
                <strong>Hint {i + 1}.</strong> {hint}
              </span>
            </li>
          ))}
        </ol>
      )}

      {closed && (
        <div className={`feedback ${status === 'solved' ? 'is-right' : 'is-neutral'}`} role="status">
          {status === 'solved' ? <CircleCheck size={20} aria-hidden="true" /> : <Info size={20} aria-hidden="true" />}
          <p>
            <strong>{status === 'solved' ? (mistakes === 0 ? 'Correct.' : 'Got it.') : 'Here is the answer.'}</strong>{' '}
            {q.type === 'order' && status === 'revealed' && `${TRAVERSALS[q.kind].label}: ${order.join(', ')}. `}
            {q.explain}
          </p>
        </div>
      )}

      <div className="row">
        {!closed && shownHints < hints.length && (
          <button type="button" className="btn btn-quiet" onClick={() => setHintsAsked(shownHints + 1)}>
            <Lightbulb size={18} aria-hidden="true" />
            {shownHints ? 'Another hint' : 'Need a hint?'}
          </button>
        )}
        {!closed && mistakes >= 3 && (
          <button type="button" className="btn btn-quiet" onClick={() => setStatus('revealed')}>
            <Eye size={18} aria-hidden="true" />
            Show me the answer
          </button>
        )}
        {closed && (
          <button type="button" className="btn btn-primary" onClick={finish}>
            Continue
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

interface QuizProps {
  questions: Question[]
  onFinish: (answers: Answer[]) => void
}

export function Quiz({ questions, onFinish }: QuizProps) {
  const { record } = useProgress()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const q = questions[index]

  const next = (answer: Answer) => {
    record(answer.lo, answer.score)
    const all = [...answers, answer]
    setAnswers(all)
    if (index + 1 < questions.length) setIndex(index + 1)
    else onFinish(all)
  }

  return (
    <div className="quiz">
      <ol className="quiz-dots" aria-hidden="true">
        {questions.map((item, i) => (
          <li
            key={item.id}
            className={i < index ? (answers[i].score >= 0.6 ? 'is-good' : 'is-weak') : i === index ? 'is-now' : ''}
          />
        ))}
      </ol>
      <QuestionCard key={q.id} question={q} index={index} total={questions.length} onDone={next} />
    </div>
  )
}
