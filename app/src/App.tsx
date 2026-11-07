import { useEffect, useRef } from 'react'
import { Background } from './components/Background'
import { Header, Toast } from './components/Shell'
import { Tour } from './components/Tour'
import { MODULE_BY_ID } from './content/modules'
import { Home } from './screens/Home'
import { Lesson } from './screens/Lesson'
import { Playground } from './screens/Playground'
import { Practice } from './screens/Practice'
import { ProgressPage } from './screens/ProgressPage'
import { Readiness } from './screens/Readiness'
import { Warmup } from './screens/Warmup'
import { useProgress } from './state/progress'
import { href, useRoute, type Route } from './state/router'
import { DEMO_SEED } from './state/rng'

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <Home />
    case 'warmup':
      return <Warmup />
    case 'lesson':
      return <Lesson key={route.id} module={MODULE_BY_ID[route.id]} />
    case 'playground':
      return <Playground op={route.op} preset={route.preset} keyValue={route.key} />
    case 'practice':
      return <Practice key={route.topic ?? 'all'} topic={route.topic} />
    case 'check':
      return <Readiness />
    case 'progress':
      return <ProgressPage />
  }
}

export default function App() {
  const route = useRoute()
  const { progress } = useProgress()
  const mainRef = useRef<HTMLElement>(null)
  const first = useRef(true)
  const named = Boolean(progress.name)
  const shown: Route = named ? route : { name: 'home' }
  const path = href(shown)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const main = mainRef.current
    // A screen that moved focus to something of its own as it opened, such as an animation it started, keeps it.
    if (main?.contains(document.activeElement) && document.activeElement !== main) return
    window.scrollTo({ top: 0 })
    main?.focus({ preventScroll: true })
  }, [path])

  return (
    <>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}
      >
        Skip to content
      </a>
      <Background hero={shown.name === 'home'} />
      <Header current={shown.name} />
      <main id="main" ref={mainRef} tabIndex={-1} className="view" key={path}>
        <Screen route={shown} />
      </main>
      <Toast />
      <Tour />
      <footer className="footer">
        TreeTutor, a COS212 pre-lecture tutor prototype for COS750 Educational Software Development, University of
        Pretoria.
        {DEMO_SEED !== null && <span className="demo-seed"> Demo seed {DEMO_SEED}: generated questions repeat.</span>}
      </footer>
    </>
  )
}
