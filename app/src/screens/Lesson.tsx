import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Dumbbell,
  RotateCcw,
  SkipForward,
  Target,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { FrontierPlayer } from '../components/FrontierPlayer'
import { Explorer, Reflect } from '../components/LessonParts'
import { QuestionCard, Quiz } from '../components/QuestionCard'
import { StepPlayer } from '../components/StepPlayer'
import { TreeView } from '../components/TreeView'
import { MODULES, OUTCOMES } from '../content/modules'
import type { Module, Section } from '../content/types'
import { useProgress } from '../state/progress'
import { href } from '../state/router'
import { percent, READY, summarise, type Summary } from '../state/scoring'

const sectionTitle = (s: Section) => (s.type === 'reflect' ? 'Reflect' : s.title)

function SectionBody({ section, onTried }: { section: Section; onTried: () => void }) {
  const { record } = useProgress()
  switch (section.type) {
    case 'text':
      return <div className="prose">{section.body}</div>
    case 'explore':
      return <Explorer tree={section.tree} caption={section.caption} />
    case 'tree':
      return (
        <figure className="figure">
          <TreeView
            tree={section.tree}
            label={section.title}
            state={(key) => (key === section.violation ? 'violation' : '')}
          />
          <figcaption>{section.caption}</figcaption>
        </figure>
      )
    case 'animate':
      return <StepPlayer tree={section.tree} kind={section.kind} keyValue={section.key} callout={section.callout} />
    case 'frontier':
      return (
        <>
          <p className="muted">{section.caption}</p>
          <FrontierPlayer tree={section.tree} />
        </>
      )
    case 'compare':
      return (
        <div className="compare">
          {section.items.map((item) => (
            <figure key={item.caption} className="figure">
              <TreeView tree={item.tree} label={item.caption} compact />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      )
    case 'try':
      return (
        <QuestionCard
          question={section.question}
          onDone={(answer) => {
            record(answer.lo, answer.score)
            onTried()
          }}
        />
      )
    case 'reflect':
      return <Reflect id={section.id} prompt={section.prompt} />
  }
}

export function Lesson({ module: m }: { module: Module }) {
  const { progress, completeModule, award } = useProgress()
  const [phase, setPhase] = useState<'intro' | 'learn' | 'quiz' | 'summary'>('intro')
  const [index, setIndex] = useState(0)
  const [result, setResult] = useState<Summary | null>(null)
  const headRef = useRef<HTMLHeadingElement>(null)
  const position = MODULES.findIndex((x) => x.id === m.id)
  const next = MODULES[position + 1]
  const Icon = m.icon
  const total = m.sections.length + 2
  const reached = phase === 'intro' ? 0 : phase === 'learn' ? index + 1 : total
  const section = m.sections[index]

  useEffect(() => {
    headRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [phase, index])

  const forward = () => (index + 1 < m.sections.length ? setIndex(index + 1) : setPhase('quiz'))

  return (
    <div className="page">
      <a className="back" href={href({ name: 'home' })}>
        <ArrowLeft size={16} aria-hidden="true" /> Learning path
      </a>
      <header className="page-head">
        <p className="eyebrow">
          <Icon size={16} aria-hidden="true" />
          Lesson {position + 1} of {MODULES.length}
        </p>
        <h1 className="display-2" tabIndex={-1} ref={headRef}>
          {m.title}
        </h1>
        <div
          className="meter"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuenow={Math.round((reached / total) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${(reached / total) * 100}%` }} />
        </div>
      </header>

      {phase === 'intro' && (
        <div className="card rise">
          <div className="prose hook">{m.hook}</div>
          <h2 className="display-3">By the end of this lesson you will be able to</h2>
          <p className="objective">
            <Target size={20} aria-hidden="true" />
            {OUTCOMES[m.lo].text}
          </p>
          <p className="muted">
            About {m.minutes} minutes: {m.sections.length} short steps and a {m.quiz.length} question checkpoint.
            {progress.mode === 'guided' && ' Guided mode shows hints from the start.'}
          </p>
          <div className="row">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setPhase('learn')}>
              Start the lesson
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => setPhase('quiz')}>
              <SkipForward size={18} aria-hidden="true" />I know this, skip to the checkpoint
            </button>
          </div>
        </div>
      )}

      {phase === 'learn' && (
        <div className="lesson-grid">
          <nav className="outline" aria-label="Lesson steps">
            <ol>
              {m.sections.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    className={i === index ? 'is-now' : i < index ? 'is-done' : undefined}
                    aria-current={i === index ? 'step' : undefined}
                    onClick={() => setIndex(i)}
                  >
                    <span className="outline-num">{i + 1}</span>
                    {sectionTitle(s)}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <article className="card rise" key={index}>
            <p className="step-kicker">
              Step {index + 1} of {m.sections.length}
            </p>
            <h2 className={`display-3${section.type === 'text' && section.warning ? ' is-warning' : ''}`}>
              {section.type === 'text' && section.warning && <TriangleAlert size={22} aria-hidden="true" />}
              {sectionTitle(section)}
            </h2>
            <SectionBody section={section} onTried={forward} />
            <div className="row row-split">
              <button type="button" className="btn" onClick={() => (index ? setIndex(index - 1) : setPhase('intro'))}>
                <ArrowLeft size={18} aria-hidden="true" />
                Back
              </button>
              <button type="button" className="btn btn-primary" onClick={forward}>
                {index + 1 < m.sections.length ? 'Next' : 'Checkpoint quiz'}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </article>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="card rise">
          <h2 className="display-3">Checkpoint quiz</h2>
          <Quiz
            questions={m.quiz}
            onFinish={(answers) => {
              const summary = summarise(answers)
              setResult(summary)
              completeModule(m.id, summary.overall)
              award(m.id)
              if (summary.noHints) award('nohints')
              setPhase('summary')
            }}
          />
        </div>
      )}

      {phase === 'summary' && result && (
        <div className="card rise">
          <div className="score">
            <span
              className={`score-ring${result.overall >= READY ? ' is-good' : ''}`}
              style={{ '--value': result.overall } as CSSProperties}
            >
              <span>{percent(result.overall)}</span>
            </span>
            <div>
              <h2 className="display-3">
                {result.overall >= READY ? (
                  <>
                    <CircleCheck size={22} aria-hidden="true" /> Checkpoint passed
                  </>
                ) : (
                  'Worth another look'
                )}
              </h2>
              <p className="muted">
                {result.overall >= READY
                  ? `You are ready for the ${OUTCOMES[m.lo].short.toLowerCase()} part of the lecture.`
                  : 'This topic needs a bit more work. Try the practice below, or redo the lesson. Mistakes now mean fewer surprises in the lecture.'}
              </p>
            </div>
          </div>
          <h3 className="display-4">Key takeaways</h3>
          <ul className="takeaways">
            {m.summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="row">
            {next ? (
              <a className="btn btn-primary" href={href({ name: 'lesson', id: next.id })}>
                Next: {next.title}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            ) : (
              <a className="btn btn-primary" href={href({ name: 'check' })}>
                Take the readiness check
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            )}
            <a className="btn" href={href({ name: 'practice', topic: m.lo })}>
              <Dumbbell size={18} aria-hidden="true" />
              Extra practice on this topic
            </a>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                setIndex(0)
                setPhase('intro')
              }}
            >
              <RotateCcw size={18} aria-hidden="true" />
              Redo the lesson
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
