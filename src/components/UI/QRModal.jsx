import React, { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import useStore from '../../store'

export default function QRModal() {
  const {
    isARModalOpen,
    setIsARModalOpen,
    currentSize,
    frameColor,
    screenA_Left,
    screenA_Right,
    screenB,
    screenC_Left,
    screenC_Right,
    screenD
  } = useStore()

  const [arUrl, setArUrl] = useState('')

  useEffect(() => {
    if (isARModalOpen) {
      // Build the state URL for the mobile device
      const screens = [
        screenA_Left ? 'A_L' : '',
        screenA_Right ? 'A_R' : '',
        screenB ? 'B' : '',
        screenC_Left ? 'C_L' : '',
        screenC_Right ? 'C_R' : '',
        screenD ? 'D' : ''
      ].filter(Boolean).join(',')

      const url = new URL(window.location.origin + window.location.pathname)
      url.searchParams.set('ar', 'true')
      url.searchParams.set('size', currentSize)
      url.searchParams.set('color', encodeURIComponent(frameColor))
      if (screens) url.searchParams.set('screens', screens)

      setArUrl(url.toString())
    }
  }, [isARModalOpen, currentSize, frameColor, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD])

  if (!isARModalOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={() => setIsARModalOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">View in AR</h2>
          <p className="text-sm text-gray-500">Scan this code with your mobile device's camera to view your exact pergola configuration in your backyard.</p>
        </div>

        <div className="flex justify-center bg-gray-50 p-6 rounded-xl border-2 border-gray-100 shadow-inner mb-6">
          {arUrl && <QRCodeSVG value={arUrl} size={220} level="H" includeMargin={true} />}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Works natively on iOS & Android
          </div>
        </div>
      </div>
    </div>
  )
}
