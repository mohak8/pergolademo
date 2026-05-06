import React, { useMemo, useEffect, useState, useRef } from 'react'
import { useGLTF, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store'
import { useSpring, animated } from '@react-spring/three'

export default function Pergola() {
  const {
    activeSide, screenB, screenD, setActiveSide, currentSize, currentModel,
    screenA_Left, screenA_Right, screenC_Left, screenC_Right, showDimensions,
    frameColor
  } = useStore()

  const materialCache = useRef(new Map())
  const isMounted = useRef(true)
  const isReady = useRef(false)
  const pendingColorRef = useRef(null)
  const pergolaRef = useRef()

  useEffect(() => {
    isMounted.current = true
    isReady.current = false
    return () => {
      isMounted.current = false
      isReady.current = false
      materialCache.current.clear()
    }
  }, [])

  useEffect(() => {
    // Force clear the cache when the core model size changes to prevent stale data
    materialCache.current.clear()
    isReady.current = false
  }, [currentSize, currentModel])

  useEffect(() => {
    if (!isMounted.current || !pergolaRef.current) return
    
    console.log("🎨 3D Model applying color:", frameColor);

    pergolaRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // Normalize materials into an array so we handle both single and multi-material meshes
        const materials = Array.isArray(child.material) ? child.material : [child.material]

        materials.forEach((mat) => {
          // 1. Ensure this specific material is cached in its original state
          if (!materialCache.current.has(mat.uuid)) {
            materialCache.current.set(mat.uuid, {
              color: mat.color.clone(),
              map: mat.map,
              transparent: mat.transparent,
              opacity: mat.opacity
            })
          }

          // 2. Identification logic: Fabric (Screens) vs Metal (Structure)
          const matName = mat.name.toLowerCase()
          const meshName = child.name.toLowerCase()

          // FABRIC: Primary indicator is MeshPhysicalMaterial. Fallback to names if not a housing.
          const isMetalKeywords = matName.includes('case') || matName.includes('housing') || matName.includes('frame') || meshName.includes('case') || meshName.includes('housing')
          const isFabric = mat.isMeshPhysicalMaterial === true || ((matName.includes('screen') || matName.includes('fabric') || meshName.includes('fabric')) && !isMetalKeywords)

          // 3. Apply the current frameColor logic
          if (isFabric) {
            const orig = materialCache.current.get(mat.uuid)
            if (frameColor === '#8B5A2B') {
              // WOOD MODE: Complete restoration
              if (orig) {
                mat.color.copy(orig.color)
                mat.map = orig.map
                mat.transparent = orig.transparent
                mat.opacity = orig.opacity
              }
            } else {
              // PAINT MODE: Tint color but preserve texture and transparency
              mat.color.set(frameColor)
              if (orig) {
                mat.map = orig.map
                mat.transparent = true
                mat.opacity = orig.opacity
              }
            }
          } else {
            // METAL/CHASSIS: Solid color application
            mat.color.set(frameColor)
            mat.map = null
            mat.transparent = false

            if (mat.vertexColors !== undefined) mat.vertexColors = false;
            if (mat.emissive) mat.emissive.set(0x000000);
          }

          if (isMounted.current) mat.needsUpdate = true
        })
      }
    })

    isReady.current = true
  }, [frameColor, currentSize, currentModel, screenA_Left, screenA_Right, screenB, screenC_Left, screenC_Right, screenD])

  // Use relative paths for assets to work across any FTP folder structure
  const rootPath = 'pergola'

  // Only dispatch the network load for the specific size requested!
  const { scene: frameRaw } = useGLTF(`${rootPath}/${currentSize}/${currentSize}.glb`)

  // Conditionally load the Long-Side Screen (Sides A & C)
  // For 6x3, we recycle the 3x3 screen twice per side
  const screensRawPath = currentSize === '6x3'
    ? `${rootPath}/3x3/3x3_Screen.glb`
    : `${rootPath}/${currentSize}/${currentSize}_Screen.glb`
  const { scene: longScreenRaw } = useGLTF(screensRawPath)

  // The Short-Side Screen (Sides B & D) safely recycles the 3-meter file always.
  const { scene: shortScreenRaw } = useGLTF(`${rootPath}/3x3/3x3_Screen.glb`)

  // Ensure graceful handle of cloning the geometry with shadows
  const safeClone = (rawGeometry) => {
    if (!rawGeometry) return new THREE.Group()

    const clone = rawGeometry.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map(m => m.clone())
          } else {
            child.material = child.material.clone()
          }
        }
      }
    })
    return clone
  }

  // Switch Master Frame scientifically safely
  const frame = useMemo(() => safeClone(frameRaw), [frameRaw, currentSize])

  // Map respective screens (Double clones for A and C to avoid THREE UUID conflicts in 6x3)
  const cloneA_Left = useMemo(() => safeClone(longScreenRaw), [longScreenRaw, currentSize])
  const cloneA_Right = useMemo(() => safeClone(longScreenRaw), [longScreenRaw, currentSize])
  const cloneB = useMemo(() => safeClone(shortScreenRaw), [shortScreenRaw, currentSize])
  const cloneC_Left = useMemo(() => safeClone(longScreenRaw), [longScreenRaw, currentSize])
  const cloneC_Right = useMemo(() => safeClone(longScreenRaw), [longScreenRaw, currentSize])
  const cloneD = useMemo(() => safeClone(shortScreenRaw), [shortScreenRaw, currentSize])

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
  const offset = 0.15 // Clean outward offset from geometry

  // 1. The Measurement Engine
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, depth: 0 })

  useEffect(() => {
    if (pergolaRef.current) {
      // Small timeout to allow R3F meshes to fully instantiate in the DOM tree before computing
      setTimeout(() => {
        if (!pergolaRef.current) return

        // Force the 3D engine to calculate exact world positions RIGHT NOW
        pergolaRef.current.updateWorldMatrix(true, true);

        const box = new THREE.Box3();
        box.makeEmpty(); // Ensure it starts empty

        pergolaRef.current.traverse((child) => {
          // Only measure visible, physical meshes. 
          if (child.isMesh && child.visible) {
            const name = child.name.toLowerCase();

            // Aggressive Filtering: Ignore anything that sticks out
            const isAccessory = name.includes('crank') || name.includes('handle') || name.includes('screen') || name.includes('blind') || name.includes('object001') || name.includes('roof');
            const isHelper = name.includes('line') || name.includes('measurement');

            // Handle sloppy CAD exports that include other sizes in the same file
            let isWrongSizeLayer = false;
            if (currentSize === '3x3') isWrongSizeLayer = name.includes('4x3') || name.includes('6x3');
            if (currentSize === '4x3') isWrongSizeLayer = name.includes('3x3') || name.includes('6x3');
            if (currentSize === '6x3') isWrongSizeLayer = name.includes('3x3') || name.includes('4x3');

            if (!isAccessory && !isHelper && !isWrongSizeLayer) {
              // Calculate the precise bounding box of the geometry itself
              if (!child.geometry.boundingBox) {
                child.geometry.computeBoundingBox();
              }

              const childBox = child.geometry.boundingBox.clone();
              // Apply the exact world position/scale to that geometry
              childBox.applyMatrix4(child.matrixWorld);

              // Expand our main box to include this piece
              box.union(childBox);
            }
          }
        });

        const size = box.getSize(new THREE.Vector3());
        // Add a safety check to ensure we found valid geometry
        if (size.x > 0) {
          setDimensions({ width: size.x, height: size.y, depth: size.z });
        }
      }, 50)
    }
  }, [frame, currentSize, currentModel, screenB, screenD, screenA_Left, screenA_Right, screenC_Left, screenC_Right])

  return (
    <animated.group position={[0, -1, 0]} rotation-y={rotationY}>
      {/* Premium HTML Markers (Always face camera, legible from any angle) */}
      <Html position={[0, 0, 2.5]} center>
        <div
          onClick={() => setActiveSide('A')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${activeSide === 'A' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
            }`}
        >
          A
        </div>
      </Html>

      <Html position={[currentSize === '6x3' ? 3.5 : (currentSize === '4x3' ? 2.5 : 2.0), 0, 0]} center>
        <div
          onClick={() => setActiveSide('B')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${activeSide === 'B' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
            }`}
        >
          B
        </div>
      </Html>

      <Html position={[0, 0, -2.5]} center>
        <div
          onClick={() => setActiveSide('C')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${activeSide === 'C' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
            }`}
        >
          C
        </div>
      </Html>

      <Html position={[currentSize === '6x3' ? -3.5 : (currentSize === '4x3' ? -2.5 : -2.0), 0, 0]} center>
        <div
          onClick={() => setActiveSide('D')}
          className={`cursor-pointer w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shadow-md transition-all ${activeSide === 'D' ? 'bg-black text-white scale-125' : 'bg-white text-black border border-gray-200 hover:scale-110'
            }`}
        >
          D
        </div>
      </Html>

      {/* Main Model wrapper for isolating bounding box computation completely */}
      <group ref={pergolaRef} name="pergolaGroup">
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
      </group>

      {/* Dynamic 3D Measurements Overlay */}
      {showDimensions && dimensions.width > 0 && (
        <group>
          {/* 1. The Width Line (Front Floor) */}
          <Line points={[[-dimensions.width / 2, 0.05, (dimensions.depth / 2) + offset], [dimensions.width / 2, 0.05, (dimensions.depth / 2) + offset]]} color="black" lineWidth={1.5} />
          <Html position={[0, 0.05, (dimensions.depth / 2) + offset]} center zIndexRange={[100, 0]}>
            <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap tracking-wide pointer-events-none shadow-md">
              {dimensions.width.toFixed(2)} m
            </div>
          </Html>

          {/* 2. The Depth Line (Left Floor) */}
          <Line points={[[(-dimensions.width / 2) - offset, 0.05, -dimensions.depth / 2], [(-dimensions.width / 2) - offset, 0.05, dimensions.depth / 2]]} color="black" lineWidth={1.5} />
          <Html position={[(-dimensions.width / 2) - offset, 0.05, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap tracking-wide pointer-events-none shadow-md">
              {dimensions.depth.toFixed(2)} m
            </div>
          </Html>

          {/* 3. The Height Line (Back Right Leg) */}
          <Line points={[[(dimensions.width / 2) + offset, 0, -dimensions.depth / 2], [(dimensions.width / 2) + offset, dimensions.height, -dimensions.depth / 2]]} color="black" lineWidth={1.5} />
          <Html position={[(dimensions.width / 2) + offset, dimensions.height / 2, -dimensions.depth / 2]} center zIndexRange={[100, 0]}>
            <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap tracking-wide pointer-events-none shadow-md">
              {dimensions.height.toFixed(2)} m
            </div>
          </Html>
        </group>
      )}

    </animated.group>
  )
}

useGLTF.preload('pergola/3x3/3x3.glb')
useGLTF.preload('pergola/3x3/3x3_Screen.glb')
useGLTF.preload('pergola/4x3/4x3.glb')
useGLTF.preload('pergola/4x3/4x3_Screen.glb')
useGLTF.preload('pergola/6x3/6x3.glb')
