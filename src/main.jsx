import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Intercept and silence harmless deprecation warnings caused by Three.js updating faster than React-Three-Fiber
const originalWarn = console.warn
console.warn = (...args) => {
  if (typeof args[0] === 'string') {
    if (args[0].includes('THREE.Clock: This module has been deprecated')) return
    if (args[0].includes('PCFSoftShadowMap has been deprecated')) return
  }
  originalWarn(...args)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
