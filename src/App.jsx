import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import Particles from './components/three-components/particles'

import './App.css'

function App() {

  return (
    <>
      <Canvas>
        <OrbitControls />
        <Particles />
        <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
      </Canvas>
    </>
  )
}

export default App
