import React from 'react'
import useStore from '../../store'

export default function Panel() {
  const { 
    activeSide, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD, currentSize,
    setActiveSide, toggleScreenA_Left, toggleScreenA_Right, toggleScreenB, toggleScreenC_Left, toggleScreenC_Right, toggleScreenD, setSize,
    isBreakdownVisible, toggleBreakdown, getTotalPrice, getBasePrice, getScreenPrice
  } = useStore()

  const tabs = [
    { id: 'A', label: 'Side A' },
    { id: 'B', label: 'Side B' },
    { id: 'C', label: 'Side C' },
    { id: 'D', label: 'Side D' },
  ]

  return (
    <div className="w-full md:w-96 flex-shrink-0 bg-white/90 backdrop-blur-md border-r border-white/40 shadow-2xl z-20 flex flex-col font-sans h-[40vh] md:h-screen relative overflow-hidden">
      <div className="p-6 md:pb-24 overflow-y-auto flex-1">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl text-gray-900 font-semibold tracking-tight">Pergola Configurator</h1>
          <p className="text-xs text-gray-500 mt-1">Design your premium space.</p>
        </div>

        <div className="flex flex-col space-y-6">
          {/* Step 1: Size Selection */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Step 1: Model Size</h2>
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

          {/* Step 2: Side Options */}
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Step 2: Customize Sides</h2>
            <div className="flex gap-2 mb-3">
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

            {/* Visual Toggles dynamically under active side */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
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
      </div>

      {/* Sticky Cart & Pricing Footer */}
      <div className="p-4 border-t border-gray-200 bg-white/95 backdrop-blur-lg md:absolute md:bottom-0 md:left-0 md:w-full z-30">
        
        {/* Breakdown Toggle */}
        <button 
          onClick={toggleBreakdown}
          className="w-full flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 hover:text-gray-800 transition-colors"
        >
          <span>View Breakdown</span>
          <svg className={`w-4 h-4 transform transition-transform ${isBreakdownVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Breakdown List */}
        {isBreakdownVisible && (
          <div className="text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
            <div className="flex justify-between font-semibold text-gray-800">
              <span>{currentSize} Base Frame</span>
              <span>${getBasePrice()}</span>
            </div>
            {(screenA_Left || screenA_Right || screenB || screenC_Left || screenC_Right || screenD) && (
              <div className="border-t border-dashed border-gray-200 my-1 pt-1 flex flex-col gap-1">
                {screenA_Left && <div className="flex justify-between text-[11px]"><span>Side A Screen (Left)</span><span>${getScreenPrice()}</span></div>}
                {screenA_Right && <div className="flex justify-between text-[11px]"><span>Side A Screen (Right)</span><span>${getScreenPrice()}</span></div>}
                {screenB && <div className="flex justify-between text-[11px]"><span>Side B Screen</span><span>${getScreenPrice()}</span></div>}
                {screenC_Left && <div className="flex justify-between text-[11px]"><span>Side C Screen (Left)</span><span>${getScreenPrice()}</span></div>}
                {screenC_Right && <div className="flex justify-between text-[11px]"><span>Side C Screen (Right)</span><span>${getScreenPrice()}</span></div>}
                {screenD && <div className="flex justify-between text-[11px]"><span>Side D Screen</span><span>${getScreenPrice()}</span></div>}
              </div>
            )}
          </div>
        )}

        <button className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-all shadow-xl shadow-gray-900/20 active:scale-95 flex justify-between items-center px-5">
          <span>Add to Cart</span>
          <span className="font-bold tracking-wide">${getTotalPrice()}</span>
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
