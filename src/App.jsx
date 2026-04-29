import React, { useEffect, useState } from 'react'
import { Loader } from '@react-three/drei'
import Panel from './components/UI/Panel'
import Toolbar from './components/UI/Toolbar'
import Scene from './components/Canvas/Scene'
import { useShopifyData } from './hooks/useShopifyData'

function App() {
  // We use the hook to check if the connection with Shopify has been established
  const { isLoaded } = useShopifyData()

  // If isLoaded is false (still waiting for Shopify message), show this loading screen
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center font-sans">
          <p className="text-xl font-bold text-slate-800 animate-pulse uppercase tracking-widest">
            Connecting to Shopify...
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Waiting for product data to arrive.
          </p>
        </div>
      </div>
    )
  }

  // Once isLoaded becomes true, the actual configurator is rendered
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
