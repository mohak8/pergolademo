import React, { useEffect } from 'react'
import { Loader } from '@react-three/drei'
import Panel from './components/UI/Panel'
import Toolbar from './components/UI/Toolbar'
import QRModal from './components/UI/QRModal'
import Scene from './components/Canvas/Scene'
import useStore from './store'

function App() {
  useEffect(() => {
    // Listen for Shopify Data
    const handleMessage = (event) => {
      // Allow localhost for testing or vercel domain
      const allowedOrigins = ['https://pergolademo.vercel.app', 'http://localhost:5173'];
      
      if (event.data && event.data.type === 'SHOPIFY_PRODUCT_DATA') {
        const currentData = useStore.getState().shopifyData;
        // Avoid redundant logs/updates if data is identical
        if (currentData && JSON.stringify(currentData) === JSON.stringify(event.data)) {
          return;
        }

        console.log("📦 REACT RECEIVED SHOPIFY DATA");
        useStore.getState().setShopifyData(event.data);
      }
    };

    window.addEventListener('message', handleMessage);

    // Tell Shopify we are ready
    const parent = window.parent || window;
    console.log("🚀 React App Mounted - Sending CONFIGURATOR_READY to Shopify");
    parent.postMessage({ type: 'CONFIGURATOR_READY' }, '*');

    // Cleanup listener on unmount to prevent duplicates
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Parse AR URL Parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('ar') === 'true') {
      const state = useStore.getState()
      
      const size = params.get('size')
      if (size) state.setSize(size)
      
      const color = params.get('color')
      if (color) state.setFrameColor(decodeURIComponent(color))
      
      const screensStr = params.get('screens') || ''
      const screens = screensStr.split(',')
      
      if (screens.includes('A_L') && !state.screenA_Left) state.toggleScreenA_Left()
      if (screens.includes('A_R') && !state.screenA_Right) state.toggleScreenA_Right()
      if (screens.includes('B') && !state.screenB) state.toggleScreenB()
      if (screens.includes('C_L') && !state.screenC_Left) state.toggleScreenC_Left()
      if (screens.includes('C_R') && !state.screenC_Right) state.toggleScreenC_Right()
      if (screens.includes('D') && !state.screenD) state.toggleScreenD()

      // Automatically launch AR mode since they just scanned it from mobile
      // We give it a tiny delay to ensure the scene finishes loading first
      setTimeout(() => {
        state.launchAR()
      }, 2000)
    }
  }, [])

  return (
    <>
      <Loader
        containerStyles={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)' }}
        innerStyles={{ width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        barStyles={{ height: '3px', background: '#0f172a' }}
        dataInterpolation={(p) => `LOADING... ${p.toFixed(0)}%`}
        dataStyles={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#0f172a', textTransform: 'uppercase' }}
      />
      <div className="relative h-screen w-full flex flex-col md:flex-row font-sans bg-gray-100 overflow-hidden text-slate-800">
        <Panel />
        <div className="h-[60vh] md:h-screen w-full flex-1 relative z-0">
          <Scene />
        </div>
        <Toolbar />
      </div>
      <QRModal />
    </>
  )
}

export default App
