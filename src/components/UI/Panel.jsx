import React, { useState } from 'react'
import useStore from '../../store'

export default function Panel() {
  const {
    currentModel, setModel, activeSide, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD, currentSize,
    setActiveSide, toggleScreenA_Left, toggleScreenA_Right, toggleScreenB, toggleScreenC_Left, toggleScreenC_Right, toggleScreenD, setSize,
    isBreakdownVisible, toggleBreakdown, getTotalPrice, getBasePrice, getScreenPrice,
    frameColor, setFrameColor, activeTab, setActiveTab
  } = useStore()

  const mainTabs = ['Model', 'Size', 'Color', 'Sides']

  const sideTabs = [
    { id: 'A', label: 'Side A' },
    { id: 'B', label: 'Side B' },
    { id: 'C', label: 'Side C' },
    { id: 'D', label: 'Side D' },
  ]

  const screenPriceDisplay = `+ £${getScreenPrice()}`

  return (
    <div className="w-full md:w-[400px] flex-shrink-0 bg-white md:border-r border-gray-200 shadow-2xl md:shadow-none z-20 flex flex-col font-sans h-[40vh] md:h-screen relative overflow-hidden order-last md:order-first">
      <div className="p-4 md:pb-32 overflow-y-auto flex-1">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl md:text-2xl text-gray-900 font-bold tracking-tight">Pergola Setup</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Configure your premium space.</p>
        </div>

        {/* Main Navigation Tabs - MOBILE ONLY */}
        <div className="flex md:hidden bg-gray-100 p-1 rounded-xl mb-4">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:space-y-8">
          {/* VIEW: Select Model */}
          <section className={`${activeTab === 'Model' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-gray-900 font-semibold mb-3">Model Type</h2>
            <div className="flex gap-3">
              {['Pergola', 'Product 1', 'Product 2'].map((mod) => {
                const isActive = currentModel === mod
                return (
                  <button
                    key={mod}
                    onClick={() => setModel(mod)}
                    className={`py-3.5 px-4 text-sm font-semibold rounded-xl border transition-all text-left flex items-center justify-between ${isActive
                      ? 'bg-[#F8EFEA] border-gray-900 text-gray-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    <span>{mod}</span>
                    {isActive}
                  </button>
                )
              })}
            </div>
          </section>

          {/* VIEW: Select Size */}
          <section className={`${activeTab === 'Size' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-gray-900 font-semibold mb-3">Dimensions</h2>
            <div className="flex gap-3">
              {['3x3', '4x3', '6x3'].map((s) => {
                const label = s.split('x').join(' x ')
                const isActive = currentSize === s
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-3.5 px-4 text-sm font-semibold rounded-xl border transition-all text-left flex items-center justify-between ${isActive
                      ? 'bg-[#F8EFEA] border-gray-900 text-gray-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    <span>{label}</span>
                    {isActive}
                  </button>
                )
              })}
            </div>
          </section>

          {/* VIEW: Select Color */}
          <section className={`${activeTab === 'Color' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-gray-900 font-semibold mb-3">Frame Finish</h2>
            <div className="flex gap-3">
              {[
                { hex: '#333333', name: 'Charcoal' },
                { hex: '#FFFFFF', name: 'White' },
                { hex: '#8B5A2B', name: 'Wood Finish' }
              ].map((c) => {
                const isActive = frameColor === c.hex
                return (
                  <button
                    key={c.hex}
                    onClick={() => setFrameColor(c.hex)}
                    className={`py-3 px-3 flex-1 flex flex-col items-center gap-2 text-xs font-semibold rounded-xl border transition-all ${isActive
                      ? 'bg-[#F8EFEA] border-gray-900 text-gray-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-full shadow-sm border border-gray-300" style={{ backgroundColor: c.hex }}></div>
                    <span>{c.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* VIEW: Sides & Screens */}
          <section className={`${activeTab === 'Sides' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-gray-900 font-semibold mb-3">Orient Side</h2>
            <div className="flex gap-2 mb-6">
              {sideTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSide(tab.id)}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-xl border transition-all ${activeSide === tab.id
                    ? 'bg-orange-50 border-gray-900 text-gray-900 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                >
                  {tab.id}
                </button>
              ))}
            </div>

            {/* Accessory Cards */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-gray-900 font-semibold">Side {activeSide} Blinds</h2>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-full">+ £300 each</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {activeSide === 'A' && currentSize === '6x3' && (
                <>
                  <ProductCard title="Left Screen" price={screenPriceDisplay} isOn={screenA_Left} onToggle={toggleScreenA_Left} />
                  <ProductCard title="Right Screen" price={screenPriceDisplay} isOn={screenA_Right} onToggle={toggleScreenA_Right} />
                </>
              )}
              {activeSide === 'A' && currentSize !== '6x3' && (
                <ProductCard title="Front Screen" price={screenPriceDisplay} isOn={screenA_Left} onToggle={toggleScreenA_Left} />
              )}

              {activeSide === 'B' && (
                <ProductCard title="Side Screen" price={screenPriceDisplay} isOn={screenB} onToggle={toggleScreenB} />
              )}

              {activeSide === 'C' && currentSize === '6x3' && (
                <>
                  <ProductCard title="Left Screen" price={screenPriceDisplay} isOn={screenC_Left} onToggle={toggleScreenC_Left} />
                  <ProductCard title="Right Screen" price={screenPriceDisplay} isOn={screenC_Right} onToggle={toggleScreenC_Right} />
                </>
              )}
              {activeSide === 'C' && currentSize !== '6x3' && (
                <ProductCard title="Back Screen" price={screenPriceDisplay} isOn={screenC_Left} onToggle={toggleScreenC_Left} />
              )}

              {activeSide === 'D' && (
                <ProductCard title="Side Screen" price={screenPriceDisplay} isOn={screenD} onToggle={toggleScreenD} />
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
              <span>£{getBasePrice()}</span>
            </div>
            {(screenA_Left || screenA_Right || screenB || screenC_Left || screenC_Right || screenD) && (
              <div className="border-t border-dashed border-gray-200 my-1 pt-1 flex flex-col gap-1">
                {screenA_Left && <div className="flex justify-between text-[11px]"><span>Side A (Left)</span><span>£{getScreenPrice()}</span></div>}
                {screenA_Right && <div className="flex justify-between text-[11px]"><span>Side A (Right)</span><span>£{getScreenPrice()}</span></div>}
                {screenB && <div className="flex justify-between text-[11px]"><span>Side B Screen</span><span>£{getScreenPrice()}</span></div>}
                {screenC_Left && <div className="flex justify-between text-[11px]"><span>Side C (Left)</span><span>£{getScreenPrice()}</span></div>}
                {screenC_Right && <div className="flex justify-between text-[11px]"><span>Side C (Right)</span><span>£{getScreenPrice()}</span></div>}
                {screenD && <div className="flex justify-between text-[11px]"><span>Side D Screen</span><span>£{getScreenPrice()}</span></div>}
              </div>
            )}
          </div>
        )}

        <button className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-all shadow-xl shadow-gray-900/20 active:scale-95 flex justify-between items-center px-5">
          <span>Add to Cart</span>
          <span className="font-bold tracking-wide">£{getTotalPrice()}</span>
        </button>
      </div>

    </div>
  )
}

function ProductCard({ title, price, isOn, onToggle }) {
  return (
    <div className="relative">
      {/* Absolute X button for active state */}
      {isOn && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-900 shadow-md z-10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div
        onClick={() => {
          if (!isOn) onToggle()
        }}
        className={`w-full flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all border bg-white ${isOn
          ? 'border-gray-900 shadow-sm relative'
          : 'border-gray-200 hover:border-gray-400'}`}
      >
        <div className="w-full bg-gray-50 flex items-center justify-center overflow-hidden">
          <img src="/pergola/screen.png" alt={title} className="w-full h-full object-cover opacity-90" />
        </div>
        <div className="p-3 flex flex-col flex-1 justify-between gap-0.5 bg-white border-t border-gray-100">
          <span className="text-[13px] font-semibold text-gray-900">{title}</span>
          {!isOn ? (
            <span className="text-[12px] text-gray-500 font-medium">{price}</span>
          ) : (
            <span className="text-[12px] text-green-600 font-bold">Added</span>
          )}
        </div>
      </div>
    </div>
  )
}
