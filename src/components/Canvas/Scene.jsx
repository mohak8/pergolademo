import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, CameraControls } from '@react-three/drei'
import * as THREE from 'three'
import Box from './Box' // This holds our modular Pergola assembly

export default function Scene() {
  const controlsRef = useRef()

  // Ensure camera target and position are explicitly bound on mount
  useEffect(() => {
    if (controlsRef.current) {
      // (cameraX, cameraY, cameraZ, focusX, focusY, focusZ, animate)
      controlsRef.current.setLookAt(0, 2.5, 8, 0, 1.5, 0, false)
    }
  }, [])

  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.5, 8], fov: 50 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      className="w-full h-full"
    >
      <color attach="background" args={['#eef2f6']} />

      <ambientLight intensity={0.5} />

      <directionalLight
        castShadow
        position={[4, 8, 4]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-5, 5, 5, -5, 1, 20]} />
      </directionalLight>

      {/* Fill Light to soften shadows */}
      <directionalLight position={[-4, 4, -4]} intensity={0.4} />

      <Suspense fallback={null}>
        <Environment preset="city" />
        <Box />
      </Suspense>

      {/* High Quality Contact Shadows perfectly grounded at 0 */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.7}
        scale={12}
        blur={2.5}
        far={2}
        color="#1f2937"
      />

      {/* Keep the camera completely stationary, just allow static panning restrictions if user grabs it */}
      <CameraControls
        ref={controlsRef}
        makeDefault
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={3}
        maxDistance={15}
        target={[0, 1.2, 0]}
      />
    </Canvas>
  )
}
