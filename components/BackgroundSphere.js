import { BackSide } from 'three'
import { GradientTexture } from '@react-three/drei'

export default function BackgroundSphere() {
  return (
    <mesh>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial side={BackSide}>
        <GradientTexture
          stops={[0, 1]}
          colors={['#0c0e13', '#12161C']} // Твоя палитра
          size={1024}
        />
      </meshBasicMaterial>
    </mesh>
  )
}
