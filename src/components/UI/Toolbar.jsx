import React, { useState, useEffect, useRef } from 'react'
import useStore from '../../store'

function Toolbar() {
  const { showDimensions, toggleDimensions, undo, history, triggerCameraReset, launchAR, setIsARModalOpen } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { })
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  const canGoBack = history.length > 0

  const handleBack = () => {
    undo()
  }

  const toolButtons = [
    {
      id: 'back',
      label: 'Undo',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true"><path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 1 1 0 12h-3"></path></svg>
      ),
      action: handleBack,
      disabled: !canGoBack,
      active: false // Back button is a trigger, not a toggle
    },
    {
      id: 'dimensions',
      label: 'Dimensions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true"><path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M7 22.918.707 16.625 16.625.706 22.918 7zM14.782 2.304l1.75 1.75M13.033 4.054l2.625 2.625M11.282 5.803l1.75 1.75M9.532 7.553l2.625 2.625M7.782 9.304l1.75 1.75M6.032 11.054l2.625 2.625M4.282 12.804l1.75 1.75M2.532 14.554l2.625 2.625"></path></svg>
      ),
      action: toggleDimensions,
      active: showDimensions
    },
    {
      id: 'fullscreen',
      label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true"><path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M4 8.364V4h4.364M4 15.636V20h4.364m7.272-16H20v4.364M15.636 20H20v-4.364"></path></svg>
      ),
      action: toggleFullscreen,
      active: isFullscreen
    },
    {
      id: 'ar',
      label: 'View in AR',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true"><path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="m21 6.923-2.25-1.481M21 6.923v2.539m0-2.539-2.25 1.481M3 6.924l2.25-1.482M3 6.923l2.25 1.481M3 6.924v2.538m9 3.384 2.25-1.481M12 12.846l-2.25-1.481M12 12.846v2.539M12 23l2.25-1.481M12 23v-2.538M12 23l-2.25-1.481m0-19.039L12 1l2.25 1.481M21 14.54v2.538l-2.25 1.481m-13.5 0L3 17.077v-2.539"></path></svg>
      ),
      action: () => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (isMobile) {
          launchAR()
        } else {
          setIsARModalOpen(true)
        }
      }
    },
    {
      id: 'center',
      label: 'Center View',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true"><path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="m2 2 6.364 6.364m0 0V3.875m0 4.489H3.875M2 22l6.364-6.364m0 0H3.875m4.489 0v4.489M22 2l-6.364 6.364m0 0V3.875m0 4.489h4.489M22 22l-6.364-6.364m0 0h4.489m-4.489 0v4.489"></path></svg>
      ),
      action: triggerCameraReset
    }
  ]

  return (
    <>
      {/* Desktop Column */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50 pointer-events-auto">
        {toolButtons.map(btn => (
          <div key={btn.id} className="relative group flex items-center">
            <button
              onClick={btn.disabled ? null : btn.action}
              disabled={btn.disabled}
              className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all ${btn.disabled
                ? 'opacity-30 cursor-not-allowed'
                : btn.active
                  ? 'bg-gray-900 text-white shadow-gray-900/40'
                  : 'bg-white/90 text-gray-800 hover:bg-black hover:text-white shadow-black/10'
                }`}
            >
              {btn.icon}
            </button>
            {/* Hover Tooltip */}
            {!btn.disabled && (
              <div className="absolute right-full mr-4 px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-full opacity-0 pointer-events-none translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap shadow-xl backdrop-blur-sm">
                {btn.label}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Dropdown (kebab menu) */}
      <div className="md:hidden fixed top-6 right-6 z-50 pointer-events-auto" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg text-gray-800 shadow-black/10"
        >
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v.01M12 12v.01M12 18v.01" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute top-14 right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl flex flex-col p-1.5 gap-1 border border-gray-100 min-w-[160px] animate-in fade-in zoom-in-95">
            {toolButtons.filter(btn => btn.id !== 'fullscreen').map(btn => (
              <button
                key={btn.id}
                onClick={() => {
                  btn.action()
                  if (btn.id !== 'back') {
                    setMenuOpen(false)
                  }
                }}
                disabled={btn.disabled}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${btn.disabled
                  ? 'opacity-40 cursor-not-allowed'
                  : btn.active
                    ? 'bg-gray-900 text-white'
                    : 'bg-transparent text-gray-800 hover:bg-gray-100'
                  }`}
              >
                <div className="shrink-0">
                  {btn.icon}
                </div>
                <span className="font-medium text-sm whitespace-nowrap">
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Toolbar
