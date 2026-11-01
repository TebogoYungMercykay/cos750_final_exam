import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/jetbrains-mono/wght.css'
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import '@fontsource-variable/plus-jakarta-sans/wght-italic.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ProgressProvider } from './state/ProgressProvider'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </StrictMode>,
)
