import React from 'react'
import useStore from '../../store'

export default function Panel() {
  const { 
    activeSide, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD, currentSize,
    setActiveSide, toggleScreenA_Left, toggleScreenA_Right, toggleScreenB, toggleScreenC_Left, toggleScreenC_Right, toggleScreenD, setSize
  } = useStore()

  const tabs = [
    { id: 'A', label: 'Side A (Front)' },
    { id: 'B', label: 'Side B (Right)' },
    { id: 'C', label: 'Side C (Back)' },
    { id: 'D', label: 'Side D (Left)' },
  ]

  return (
    <div className="w-[300px] h-full bg-white shadow-2xl z-10 flex flex-col p-6 absolute sm:relative left-0 top-0 bottom-0 overflow-y-auto hidden sm:flex">
      <div className="border-b border-gray-100 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pergola Configurator</h1>
        <p className="text-sm text-slate-500 mt-1">Design your premium space.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Size Selection */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Model Size</h2>
          <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
            {['3x3', '4x3', '6x3'].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${
                  currentSize === s ? 'bg-white shadow-sm text-slate-900 border-b-[3px] border-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s} Pergola
              </button>
            ))}
          </div>
        </section>

        {/* View Controls - 4 Tabs */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">View Focus</h2>
          {/* We use a grid for 4 tabs so it looks organized */}
          <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSide(tab.id)}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                  activeSide === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Configuration Controls */}
        <section className="flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Features</h2>
          
          <div className="space-y-4">
            {activeSide === 'A' && currentSize === '6x3' && (
              <>
                <ScreenToggle 
                  title="Add Screen (Left Bay)" 
                  desc="Add screen to Side A (Left)" 
                  isOn={screenA_Left} 
                  onToggle={toggleScreenA_Left} 
                  colorClass="bg-blue-600" 
                />
                <ScreenToggle 
                  title="Add Screen (Right Bay)" 
                  desc="Add screen to Side A (Right)" 
                  isOn={screenA_Right} 
                  onToggle={toggleScreenA_Right} 
                  colorClass="bg-blue-600" 
                />
              </>
            )}
            {activeSide === 'A' && currentSize !== '6x3' && (
              <ScreenToggle 
                title="Front Screen" 
                desc="Add screen to Side A" 
                isOn={screenA_Left} 
                onToggle={toggleScreenA_Left} 
                colorClass="bg-blue-600" 
              />
            )}
            {activeSide === 'B' && (
              <ScreenToggle 
                title="Right Screen" 
                desc="Add screen to Side B" 
                isOn={screenB} 
                onToggle={toggleScreenB} 
                colorClass="bg-indigo-600" 
              />
            )}
            {activeSide === 'C' && currentSize === '6x3' && (
              <>
                <ScreenToggle 
                  title="Add Screen (Left Bay)" 
                  desc="Add screen to Side C (Left)" 
                  isOn={screenC_Left} 
                  onToggle={toggleScreenC_Left} 
                  colorClass="bg-purple-600" 
                />
                <ScreenToggle 
                  title="Add Screen (Right Bay)" 
                  desc="Add screen to Side C (Right)" 
                  isOn={screenC_Right} 
                  onToggle={toggleScreenC_Right} 
                  colorClass="bg-purple-600" 
                />
              </>
            )}
            {activeSide === 'C' && currentSize !== '6x3' && (
              <ScreenToggle 
                title="Back Screen" 
                desc="Add screen to Side C" 
                isOn={screenC_Left} 
                onToggle={toggleScreenC_Left} 
                colorClass="bg-purple-600" 
              />
            )}
            {activeSide === 'D' && (
              <ScreenToggle 
                title="Left Screen" 
                desc="Add screen to Side D" 
                isOn={screenD} 
                onToggle={toggleScreenD} 
                colorClass="bg-sky-600" 
              />
            )}
          </div>
        </section>
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-lg shadow-slate-900/20 active:scale-[0.98]">
          Request Quote
        </button>
      </div>
    </div>
  )
}

function ScreenToggle({ title, desc, isOn, onToggle, colorClass }) {
  return (
    <div 
      className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 rounded-xl cursor-pointer" 
      onClick={onToggle}
    >
      <div>
        <h3 className="text-sm font-medium text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      <button 
        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${isOn ? colorClass : 'bg-slate-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isOn ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )
}
