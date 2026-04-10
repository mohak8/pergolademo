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
      <div className="relative flex w-full h-screen font-sans bg-gray-100 overflow-hidden text-slate-800">
        <Panel />
        <div className="flex-1 right-0 sm:relative z-0">
          <Scene />
        </div>
      </div>
    </>
  )
}

export default App
