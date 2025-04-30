import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import PosterPlane from './components/three-components/poster-plane'

import './App.css'

function App() {

  return (
    <>
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 1500],
          zoom: 1,
          near: 0.1,
          far: 10000,
        }}
      >
        <OrbitControls enableRotate={false} enablePan={false} />
        <PosterPlane />
      </Canvas>
    </>
  )
}

export default App
