import React, { useMemo, useEffect, useState, useRef } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store'
import { useSpring, animated } from '@react-spring/three'

export default function Pergola() {
  const {
    activeSide, screenB, screenD, setActiveSide, currentSize,
    screenA_Left, screenA_Right, screenC_Left, screenC_Right
  } = useStore()

  // Only dispatch the network load for the specific size requested!
  const { scene: frameRaw } = useGLTF(`/pergola/${currentSize}/${currentSize}.glb`)

  // Conditionally load the Long-Side Screen (Sides A & C)
  // For 6x3, we recycle the 3x3 screen twice per side
  const screensRawPath = currentSize === '6x3'
    ? '/pergola/3x3/3x3_Screen.glb'
    : `/pergola/${currentSize}/${currentSize}_Screen.glb`
  const { scene: longScreenRaw } = useGLTF(screensRawPath)

  // The Short-Side Screen (Sides B & D) safely recycles the 3-meter file always.
  const { scene: shortScreenRaw } = useGLTF('/pergola/3x3/3x3_Screen.glb')

  // Ensure graceful handle of cloning the geometry with shadows
  const safeClone = (rawGeometry) => {
    if (!rawGeometry) return new THREE.Group()

    const clone = rawGeometry.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }

  // Switch Master Frame scientifically safely
  const frame = useMemo(() => safeClone(frameRaw), [frameRaw])

  // Map respective screens (Double clones for A and C to avoid THREE UUID conflicts in 6x3)
  const cloneA_Left = useMemo(() => safeClone(longScreenRaw), [longScreenRaw])
  const cloneA_Right = useMemo(() => safeClone(longScreenRaw), [longScreenRaw])
  const cloneB = useMemo(() => safeClone(shortScreenRaw), [shortScreenRaw])
  const cloneC_Left = useMemo(() => safeClone(longScreenRaw), [longScreenRaw])
  const cloneC_Right = useMemo(() => safeClone(longScreenRaw), [longScreenRaw])
  const cloneD = useMemo(() => safeClone(shortScreenRaw), [shortScreenRaw])

  // Coordinate Dictionary Mapping
  const configs = {
    '3x3': {
      A: { position: [0, 1.65, 1.34], rotation: [0, 0, 0] },
      B: { position: [1.42, 1.65, -0.08], rotation: [0, -Math.PI / 2, 0] },
      C: { position: [0, 1.65, -1.50], rotation: [0, Math.PI, 0] },
      D: { position: [-1.42, 1.65, -0.08], rotation: [0, Math.PI / 2, 0] }
    },
    '4x3': {
      A: { position: [0.05, 1.64, 1.345], rotation: [0, 0, 0] },
      B: { position: [1.905, 1.64, -0.08], rotation: [0, -Math.PI / 2, 0] },
      C: { position: [-0.09, 1.64, -1.505], rotation: [0, Math.PI, 0] },
      D: { position: [-1.955, 1.64, -0.08], rotation: [0, Math.PI / 2, 0] }
    },
    '6x3': {
      A_Left: { position: [-1.5, 1.65, 1.34], rotation: [0, 0, 0] },
      A_Right: { position: [1.5, 1.65, 1.34], rotation: [0, 0, 0] },
      B: { position: [2.92, 1.65, -0.08], rotation: [0, -Math.PI / 2, 0] },
      C_Left: { position: [-1.5, 1.65, -1.5], rotation: [0, Math.PI, 0] },
      C_Right: { position: [1.5, 1.65, -1.5], rotation: [0, Math.PI, 0] },
      D: { position: [-2.92, 1.65, -0.08], rotation: [0, Math.PI / 2, 0] }
    }
  }

  const actConfig = configs[currentSize]

  // Shortest Path Rotation Algorithm
  const [targetY, setTargetY] = useState(0)
  const currentAngleRef = useRef(0)

  useEffect(() => {
    // Map activeSide to the baseline geometry offsets
    let targetVisualAngle = 0
    if (activeSide === 'A') targetVisualAngle = 0
    if (activeSide === 'B') targetVisualAngle = -Math.PI / 2
    if (activeSide === 'C') targetVisualAngle = -Math.PI
    if (activeSide === 'D') targetVisualAngle = -Math.PI * 1.5

    // Shortest path logic utilizing modulo
    let current = currentAngleRef.current
    let diff = targetVisualAngle - (current % (Math.PI * 2))

    // Fix unwinding across boundaries
    if (diff > Math.PI) diff -= Math.PI * 2
    if (diff < -Math.PI) diff += Math.PI * 2

    const newAngle = current + diff
    setTargetY(newAngle)
    currentAngleRef.current = newAngle
  }, [activeSide])

  const { rotationY } = useSpring({
    rotationY: targetY,
    config: { tension: 60, friction: 15 } // Equivalent smooth easing mathematically
  })

  return (
    <animated.group position={[0, -1, 0]} rotation-y={rotationY}>
      {/* Premium HTML Markers (Always face camera, legible from any angle) */}
      <Html position={[0, 0, 2.5]} center>
        <div
          onClick={() => setActiveSide('A')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${
            activeSide === 'A' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
          }`}
        >
          A
        </div>
      </Html>

      <Html position={[currentSize === '6x3' ? 3.5 : (currentSize === '4x3' ? 2.5 : 2.0), 0, 0]} center>
        <div
          onClick={() => setActiveSide('B')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${
            activeSide === 'B' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
          }`}
        >
          B
        </div>
      </Html>

      <Html position={[0, 0, -2.5]} center>
        <div
          onClick={() => setActiveSide('C')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${
            activeSide === 'C' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
          }`}
        >
          C
        </div>
      </Html>

      <Html position={[currentSize === '6x3' ? -3.5 : (currentSize === '4x3' ? -2.5 : -2.0), 0, 0]} center>
        <div
          onClick={() => setActiveSide('D')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${
            activeSide === 'D' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
          }`}
        >
          D
        </div>
      </Html>

      {/* Main Framework */}
      <primitive
        object={frame}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* Side A: Front Screen */}
      {currentSize === '6x3' ? (
        <>
          {screenA_Left && <primitive object={cloneA_Left} position={actConfig.A_Left.position} rotation={actConfig.A_Left.rotation} castShadow receiveShadow />}
          {screenA_Right && <primitive object={cloneA_Right} position={actConfig.A_Right.position} rotation={actConfig.A_Right.rotation} castShadow receiveShadow />}
        </>
      ) : (
        screenA_Left && <primitive object={cloneA_Left} position={actConfig.A.position} rotation={actConfig.A.rotation} castShadow receiveShadow />
      )}

      {/* Side B: Right Screen */}
      {screenB && (
        <primitive
          object={cloneB}
          position={actConfig.B.position}
          rotation={actConfig.B.rotation}
          castShadow
          receiveShadow
        />
      )}

      {/* Side C: Back Screen */}
      {currentSize === '6x3' ? (
        <>
          {screenC_Left && <primitive object={cloneC_Left} position={actConfig.C_Left.position} rotation={actConfig.C_Left.rotation} castShadow receiveShadow />}
          {screenC_Right && <primitive object={cloneC_Right} position={actConfig.C_Right.position} rotation={actConfig.C_Right.rotation} castShadow receiveShadow />}
        </>
      ) : (
        screenC_Left && <primitive object={cloneC_Left} position={actConfig.C.position} rotation={actConfig.C.rotation} castShadow receiveShadow />
      )}

      {/* Side D: Left Screen */}
      {screenD && (
        <primitive
          object={cloneD}
          position={actConfig.D.position}
          rotation={actConfig.D.rotation}
          castShadow
          receiveShadow
        />
      )}
    </animated.group>
  )
}


