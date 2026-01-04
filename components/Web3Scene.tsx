"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"
import { useRef, useMemo } from "react"

function InteractiveGrid() {
  const ref = useRef<THREE.Points>(null)
  const { mouse } = useThree()

  const points = useMemo(() => {
    const pts = []
    const size = 80
    const step = 2

    for (let x = -size; x < size; x += step) {
      for (let z = -size; z < size; z += step) {
        pts.push(x, 0, z)
      }
    }
    return new Float32Array(pts)
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return

    const t = clock.getElapsedTime()
    const positions = ref.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 2]

      positions[i + 1] =
        Math.sin(x * 0.15 + t) * 0.6 +
        Math.cos(z * 0.15 + t) * 0.6
    }

    ref.current.rotation.y = mouse.x * 0.3
    ref.current.rotation.x = -Math.PI / 3 + mouse.y * 0.2

    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <Points ref={ref} positions={points}>
      <PointMaterial
        transparent
        color="#60a5fa"
        size={0.12}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

export default function Web3Scene() {
  return (
    <Canvas
      camera={{ position: [0, 18, 28], fov: 55 }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.6} />
      <InteractiveGrid />
    </Canvas>
  )
}
