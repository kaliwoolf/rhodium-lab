import { Bloom } from '@react-three/postprocessing'

export default function DynamicBloom({ explosionFactor }) {
  return (
    <Bloom
      intensity={0.4 + explosionFactor * 2.5}
      luminanceThreshold={0.25 - explosionFactor * 0.2}
      luminanceSmoothing={0.03}
    />
  )
}
