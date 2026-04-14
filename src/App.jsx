import React from 'react'
import { Loader } from '@react-three/drei'
import Panel from './components/UI/Panel'
import Scene from './components/Canvas/Scene'

function App() {
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
      </div>
    </>
  )
}

export default App
