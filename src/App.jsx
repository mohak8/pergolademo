import React, { useEffect, useState } from 'react'
import { Loader } from '@react-three/drei'
import Panel from './components/UI/Panel'
import Toolbar from './components/UI/Toolbar'
import Scene from './components/Canvas/Scene'
import { useShopifyData } from './hooks/useShopifyData'
import useStore from './store'

function App() {
  const { isLoaded } = useShopifyData()
  const initializeFromPayload = useStore(state => state.initializeFromPayload)
  const [showFallbackNotice, setShowFallbackNotice] = useState(false)

  // --- 1. LOCAL MOCK Logic ---
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
              options: [{ name: 'Size' }, { name: 'Color' }],
              variants: [
                { id: 1, title: '3x3 / Charcoal', options: ['3x3', 'Charcoal'], price: 150000 },
                { id: 2, title: '4x3 / Charcoal', options: ['4x3', 'Charcoal'], price: 180000 }
              ]
            },
            variantMetafields: {},
            addonProducts: []
          }, '*');
        }
      }, 2000);
      return () => clearTimeout(mockTimer);
    }
  }, [isLoaded]);

  // --- 2. TIMED FALLBACK Logic (Safety for Live Shopify) ---
  useEffect(() => {
    if (!isLoaded) {
      const fallbackTimer = setTimeout(() => {
        if (!isLoaded) {
          console.warn("App: Shopify data timeout. Using fallback...");
          initializeFromPayload(null); // Triggers store fallback
          setShowFallbackNotice(true);
        }
      }, 6000); // 6 second safety window
      return () => clearTimeout(fallbackTimer);
    }
  }, [isLoaded, initializeFromPayload]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-800 animate-pulse">LOADING CONFIGURATOR...</p>
          <p className="text-sm text-slate-500 mt-2">Waiting for Shopify product data...</p>
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
      {showFallbackNotice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-full text-xs shadow-lg animate-bounce">
          ⚠️ Connection delayed. Using default configuration.
        </div>
      )}
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
