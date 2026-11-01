import {
  ChartColumn,
  Compass,
  Dumbbell,
  FlaskConical,
  GraduationCap,
  LifeBuoy,
  Moon,
  Route as RouteIcon,
  Sun,
  X,
  Zap,
} from 'lucide-react'
import { useEffect } from 'react'
import { BADGES } from '../content/badges'
import { useProgress } from '../state/progress'
import { href, type Route } from '../state/router'

export function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 7 L9 17 M16 7 L23 17 M9 17 L5 26 M9 17 L13 26" />
      <circle cx="16" cy="7" r="3.4" className="is-root" />
      <circle cx="9" cy="17" r="2.8" />
      <circle cx="23" cy="17" r="2.8" />
      <circle cx="5" cy="26" r="2.4" />
      <circle cx="13" cy="26" r="2.4" />
    </svg>
  )
}

export function Header({ current }: { current: Route['name'] }) {
  const { progress, update } = useProgress()
  const guided = progress.mode === 'guided'
  const dark = progress.theme === 'dark'

  return (
    <header className="topbar">
      <a className="brand" href="#/" aria-label="TreeTutor home">
        <BrandMark />
        <span className="brand-name">TreeTutor</span>
        <span className="brand-tag">COS212</span>
      </a>
      {progress.name && <Tabs current={current} />}
      <div className="topbar-actions">
        {progress.name && (
          <>
            <button
              type="button"
              className={`mode-toggle${guided ? ' is-guided' : ''}`}
              onClick={() => update({ mode: guided ? 'standard' : 'guided' })}
              title="Guided mode shows hints from the start and slows the animations down"
              aria-label={`Support mode: ${guided ? 'guided' : 'standard'}. Switch to ${guided ? 'standard' : 'guided'}.`}
            >
              {guided ? <LifeBuoy size={16} aria-hidden="true" /> : <Compass size={16} aria-hidden="true" />}
              <span>{guided ? 'Guided' : 'Standard'}</span>
            </button>
            <span className="xp" aria-label={`Experience points: ${progress.xp}`}>
              <Zap size={15} aria-hidden="true" />
              {progress.xp}
            </span>
          </>
        )}
        <button
          type="button"
          className="btn btn-icon btn-quiet"
          onClick={() => update({ theme: dark ? 'light' : 'dark' })}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}

const NAV: { route: Route; label: string; icon: typeof RouteIcon; match: Route['name'][] }[] = [
  { route: { name: 'home' }, label: 'Path', icon: RouteIcon, match: ['home', 'lesson', 'warmup'] },
  { route: { name: 'playground' }, label: 'Playground', icon: FlaskConical, match: ['playground'] },
  { route: { name: 'practice' }, label: 'Practice', icon: Dumbbell, match: ['practice'] },
  { route: { name: 'check' }, label: 'Readiness', icon: GraduationCap, match: ['check'] },
  { route: { name: 'progress' }, label: 'Progress', icon: ChartColumn, match: ['progress'] },
]

/** Header tabs on wide screens; the same element becomes a bottom tab bar on phones. */
function Tabs({ current }: { current: Route['name'] }) {
  return (
    <nav className="tabs" aria-label="Main">
      <ul>
        {NAV.map(({ route, label, icon: Icon, match }) => (
          <li key={label}>
            <a href={href(route)} aria-current={match.includes(current) ? 'page' : undefined}>
              <Icon size={18} aria-hidden="true" />
              <span className="tab-label">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function Toast() {
  const { toast, dismissToast } = useProgress()
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(dismissToast, 4500)
    return () => window.clearTimeout(timer)
  }, [toast, dismissToast])

  if (!toast) return null
  const badge = BADGES[toast]
  const Icon = badge.icon
  return (
    <div className="toast" role="status">
      <span className="toast-icon">
        <Icon size={22} aria-hidden="true" />
      </span>
      <span>
        <span className="toast-kicker">Badge earned</span>
        <strong>{badge.name}</strong>
        <span className="muted">{badge.description}</span>
      </span>
      <button type="button" className="btn btn-icon btn-quiet" onClick={dismissToast} aria-label="Dismiss">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
