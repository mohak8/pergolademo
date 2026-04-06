import React, { useMemo, useEffect, useState, useRef } from 'react'
import { useGLTF, Text } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store'
import { useSpring, animated } from '@react-spring/three'

export default function Pergola() {
  const { activeSide, screenA, screenB, screenC, screenD, setActiveSide } = useStore()

  // Load models directly from the public folder
  const { scene: frameRaw } = useGLTF('/pergola/3x3/3x3.glb')
  const { scene: screenRaw } = useGLTF('/pergola/3x3/3x3_Screen.glb')

  // Ensure graceful handle of cloning the geometry with shadows
  const applyShadows = (clone) => {
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
    return clone
  }

  const frame = useMemo(() => applyShadows(frameRaw.clone()), [frameRaw])
  const cloneA = useMemo(() => applyShadows(screenRaw.clone()), [screenRaw])
  const cloneB = useMemo(() => applyShadows(screenRaw.clone()), [screenRaw])
  const cloneC = useMemo(() => applyShadows(screenRaw.clone()), [screenRaw])
  const cloneD = useMemo(() => applyShadows(screenRaw.clone()), [screenRaw])

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
      {/* 3D Floor Markers (Clickable) */}
      <Text
        position={[0, 0.01, 2.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color={activeSide === 'A' ? '#000000' : '#cccccc'}
        onClick={() => setActiveSide('A')}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        A
      </Text>
      <Text
        position={[2.5, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={0.5}
        color={activeSide === 'B' ? '#000000' : '#cccccc'}
        onClick={() => setActiveSide('B')}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        B
      </Text>
      <Text
        position={[0, 0.01, -2.5]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.5}
        color={activeSide === 'C' ? '#000000' : '#cccccc'}
        onClick={() => setActiveSide('C')}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        C
      </Text>
      <Text
        position={[-2.5, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.5}
        color={activeSide === 'D' ? '#000000' : '#cccccc'}
        onClick={() => setActiveSide('D')}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        D
      </Text>

      {/* Main Framework */}
      <primitive
        object={frame}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      />

      {/* Side A: Front Screen */}
      {screenA && (
        <primitive
          object={cloneA}
          position={[0, 1.65, 1.34]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        />
      )}

      {/* Side B: Right Screen */}
      {screenB && (
        <primitive
          object={cloneB}
          position={[1.42, 1.65, -0.08]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
          receiveShadow
        />
      )}

      {/* Side C: Back Screen */}
      {screenC && (
        <primitive
          object={cloneC}
          position={[0, 1.65, -1.50]}
          rotation={[0, Math.PI, 0]}
          castShadow
          receiveShadow
        />
      )}

      {/* Side D: Left Screen */}
      {screenD && (
        <primitive
          object={cloneD}
          position={[-1.42, 1.65, -0.08]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
          receiveShadow
        />
      )}
    </animated.group>
  )
}

// Preload models for instantaneous rendering
useGLTF.preload('/pergola/3x3/3x3.glb')
useGLTF.preload('/pergola/3x3/3x3_Screen.glb')
