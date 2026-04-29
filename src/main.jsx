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

import useStore from './store.js'

// Extract handle from URL for Shopify context (/products/handle)
const pathParts = window.location.pathname.split('/');
const productHandle = pathParts.includes('products') ? pathParts[pathParts.indexOf('products') + 1] : 'pergostet-plus-1';

// Initialize store with Shopify data immediately
useStore.getState().initializeFromShopify(productHandle);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

