import React from 'react'
import Panel from './components/UI/Panel'
import Scene from './components/Canvas/Scene'

function App() {
  return (
    <div className="flex w-full h-screen font-sans bg-gray-100 overflow-hidden text-slate-800">
      <Panel />
      <div className="flex-1 right-0 sm:relative z-0">
        <Scene />
      </div>
    </div>
  )
}

export default App
