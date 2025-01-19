import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import styles
import './styles/reset.css'
import './styles/variables.css'
import './styles/global.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
