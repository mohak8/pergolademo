import React from 'react'
import useStore from '../../store'

export default function Panel() {
  const {
    activeSide, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD, currentSize,
    setActiveSide, toggleScreenA_Left, toggleScreenA_Right, toggleScreenB, toggleScreenC_Left, toggleScreenC_Right, toggleScreenD, setSize
  } = useStore()

  const tabs = [
    { id: 'A', label: 'Side A' },
    { id: 'B', label: 'Side B' },
    { id: 'C', label: 'Side C' },
    { id: 'D', label: 'Side D' },
  ]

  return (
    <div className="w-80 bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl p-6 z-10 flex flex-col font-sans max-h-[100vh] overflow-y-auto hidden sm:flex">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl text-gray-900 font-semibold tracking-tight">Pergola Configurator</h1>
        <p className="text-xs text-gray-500 mt-1">Design your premium space.</p>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Size Selection */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Model Size</h2>
          <div className="flex gap-3">
            {['3x3', '4x3', '6x3'].map((s) => {
              const label = s.replace('x', '*') // Render as 3*3, 4*3, etc.
              const isActive = currentSize === s
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all border ${isActive
                    ? 'bg-white text-gray-900 shadow-md border-gray-200 -translate-y-[1px]'
                    : 'bg-gray-100 text-gray-400 shadow-inner border-transparent hover:text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* View Controls - 4 Tabs */}
        <section>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">View Focus</h2>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSide(tab.id)}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all border ${activeSide === tab.id
                  ? 'bg-white text-gray-900 shadow-md border-gray-200 -translate-y-[1px]'
                  : 'bg-gray-100 text-gray-400 shadow-inner border-transparent hover:text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {tab.id}
              </button>
            ))}
          </div>
        </section>

        {/* Configuration Controls */}
        <section className="flex-1">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Add Screens</h2>

          <div className="grid grid-cols-2 gap-4">
            {activeSide === 'A' && currentSize === '6x3' && (
              <>
                <VisualScreenToggle title="Left Bay" isOn={screenA_Left} onToggle={toggleScreenA_Left} />
                <VisualScreenToggle title="Right Bay" isOn={screenA_Right} onToggle={toggleScreenA_Right} />
              </>
            )}
            {activeSide === 'A' && currentSize !== '6x3' && (
              <VisualScreenToggle title="Front Screen" isOn={screenA_Left} onToggle={toggleScreenA_Left} />
            )}

            {activeSide === 'B' && (
              <VisualScreenToggle title="Right Screen" isOn={screenB} onToggle={toggleScreenB} />
            )}

            {activeSide === 'C' && currentSize === '6x3' && (
              <>
                <VisualScreenToggle title="Left Bay" isOn={screenC_Left} onToggle={toggleScreenC_Left} />
                <VisualScreenToggle title="Right Bay" isOn={screenC_Right} onToggle={toggleScreenC_Right} />
              </>
            )}
            {activeSide === 'C' && currentSize !== '6x3' && (
              <VisualScreenToggle title="Back Screen" isOn={screenC_Left} onToggle={toggleScreenC_Left} />
            )}

            {activeSide === 'D' && (
              <VisualScreenToggle title="Left Screen" isOn={screenD} onToggle={toggleScreenD} />
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 pt-5 border-t border-gray-100">
        <button className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95">
          Request Quote
        </button>
      </div>
    </div>
  )
}

function VisualScreenToggle({ title, isOn, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`relative w-full cursor-pointer transition-all duration-300 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center ${isOn
        ? 'ring-[3px] ring-gray-900 opacity-100 shadow-lg transform border-transparent'
        : 'border border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400 hover:bg-gray-200'
        }`}
    >
      <img src="/pergola/screen.png" alt={title} className="w-full h-full object-contain" />

      {/* Label beautifully overlaid inside the checkbox image */}
      <div className="absolute inset-x-0 bottom-0 py-2">
        <span className="block text-[11px] font-bold text-gray-900 text-center tracking-wide">{title}</span>
      </div>
    </div>
  )
}
