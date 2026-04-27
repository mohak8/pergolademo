import React, { useState } from 'react'
import useStore from '../../store'

function Toolbar() {
  const { showDimensions, toggleDimensions, undo, history } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const canGoBack = history.length > 0

  const handleBack = () => {
    undo()
  }

  const toolButtons = [
    {
      id: 'back',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      ),
      action: handleBack,
      disabled: !canGoBack,
      active: false // Back button is a trigger, not a toggle
    },
    {
      id: 'dimensions',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-4.879-4.879l-4.242-4.242m4.242 4.242L10.607 17.657m3.514-3.536l-8.485-8.485m4.95 13.435L3.536 12.001M17.657 6.343L12 12" />
        </svg>
      ),
      action: toggleDimensions,
      active: showDimensions
    },
    {
      id: 'fullscreen',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V4m0 0h4M3 4l4 4m8 0V4m0 0h-4m4 0l-4 4m-8 4v4m0 0h4m-4 0l4-4m8 4l-4-4m4 4v-4m0 4h-4" />
        </svg>
      ),
      action: () => console.log('Fullscreen')
    },
    {
      id: 'ar',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      action: () => console.log('AR Mode')
    }
  ]

  return (
    <>
      {/* Desktop Column */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        {toolButtons.map(btn => (
          <button
            key={btn.id}
            onClick={btn.disabled ? null : btn.action}
            disabled={btn.disabled}
            className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${
              btn.disabled 
                ? 'opacity-30 cursor-not-allowed' 
                : btn.active 
                  ? 'bg-gray-900 text-white shadow-gray-900/40' 
                  : 'bg-white/90 text-gray-800 hover:bg-white hover:scale-105 shadow-black/10'
            }`}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Mobile Dropdown (kebab menu) */}
      <div className="md:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-gray-800 shadow-black/10"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v.01M12 12v.01M12 18v.01" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute top-14 right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex flex-col p-2 gap-2 border border-gray-100 animate-in fade-in zoom-in-95">
            {toolButtons.map(btn => (
              <button
                key={btn.id}
                onClick={() => {
                  btn.action()
                  setMenuOpen(false)
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  btn.active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Toolbar
