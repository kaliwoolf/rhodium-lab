import { Bloom } from '@react-three/postprocessing'

export default function DynamicBloom({ scrollRef, explosionFactor }) {
  const scroll = scrollRef.current || 0
  const explosionFactor = scroll > 1.5 ? Math.min((scroll - 1.5) * 2, 1.0) : 0

  return (
    <Bloom
      intensity={0.4 + explosionFactor * 2.5}
      luminanceThreshold={0.25 - explosionFactor * 0.2}
      luminanceSmoothing={0.03}
    />
  )
}
