import { ArrowRight, ChartColumn, Check, Dumbbell, FlaskConical, GraduationCap } from 'lucide-react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { BADGES } from '../content/badges'
import { MODULES, OUTCOMES, OUTCOME_IDS, TREES } from '../content/modules'
import { TourLauncher } from '../components/TourLauncher'
import { TreeView } from '../components/TreeView'
import { useProgress } from '../state/progress'
import { href } from '../state/router'
import { mastery, percent } from '../state/scoring'

/** Sections are labelled by tree depth: the page itself reads like a walk down a tree. */
export function SectionHead({
  depth,
  kicker,
  title,
  lede,
}: {
  depth: number
  kicker: string
  title: ReactNode
  lede?: string
}) {
  return (
    <div className="section-head">
      <p className="eyebrow">
        <span className="depth-tag">depth {depth}</span>
        {kicker}
      </p>
      <h2 className="display-2">{title}</h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  )
}

function Welcome() {
  const { update } = useProgress()
  const [name, setName] = useState('')
  const start = () => name.trim() && update({ name: name.trim() })

  return (
    <section className="hero hero-split">
      <div className="hero-copy rise">
        <p className="eyebrow">
          <span className="depth-tag">COS212</span>
          Pre-lecture tutor
        </p>
        <h1 className="display">
          Binary search trees, <em>before</em> the lecture.
        </h1>
        <p className="lede">
          Your personal tutor for <strong>binary search trees</strong> and <strong>tree traversals</strong>. You can
          read Java and know classes and references; no knowledge of trees is needed. In about an hour of short lessons
          you will see every idea run step by step beside its Java code, and practise until you feel ready for the
          lecture.
        </p>
        <form
          className="name-form"
          onSubmit={(e) => {
            e.preventDefault()
            start()
          }}
        >
          <label htmlFor="learner-name">What should we call you?</label>
          <div className="row">
            <input
              id="learner-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your first name"
              maxLength={30}
              autoComplete="given-name"
            />
            <button type="submit" className="btn btn-primary btn-lg" disabled={!name.trim()}>
              Begin
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="fine">Your progress stays on this device. Nothing is sent anywhere.</p>
        </form>
      </div>
      <figure className="hero-figure glass rise" style={{ '--delay': '160ms' } as CSSProperties}>
        <TreeView
          tree={TREES.balanced}
          label="Example binary search tree, with the search path for 40 highlighted"
          state={(key) => (key === 40 ? 'found' : [50, 30].includes(key) ? 'path' : '')}
        />
        <figcaption>
          Searching for <strong>40</strong>: three comparisons, 50 then 30 then 40.
        </figcaption>
      </figure>
    </section>
  )
}

const TOOLS = [
  {
    to: href({ name: 'playground' }),
    icon: FlaskConical,
    title: 'Playground',
    text: 'Build your own BST and watch search, insert and every traversal step by step.',
  },
  {
    to: href({ name: 'practice' }),
    icon: Dumbbell,
    title: 'Practice gym',
    text: 'Unlimited generated exercises with hints.',
  },
  {
    to: href({ name: 'check' }),
    icon: GraduationCap,
    title: 'Readiness check',
    text: '12 questions across all outcomes. Find out if you are ready for the lecture.',
  },
  {
    to: href({ name: 'progress' }),
    icon: ChartColumn,
    title: 'My progress',
    text: 'Mastery per outcome, badges and your reflection notes.',
  },
]

