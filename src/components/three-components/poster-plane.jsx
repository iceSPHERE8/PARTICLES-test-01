import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { useEffect, useRef } from "react";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";

import positionFragmentShader from './shaders/gpgpu/positionFragment.glsl'
import velocityFragmentShader from './shaders/gpgpu/positionFragment.glsl'

export default function PosterPlane() {
  const { gl } = useThree();
  const points = useRef();
  const gpuCompute = useRef();
  const positionVariable = useRef();
  const velocityVariable = useRef();

  const PARTICLE_COUNT = 10000;
  const TEXTURE_WIDTH = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  const TEXTURE_HEIGHT = TEXTURE_WIDTH;

  useEffect(() => {
    gpuCompute.current = new GPUComputationRenderer(TEXTURE_WIDTH, TEXTURE_HEIGHT, gl);
    
    // Initialize positions & velocity texture
    const positionTexture = gpuCompute.current.createTexture();
    const velocityTexture = gpuCompute.current.createTexture();

    const positionData = positionTexture.image.data;
    const velocityData = velocityTexture.image.data;

    for(let i = 0; i < positionData.length; i += 4){
      // Randomize start position
      positionData[i + 0] = (Math.random() - 0.5) * 10;
      positionData[i + 1] = (Math.random() - 0.5) * 10;
      positionData[i + 2] = (Math.random() - 0.5) * 10;
      positionData[i + 3] = 1.0

      // Randomize start velocity
      velocityData[i + 0] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 1] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 2] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 3] = 1.0;
    }

    positionVariable.current = gpuCompute.current.addVariable(
      'texturePosition',
      positionFragmentShader,
      positionTexture
    );

    velocityVariable.current = gpuCompute.current.addVariable(
      'textureVelocity',
      velocityFragmentShader,
      velocityTexture
    );
    
    gpuCompute.current.setVariableDependencies(positionVariable.current, [
      positionVariable.current,
      velocityVariable.current,
    ]);
    gpuCompute.current.setVariableDependencies(velocityVariable.current, [
      positionVariable.current,
      velocityVariable.current,
    ]);

    gpuCompute.current.init();

    return () => {
      gpuCompute.current.dispose();
    }
  }, [gl])

  return (
    <></>
  );
}
