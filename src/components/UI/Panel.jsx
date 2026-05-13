import React, { useState, useRef } from 'react'
import useStore from '../../store'

export default function Panel() {
  const {
    shopifyData, currentModel, setModel, activeSide, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD, currentSize,
    setActiveSide, toggleScreenA_Left, toggleScreenA_Right, toggleScreenB, toggleScreenC_Left, toggleScreenC_Right, toggleScreenD, setSize,
    isBreakdownVisible, toggleBreakdown, getTotalPrice, getBasePrice, getScreenPrice,
    frameColor, setFrameColor, activeTab, setActiveTab, addToCart, isAddingToCart
  } = useStore()

  const sideTabs = [
    { id: 'A', label: 'Side A' },
    { id: 'B', label: 'Side B' },
    { id: 'C', label: 'Side C' },
    { id: 'D', label: 'Side D' },
  ]

  // --- DYNAMIC OPTION EXTRACTION ---

  // 1. Available Sizes (e.g. ['3x3', '4x3', '6x3'])
  const availableSizes = shopifyData?.product?.variants
    ? [...new Set(shopifyData.product.variants.map(v => v.option1.replace('m', '')))]
    : ['3x3', '4x3', '6x3'];

  // 2. Available Finishes (Dynamic Data Mockup representing JSON structure)
  const availableFinishes = [
    { type: 'color', value: '#333333', name: 'Charcoal' },
    { type: 'color', value: '#FFFFFF', name: 'White' },
    { type: 'texture', value: `${import.meta.env.BASE_URL}pergola/wood-texture.png`, name: 'Wood Finish' }
  ];

  const screenPriceDisplay = `+ £${getScreenPrice()}`

  const blindsRef = useRef(null)

  const handleSideSelect = (sideId) => {
    setActiveSide(sideId)
    setActiveTab('Blinds')
    setTimeout(() => {
      blindsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  return (
    <div className="pointer-events-auto w-full md:w-[420px] md:m-6 md:rounded-3xl flex-shrink-0 bg-slate-950/70 backdrop-blur-sm md:border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-20 flex flex-col font-sans h-[45vh] md:h-[calc(100vh-48px)] relative overflow-hidden order-last md:order-first mt-auto transition-all duration-500 ease-in-out pb-[env(safe-area-inset-bottom)] rounded-t-3xl md:rounded-b-3xl border-t">
      <div className="p-5 md:p-7 pb-32 md:pb-40 overflow-y-auto flex-1 hide-scroll">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl text-white font-extrabold tracking-tight drop-shadow-sm">
            {shopifyData?.product?.title || 'Pergola Setup'}
          </h1>
          <p className="text-sm text-slate-300 mt-1.5 font-medium">Configure your premium space.</p>
        </div>

        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden overflow-x-auto pb-4 mb-2 -mx-5 px-5 hide-scroll flex space-x-2">
          {[
            { id: 'Model', label: 'Range' },
            { id: 'Size', label: 'Size' },
            { id: 'Color', label: 'Color' },
            { id: 'Sides', label: 'Sides' }
          ].map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'Sides' && activeTab === 'Blinds');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-bold transition-all border ${isActive
                  ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                  : 'bg-white/5 text-slate-300 border-transparent hover:bg-white/10'
                  }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col md:space-y-10">
          {/* VIEW: Model Selection */}
          <section className={`${activeTab === 'Model' ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-slate-100 font-bold mb-3 uppercase tracking-wider drop-shadow-sm">Model Type</h2>
            <div className="flex flex-wrap gap-3">
              {[shopifyData?.product?.title || 'Pergola Plus'].map((mod) => {
                return (
                  <button
                    key={mod}
                    className="py-3 px-5 text-sm font-bold rounded-2xl transition-all text-left flex items-center justify-center bg-white/10 border-2 border-white/20 text-white shadow-lg backdrop-blur-md"
                  >
                    <span className="whitespace-nowrap">{mod}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* VIEW: Size Selection */}
          <section className={`${activeTab === 'Size' ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-slate-100 font-bold mb-3 uppercase tracking-wider drop-shadow-sm">Dimensions</h2>
            <div className="flex flex-wrap gap-2 bg-black/20 p-2 rounded-2xl backdrop-blur-sm border border-white/5 shadow-inner">
              {availableSizes.map((s) => {
                const label = s.split('x').join(' × ')
                const isActive = currentSize === s
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-2.5 px-5 text-sm font-bold rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-white/20 text-white shadow-lg scale-[1.02] border border-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                  >
                    <span className="whitespace-nowrap">{label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* VIEW: Color Selection */}
          <section className={`${activeTab === 'Color' ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-slate-100 font-bold mb-3 uppercase tracking-wider drop-shadow-sm">Frame Finish</h2>
            <div className="flex flex-wrap gap-3">
              {availableFinishes.map((finish) => {
                const isActive = frameColor === finish.value
                return (
                  <button
                    key={finish.value}
                    onClick={() => setFrameColor(finish.value)}
                    className={`group py-3 px-4 flex flex-col items-center gap-2 text-[12px] font-bold rounded-2xl transition-all duration-300 ${isActive
                      ? 'bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-[1.02] border border-white/20'
                      : 'bg-transparent border border-transparent hover:bg-white/5'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' : 'ring-1 ring-white/20 shadow-sm'}`}>
                      {finish.type === 'texture' ? (
                        <div className="w-full h-full rounded-full border border-black/20 bg-cover bg-center" style={{ backgroundImage: `url(${finish.value})` }}></div>
                      ) : (
                        <div className="w-full h-full rounded-full border border-black/20" style={{ backgroundColor: finish.value }}></div>
                      )}
                    </div>
                    <span className={`whitespace-nowrap ${isActive ? 'text-white drop-shadow-sm' : 'text-slate-400'}`}>{finish.name}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* VIEW: Sides Selection */}
          <section className={`${(activeTab === 'Sides' || activeTab === 'Blinds') ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} md:block md:animate-none`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-slate-100 font-bold uppercase tracking-wider drop-shadow-sm">Orient Side</h2>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {sideTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSideSelect(tab.id)}
                  className={`py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 border ${activeSide === tab.id && activeTab === 'Blinds'
                    ? 'bg-white text-slate-900 shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-[1.02] border-white'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {tab.id}
                </button>
              ))}
            </div>
            {activeTab === 'Sides' && <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold text-center mt-3">Pick a side to configure</p>}
          </section>

          {/* VIEW: Blinds Selection */}
          {activeTab === 'Blinds' && (
            <section ref={blindsRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
              <div className="flex items-center justify-between mb-4 mt-2">
                <h2 className="text-sm text-white font-bold drop-shadow-sm">Configure Side {activeSide}</h2>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest bg-white/10 border border-white/5 px-3 py-1.5 rounded-full">{screenPriceDisplay}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {activeSide === 'A' && currentSize === '6x3' && (
                  <>
                    <ProductCard title="Left Screen" price={screenPriceDisplay} isOn={screenA_Left} onToggle={toggleScreenA_Left} />
                    <ProductCard title="Right Screen" price={screenPriceDisplay} isOn={screenA_Right} onToggle={toggleScreenA_Right} />
                  </>
                )}
                {activeSide === 'A' && currentSize !== '6x3' && (
                  <ProductCard title="Screen" price={screenPriceDisplay} isOn={screenA_Left} onToggle={toggleScreenA_Left} />
                )}

                {activeSide === 'B' && (
                  <ProductCard title="Screen" price={screenPriceDisplay} isOn={screenB} onToggle={toggleScreenB} />
                )}

                {activeSide === 'C' && currentSize === '6x3' && (
                  <>
                    <ProductCard title="Left Screen" price={screenPriceDisplay} isOn={screenC_Left} onToggle={toggleScreenC_Left} />
                    <ProductCard title="Right Screen" price={screenPriceDisplay} isOn={screenC_Right} onToggle={toggleScreenC_Right} />
                  </>
                )}
                {activeSide === 'C' && currentSize !== '6x3' && (
                  <ProductCard title="Screen" price={screenPriceDisplay} isOn={screenC_Left} onToggle={toggleScreenC_Left} />
                )}

                {activeSide === 'D' && (
                  <ProductCard title="Screen" price={screenPriceDisplay} isOn={screenD} onToggle={toggleScreenD} />
                )}
              </div>
            </section>
          )}
        </div>
      </div>


      {/* Sticky Cart & Pricing Footer */}
      <div className="p-5 md:p-6 border-t border-white/10 bg-slate-950/70 backdrop-blur-2xl absolute bottom-0 left-0 w-full z-30 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

        {/* Breakdown Toggle */}
        <button
          onClick={toggleBreakdown}
          className="w-full flex justify-between items-center text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4 hover:text-white transition-colors"
        >
          <span>View Breakdown</span>
          <svg className={`w-4 h-4 transform transition-transform duration-300 ${isBreakdownVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Breakdown List */}
        <div className={`overflow-hidden transition-all duration-300 ${isBreakdownVisible ? 'max-h-64 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
          <div className="text-xs text-slate-300 bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-2 shadow-inner">
            <div className="flex justify-between font-bold text-white drop-shadow-sm">
              <span>{currentSize} Base Frame</span>
              <span>£{getBasePrice()}</span>
            </div>
            {(screenA_Left || screenA_Right || screenB || screenC_Left || screenC_Right || screenD) && (
              <div className="border-t border-white/10 my-1 pt-2 flex flex-col gap-1.5">
                {screenA_Left && <div className="flex justify-between text-[12px] font-medium text-slate-300"><span>Side A (Left)</span><span>£{getScreenPrice()}</span></div>}
                {screenA_Right && <div className="flex justify-between text-[12px] font-medium text-slate-300"><span>Side A (Right)</span><span>£{getScreenPrice()}</span></div>}
                {screenB && <div className="flex justify-between text-[12px] font-medium text-slate-300"><span>Side B Screen</span><span>£{getScreenPrice()}</span></div>}
                {screenC_Left && <div className="flex justify-between text-[12px] font-medium text-slate-300"><span>Side C (Left)</span><span>£{getScreenPrice()}</span></div>}
                {screenC_Right && <div className="flex justify-between text-[12px] font-medium text-slate-300"><span>Side C (Right)</span><span>£{getScreenPrice()}</span></div>}
                {screenD && <div className="flex justify-between text-[12px] font-medium text-slate-300"><span>Side D Screen</span><span>£{getScreenPrice()}</span></div>}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={addToCart}
          disabled={isAddingToCart}
          className={`w-full py-4 rounded-2xl text-sm font-bold transition-all shadow-2xl active:scale-95 flex justify-between items-center px-6 ${isAddingToCart
            ? 'bg-white/20 cursor-not-allowed shadow-none text-white/50'
            : 'bg-white hover:bg-slate-200 text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            }`}
        >
          {isAddingToCart ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding to Cart...</span>
            </div>
          ) : (
            <>
              <span className="tracking-wide">Add to Cart</span>
              <span className="font-extrabold tracking-wider text-[15px]">£{getTotalPrice()}</span>
            </>
          )}
        </button>
      </div>

    </div>
  )
}

function ProductCard({ title, price, isOn, onToggle }) {
  return (
    <div className="relative group">
      {isOn && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="absolute -top-2.5 -right-2.5 w-8 h-8 bg-white border border-transparent rounded-full flex items-center justify-center text-slate-900 hover:bg-red-500 hover:text-white shadow-lg z-10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div
        onClick={() => {
          if (!isOn) onToggle()
        }}
        className={`w-full flex flex-col backdrop-blur-md rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${isOn
          ? 'ring-2 ring-white backdrop-blur-md border-transparent shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-[1.02] relative'
          : 'border-white/10 hover:shadow-lg hover:-translate-y-1'}`}
      >
        <div className="w-full bg-white/95 flex items-center justify-center overflow-hidden p-3">
          <img src={`${import.meta.env.BASE_URL}pergola/screen.png`} alt={title} className="w-full h-full object-contain drop-shadow-sm rounded-lg" />
        </div>
        <div className="p-3.5 flex flex-col flex-1 justify-between gap-1 ">
          <span className="text-[13px] font-bold text-white drop-shadow-sm">{title}</span>
          {!isOn ? (
            <span className="text-[12px] text-slate-400 font-semibold">{price}</span>
          ) : (
            <span className="text-[12px] text-emerald-400 font-extrabold drop-shadow-sm">Added</span>
          )}
        </div>
      </div>
    </div>
  )
}
