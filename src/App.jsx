import React, { useEffect, useState } from 'react'
import { Loader } from '@react-three/drei'
import Panel from './components/UI/Panel'
import Toolbar from './components/UI/Toolbar'
import Scene from './components/Canvas/Scene'
import { useShopifyData } from './hooks/useShopifyData'
import useStore from './store'

function App() {
  const { isLoaded } = useShopifyData()
  const [showFallbackNotice, setShowFallbackNotice] = useState(false)

  // --- 1. LOCAL MOCK Logic (Only for localhost dev) ---
  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const mockTimer = setTimeout(() => {
        if (!isLoaded) {
          console.log("App: Triggering Mock Shopify Data (Local Development)");
          window.postMessage({
            type: 'SHOPIFY_PRODUCT_DATA',
            product: {
              title: 'Mock Pergola Plus',
              handle: 'mock-pergola',
              options: ['Size', 'Color'],
              variants: [
                { id: 1, title: '3x3m / Charcoal', options: ['3x3m', 'Charcoal'], price: 150000 },
                { id: 2, title: '4x3m / Charcoal', options: ['4x3m', 'Charcoal'], price: 180000 },
                { id: 3, title: '6x3m / Charcoal', options: ['6x3m', 'Charcoal'], price: 210000 }
              ]
            },
            sizesConfig: {
              '3x3m': { size: '3x3m', slideA: [], slideB: [], slideC: [], slideD: [] },
              '4x3m': { size: '4x3m', slideA: [], slideB: [], slideC: [], slideD: [] },
              '6x3m': { size: '6x3m', slideA: [], slideB: [], slideC: [], slideD: [] }
            },
            variantMetafields: {},
            addonProducts: []
          }, '*');
        }
      }, 1500);
      return () => clearTimeout(mockTimer);
    }
  }, [isLoaded]);

  // --- 2. TIMED FALLBACK for Live Shopify (if READY signal is missed) ---
  useEffect(() => {
    if (!isLoaded) {
      const fallbackTimer = setTimeout(() => {
        if (!isLoaded) {
          console.warn("App: Shopify data timeout - check Liquid script.");
          setShowFallbackNotice(true);
        }
      }, 10000); // 10 second safety window
      return () => clearTimeout(fallbackTimer);
    }
  }, [isLoaded]);

  // Loading screen
  if (!isLoaded && !showFallbackNotice) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-800 animate-pulse">LOADING CONFIGURATOR...</p>
          <p className="text-sm text-slate-500 mt-2">Waiting for Shopify product data...</p>
        </div>
      </div>
    );
  }

  // Error screen if Shopify data never came
  if (!isLoaded && showFallbackNotice) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center px-6">
          <p className="text-xl font-bold text-red-600">⚠️ Connection Error</p>
          <p className="text-sm text-slate-500 mt-2">Could not receive product data from Shopify. Please refresh.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Loader
        containerStyles={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}
        innerStyles={{ width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        barStyles={{ height: '3px', background: '#0f172a' }}
        dataInterpolation={(p) => `LOADING ASSETS... ${p.toFixed(0)}%`}
        dataStyles={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#0f172a', textTransform: 'uppercase' }}
      />
      <div className="relative h-screen w-full flex flex-col md:flex-row font-sans bg-gray-100 overflow-hidden text-slate-800">
        <Panel />
        <div className="h-[60vh] md:h-screen w-full flex-1 relative z-0">
          <Scene />
        </div>
        <Toolbar />
      </div>
    </>
  )
}

export default App
