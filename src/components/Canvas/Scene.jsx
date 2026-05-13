import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, CameraControls } from '@react-three/drei'
import * as THREE from 'three'
import Box from './Box' // This holds our modular Pergola assembly
import ARHandler from './ARHandler'
import useStore from '../../store'

// Sub-component to manipulate the projection matrix safely without breaking OrbitControls
function ViewportOffset() {
  const { camera, size } = useThree()
  
  useEffect(() => {
    if (size.width >= 768) {
      // The panel is ~420px wide on desktop. 
      // Offsetting by -210px (half panel width) perfectly centers the model in the remaining empty space.
      camera.setViewOffset(size.width, size.height, -210, 0, size.width, size.height)
    } else {
      camera.clearViewOffset()
    }
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  return null
}

export default function Scene() {
  const controlsRef = useRef()
  const activeSide = useStore((state) => state.activeSide)
  const currentSize = useStore((state) => state.currentSize)
  const cameraTrigger = useStore((state) => state.cameraTrigger)

  useEffect(() => {
    if (controlsRef.current) {
      // Dynamically zoom out to fit the larger 6x3 model without locking user interactions
      const zOffset = currentSize === '6x3' ? 6.5 : 4.8
      controlsRef.current.setLookAt(0, 1, zOffset, 0, 0, 0, true)
    }
  }, [activeSide, currentSize, cameraTrigger])

  return (
    <Canvas
      camera={{ position: [0, 1.5, 4.5], fov: 80 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      className="w-full h-full"
    >
      <color attach="background" args={['#eef2f6']} />

      <ambientLight intensity={0.5} />

      <directionalLight
        position={[4, 4, 4]}
        intensity={1.5}
      />

      {/* Fill Light to soften ambient lighting */}
      <directionalLight position={[-4, 4, -4]} intensity={0.4} />

      <Suspense fallback={null}>
        <Environment preset="city" />
        <ViewportOffset />
        <Box />
        <ARHandler />
      </Suspense>


      <CameraControls
        ref={controlsRef}
        makeDefault
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={0.1}
        maxDistance={15}
      />
    </Canvas>
  )
}
