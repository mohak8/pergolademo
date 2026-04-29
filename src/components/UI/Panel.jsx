import React from 'react'
import useStore from '../../store'


export default function Panel() {
  const {
    activeHandle, productCatalog, switchProduct, isLoading,
    activeSide, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD, currentSize, availableSizes,
    setActiveSide, toggleScreenA_Left, toggleScreenA_Right, toggleScreenB, toggleScreenC_Left, toggleScreenC_Right, toggleScreenD, setSize,
    isBreakdownVisible, toggleBreakdown, getTotalPrice, getBasePrice,
    availableColors, frameColor, setFrameColor, activeTab, setActiveTab, addonProducts, sizesConfig
  } = useStore()

  const mainTabs = ['Model', 'Size', 'Color', 'Sides']

  const sideTabs = [
    { id: 'A', label: 'Side A' },
    { id: 'B', label: 'Side B' },
    { id: 'C', label: 'Side C' },
    { id: 'D', label: 'Side D' },
  ]

  // Removed static screenPriceDisplay

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
              {productCatalog.map((handle) => {
                const isActive = activeHandle === handle
                return (
                  <button
                    key={handle}
                    onClick={() => switchProduct(handle)}
                    disabled={isLoading}
                    className={`py-3.5 px-4 text-sm font-semibold rounded-xl border transition-all text-left flex items-center justify-between ${isActive
                      ? 'bg-[#F8EFEA] border-gray-900 text-gray-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="capitalize">{handle.replace(/-/g, ' ')}</span>
                    {isActive}
                  </button>
                )
              })}
            </div>
          </section>

          {/* VIEW: Select Size */}
          <section className={`${activeTab === 'Size' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-gray-900 font-semibold mb-3">Dimensions</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableSizes.length > 0 ? availableSizes.map((s) => {
                const label = s.split('x').join(' x ')
                const isActive = currentSize === s
                return (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-3.5 px-4 text-sm font-semibold rounded-xl border transition-all text-left flex items-center justify-between whitespace-nowrap ${isActive
                      ? 'bg-[#F8EFEA] border-gray-900 text-gray-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                  >
                    <span>{label}</span>
                  </button>
                )
              }) : <div className="text-xs text-gray-400 italic">No sizes found</div>}
            </div>
          </section>

          {/* VIEW: Select Color */}
          <section className={`${activeTab === 'Color' ? 'block animate-in fade-in slide-in-from-right-4 duration-300' : 'hidden'} md:block md:animate-none`}>
            <h2 className="text-sm text-gray-900 font-semibold mb-3">Frame Finish</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableColors.length > 0 ? availableColors.map((c) => {
                const isActive = frameColor === c.hex
                return (
                  <button
                    key={c.name}
                    onClick={() => setFrameColor(c.hex, c.name)}
                    className={`py-3 px-3 min-w-[100px] flex flex-col items-center gap-2 text-xs font-semibold rounded-xl border transition-all ${isActive
                      ? 'bg-[#F8EFEA] border-gray-900 text-gray-900 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-full shadow-sm border border-gray-300" style={{ backgroundColor: c.hex }}></div>
                    <span className="whitespace-nowrap">{c.name}</span>
                  </button>
                )
              }) : <div className="text-xs text-gray-400 italic">No colors found</div>}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              {sizesConfig[currentSize]?.[`slide${activeSide}`]?.map((product, index, arr) => {
                // Dynamically map Shopify data to your existing store.js booleans
                let isOn = false;
                let onToggle = () => {};
                
                if (activeSide === 'A') {
                  isOn = index === 0 ? screenA_Left : screenA_Right;
                  onToggle = index === 0 ? toggleScreenA_Left : toggleScreenA_Right;
                } else if (activeSide === 'B') {
                  isOn = screenB;
                  onToggle = toggleScreenB;
                } else if (activeSide === 'C') {
                  isOn = index === 0 ? screenC_Left : screenC_Right;
                  onToggle = index === 0 ? toggleScreenC_Left : toggleScreenC_Right;
                } else if (activeSide === 'D') {
                  isOn = screenD;
                  onToggle = toggleScreenD;
                }

                // Make sure Shopify prices are formatted smoothly
                const price = product.price > 1000 ? product.price / 100 : product.price;

                return (
                  <ProductCard 
                    key={product.id}
                    title={product.title} 
                    price={`+ £${price}`} 
                    isOn={isOn} 
                    onToggle={onToggle} 
                    image={product.featured_image}
                  />
                );
              })}
            </div>

            {/* Addon Products Section */}
            {addonProducts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-sm text-gray-900 font-semibold mb-3">Optional Accessories</h2>
                <div className="grid grid-cols-2 gap-4">
                  {addonProducts.map((addon) => (
                    <div key={addon.id} className="border border-gray-200 rounded-xl p-3 flex flex-col gap-1 bg-gray-50/50">
                      {addon.images?.[0] && (
                        <img src={addon.images[0].src} alt={addon.title} className="w-full h-24 object-cover rounded-lg mb-1" />
                      )}
                      <span className="text-[12px] font-bold text-gray-900 truncate">{addon.title}</span>
                      <span className="text-[11px] text-gray-500">£{(addon.variants[0]?.price / 100 || 0).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
        {isBreakdownVisible && (() => {
          const slidesData = sizesConfig[currentSize] || {};
          const getScreenInfo = (side, index) => slidesData[`slide${side}`]?.[index] || null;

          const activeScreens = [
            { isOn: screenA_Left, side: 'A', index: 0 },
            { isOn: screenA_Right, side: 'A', index: 1 },
            { isOn: screenB, side: 'B', index: 0 },
            { isOn: screenC_Left, side: 'C', index: 0 },
            { isOn: screenC_Right, side: 'C', index: 1 },
            { isOn: screenD, side: 'D', index: 0 },
          ].filter(s => s.isOn && getScreenInfo(s.side, s.index));

          return (
            <div className="text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between font-semibold text-gray-800">
                <span>{currentSize} Base Frame</span>
                <span>£{getBasePrice()}</span>
              </div>
              {activeScreens.length > 0 && (
                <div className="border-t border-dashed border-gray-200 my-1 pt-1 flex flex-col gap-1">
                  {activeScreens.map(s => {
                    const p = getScreenInfo(s.side, s.index);
                    const price = p.price > 1000 ? (p.price / 100).toFixed(2) : p.price;
                    return (
                      <div key={s.side + s.index} className="flex justify-between text-[11px]">
                        <span className="truncate pr-2">{p.title}</span>
                        <span>£{price}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        <button className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-all shadow-xl shadow-gray-900/20 active:scale-95 flex justify-between items-center px-5">
          <span>{isLoading ? 'Updating...' : 'Add to Cart'}</span>
          <span className="font-bold tracking-wide">£{getTotalPrice().toFixed(2)}</span>
        </button>
      </div>

    </div>
  )
}

function ProductCard({ title, price, isOn, onToggle, image }) {
  const displayImage = image || `${import.meta.env.BASE_URL}pergola/screen.png`;
  
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
          <img src={displayImage} alt={title} className="w-full h-full object-cover opacity-90" />
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
