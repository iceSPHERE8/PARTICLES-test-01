import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import PosterPlane from './components/three-components/poster-plane'

import './App.css'

function App() {

  return (
    <>
      <Canvas>
        <OrbitControls />
        <PosterPlane />
        <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
      </Canvas>
    </>
  )
}

export default App
