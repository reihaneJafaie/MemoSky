import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Cloud } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'

function FloatingCloud({ position, speed, offset, scale }: {
  position: [number, number, number]
  speed: number
  offset: number
  scale: number
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed + offset) * 0.3
    }
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      <Cloud
        segments={20}
        bounds={[3, 1, 1]}
        volume={4}
        color="#ffffff"
opacity={1}
        fade={30}
      />
    </group>
  )
}

export default function Hero() {
  return (
    <section style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={4} />
        <directionalLight position={[5, 10, 5]} intensity={1} color="#ffe4c4" />
        <Suspense fallback={null}>
          <FloatingCloud position={[0, 0, 0]} speed={1} offset={0} scale={1.2} />
          <FloatingCloud position={[-5, 1, -3]} speed={0.8} offset={1} scale={0.8} />
          <FloatingCloud position={[5, -1, -4]} speed={1.2} offset={2} scale={1} />
          <FloatingCloud position={[-4, -2, -5]} speed={0.6} offset={3} scale={0.7} />
          <FloatingCloud position={[3, 2, -6]} speed={0.9} offset={4} scale={0.9} />

           <FloatingCloud position={ [-8, 7, 9]} speed={1} offset={0} scale={1.2} />
          <FloatingCloud position={[10, 5, 1] } speed={0.8} offset={1} scale={0.8} />
          <FloatingCloud position={ [-14, 3, -2]} speed={1.2} offset={2} scale={1} />
          <FloatingCloud position={[14, 2, -3]} speed={0.6} offset={3} scale={0.7} />
          <FloatingCloud position={ [-6, -4, -5]} speed={0.9} offset={4} scale={0.9} />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </section>
  )
}