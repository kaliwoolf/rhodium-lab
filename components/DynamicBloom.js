import { Bloom } from '@react-three/postprocessing'

export default function DynamicBloom({ explosionFactor }) {

const boosted = explosionFactor > 0.95

  return (
    <Bloom
      intensity={boosted ? 3.5 : 0.4 + explosionFactor * 2.5}
      luminanceThreshold={boosted ? 0 : 0.25 - explosionFactor * 0.2}
    />
  )
}
