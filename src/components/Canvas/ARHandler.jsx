import React, { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import useStore from '../../store'
import { Html } from '@react-three/drei'

export default function ARHandler() {
  const { scene } = useThree()
  const triggerARMode = useStore(state => state.triggerARMode)
  const [isExporting, setIsExporting] = useState(false)
  const [viewerReady, setViewerReady] = useState(false)
  const [arReadyViewer, setArReadyViewer] = useState(null)

  // Inject Google's model-viewer script on mount to handle native AR launching
  useEffect(() => {
    if (!document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js'
      script.onload = () => setViewerReady(true)
      document.head.appendChild(script)
    } else {
      setViewerReady(true)
    }
  }, [])

  useEffect(() => {
    if (triggerARMode === 0 || !viewerReady) return

    const exportToAR = async () => {
      setIsExporting(true)
      try {
        const exporter = new GLTFExporter()

        // Export ONLY the pergola group so we don't bring the background, HTML elements, or lights into AR
        const exportGroup = scene.getObjectByName('pergolaGroup') || scene

        exporter.parse(
          exportGroup,
          (gltf) => {
            const blob = new Blob([gltf], { type: 'model/gltf-binary' })
            const url = URL.createObjectURL(blob)

            // Create a hidden model-viewer element
            const viewer = document.createElement('model-viewer')
            viewer.src = url
            viewer.ar = true
            viewer.arModes = "webxr scene-viewer quick-look"

            // model-viewer v3+ automatically converts GLB to USDZ on iOS via local WASM!
            // model-viewer MUST be technically visible in the viewport to trigger its load event
            viewer.style.position = 'fixed'
            viewer.style.top = '50%'
            viewer.style.left = '50%'
            viewer.style.width = '1px'
            viewer.style.height = '1px'
            viewer.style.opacity = '0.001'
            viewer.style.pointerEvents = 'none'
            document.body.appendChild(viewer)

            // When the model loads into the DOM component, launch AR
            viewer.addEventListener('load', () => {
              // Present the "Launch AR" button to bypass iOS/Android async gesture blocks
              setIsExporting(false)
              setArReadyViewer(viewer)
            }, { once: true })
          },
          (error) => {
            console.error('AR export failed', error)
            alert("Sorry, there was an issue generating the AR model.")
            setIsExporting(false)
          },
          { binary: true } // Crucial: Export as .glb (binary) for model-viewer
        )
      } catch (error) {
        console.error('AR setup failed', error)
        setIsExporting(false)
      }
    }

    exportToAR()
  }, [triggerARMode, scene, viewerReady])

  if (isExporting) {
    return (
      <Html center zIndexRange={[1000, 0]}>
        <div className="bg-black/90 text-white px-5 py-3 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 pointer-events-none whitespace-nowrap">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-medium tracking-wide">Preparing AR Mode...</span>
        </div>
      </Html>
    )
  }

  if (arReadyViewer) {
    return (
      <Html center zIndexRange={[1000, 0]}>
        <div className="bg-black/85 p-6 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 border border-white/10 w-72">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 6.923-2.25-1.481M21 6.923v2.539m0-2.539-2.25 1.481M3 6.924l2.25-1.482M3 6.923l2.25 1.481M3 6.924v2.538m9 3.384 2.25-1.481M12 12.846l-2.25-1.481M12 12.846v2.539M12 23l2.25-1.481M12 23v-2.538M12 23l-2.25-1.481m0-19.039L12 1l2.25 1.481M21 14.54v2.538l-2.25 1.481m-13.5 0L3 17.077v-2.539" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">AR is Ready!</h3>
          <p className="text-sm text-gray-300 text-center text-balance leading-relaxed">
            Your exact pergola configuration is ready to be placed in your environment.
          </p>

          <button
            onClick={() => {
              arReadyViewer.activateAR()
              setArReadyViewer(null)
            }}
            className="w-full mt-3 bg-white hover:bg-gray-100 text-black font-bold py-3.5 px-6 rounded-2xl transition-all shadow-lg"
          >
            Launch Native AR
          </button>
          <button
            onClick={() => {
              setArReadyViewer(null)
            }}
            className="text-gray-400 hover:text-white text-sm transition-colors mt-2 font-medium"
          >
            Cancel
          </button>
        </div>
      </Html>
    )
  }

  return null
}