export function Home() {
  const { progress } = useProgress()
  if (!progress.name) return <Welcome />

  const done = MODULES.filter((m) => progress.modules[m.id]).length
  const next = MODULES.find((m) => !progress.modules[m.id])
  const scores = OUTCOME_IDS.map((lo) => mastery(progress.results, lo)).filter((s): s is number => s !== null)
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null

  const status = !progress.warmup
    ? 'Start with a two minute warm-up so TreeTutor can adjust how much help it gives you.'
    : next
      ? `You have finished ${done} of ${MODULES.length} lessons. Next up: ${next.title}.`
      : 'All lessons are done. Check whether you are ready for the lecture.'

  const cta = !progress.warmup
    ? { to: href({ name: 'warmup' }), label: 'Start the warm-up' }
    : next
      ? { to: href({ name: 'lesson', id: next.id }), label: `${done ? 'Continue' : 'Start'}: ${next.title}` }
      : { to: href({ name: 'check' }), label: 'Take the readiness check' }

  return (
    <>
      <TourLauncher id="home" />
      <section className="hero">
        <div className="hero-copy rise">
          <p className="eyebrow">
            <span className="depth-tag">COS212</span>
            Welcome back, {progress.name}
          </p>
          <h1 className="display">
            Trees, searched <em>step by step</em>.
          </h1>
          <p className="lede">{status}</p>
          <div className="row" data-tour="cta">
            <a className="btn btn-primary btn-lg" href={cta.to}>
              {cta.label}
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a className="btn btn-lg" href={href({ name: 'playground' })}>
              Open the playground
            </a>
          </div>
        </div>
        <dl data-tour="stats" className="stats rise" style={{ '--delay': '120ms' } as CSSProperties}>
          <div>
            <dt>Lessons</dt>
            <dd>
              {done}
              <small>/{MODULES.length}</small>
            </dd>
          </div>
          <div>
            <dt>Average mastery</dt>
            <dd>{average === null ? 'n/a' : percent(average)}</dd>
          </div>
          <div>
            <dt>Badges</dt>
            <dd>
              {progress.badges.length}
              <small>/{Object.keys(BADGES).length}</small>
            </dd>
          </div>
          <div>
            <dt>Experience</dt>
            <dd>{progress.xp}</dd>
          </div>
        </dl>
      </section>

      <section className="section section-split">
        <SectionHead
          depth={1}
          kicker="The path"
          title={
            <>
              Six short <em>lessons</em>
            </>
          }
          lede="Walk them in order, the way a traversal visits nodes. Each one opens with a familiar idea, shows worked examples, lets you try, and ends with a short checkpoint."
        />
        <ol className="path" data-tour="path">
          {MODULES.map((m, i) => {
            const Icon = m.icon
            const finished = Boolean(progress.modules[m.id])
            const upNext = next?.id === m.id
            const score = mastery(progress.results, m.lo)
            return (
              <li
                key={m.id}
                className={`path-step${finished ? ' is-done' : ''}${upNext ? ' is-next' : ''}`}
                style={{ '--i': i } as CSSProperties}
              >
                <span className="path-node" aria-hidden="true">
                  {finished ? <Check size={18} /> : i + 1}
                </span>
                <a href={href({ name: 'lesson', id: m.id })} className="path-card">
                  <span className="path-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="path-body">
                    <span className="path-kicker">
                      lesson {i + 1}
                      {finished && <span className="visually-hidden">, finished</span>}
                    </span>
                    <span className="path-title">{m.title}</span>
                    <span className="path-text">{m.tagline}</span>
                  </span>
                  <span className="path-meta">
                    {upNext && <span className="pill pill-accent">Up next</span>}
                    <span>
                      {OUTCOMES[m.lo].short}, about {m.minutes} min
                    </span>
                    {score !== null && (
                      <>
                        <span>Mastery {percent(score)}</span>
                        <span className="path-meter" aria-hidden="true">
                          <span style={{ width: percent(score) }} />
                        </span>
                      </>
                    )}
                  </span>
                  <ArrowRight className="path-arrow" size={20} aria-hidden="true" />
                </a>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="section">
        <SectionHead
          depth={2}
          kicker="Tools"
          title={
            <>
              Practise <em>your way</em>
            </>
          }
        />
        <ul className="tiles">
          {TOOLS.map(({ to, icon: Icon, title, text }) => (
            <li key={title}>
              <a className="tile" href={to}>
                <span className="tile-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="tile-title">
                  {title}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
                <span className="tile-text">{text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
