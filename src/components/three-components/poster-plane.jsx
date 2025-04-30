import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";

import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { useEffect, useRef, useMemo } from "react";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";

import positionFragmentShader from "./shaders/gpgpu/positionFragment.glsl";
import velocityFragmentShader from "./shaders/gpgpu/positionFragment.glsl";
import * as THREE from 'three';

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
    gpuCompute.current = new GPUComputationRenderer(
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
      gl
    );

    // Initialize positions & velocity texture
    const positionTexture = gpuCompute.current.createTexture();
    const velocityTexture = gpuCompute.current.createTexture();

    const positionData = positionTexture.image.data;
    const velocityData = velocityTexture.image.data;

    for (let i = 0; i < positionData.length; i += 4) {
      // Randomize start position
      positionData[i + 0] = (Math.random() - 0.5) * 10;
      positionData[i + 1] = (Math.random() - 0.5) * 10;
      positionData[i + 2] = (Math.random() - 0.5) * 10;
      positionData[i + 3] = 1.0;

      // Randomize start velocity
      velocityData[i + 0] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 1] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 2] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 3] = 1.0;
    }

    positionVariable.current = gpuCompute.current.addVariable(
      "texturePosition",
      positionFragmentShader,
      positionTexture
    );

    velocityVariable.current = gpuCompute.current.addVariable(
      "textureVelocity",
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
    };
  }, [gl]);

        // 创建粒子几何体
        const geometry = useMemo(() => {
          const geom = new THREE.BufferGeometry();
          const positions = new Float32Array(PARTICLE_COUNT * 3);
          const uvs = new Float32Array(PARTICLE_COUNT * 2);
  
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const index = i * 3;
            const uvIndex = i * 2;
            positions[index + 0] = 0;
            positions[index + 1] = 0;
            positions[index + 2] = 0;
  
            //ස工程
            const u = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
            const v = Math.floor(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
            uvs[uvIndex + 0] = u;
            uvs[uvIndex + 1] = v;
          }
  
          geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
          return geom;
        }, []);
  
        // 粒子材质
        const material = useMemo(() => {
          return new THREE.ShaderMaterial({
            uniforms: {
              texturePosition: { value: null },
              time: { value: 0 },
              pointSize: { value: 2 },
            },
            vertexShader: `
              uniform sampler2D texturePosition;
              uniform float pointSize;
              void main() {
                vec4 pos = texture2D(texturePosition, uv);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
                gl_PointSize = pointSize;
              }
            `,
            fragmentShader: `
              void main() {
                gl_FragColor = vec4(1.0, 0.5, 0.5, 0.8);
              }
            `,
            transparent: true,
          });
        }, []);
  
        // 每帧更新
        useFrame(({ clock }) => {
          if (gpuCompute.current && points.current) {
            // 更新 GPGPU 计算
            gpuCompute.current.compute();
  
            // 更新材质的 uniforms
            points.current.material.uniforms.texturePosition.value = gpuCompute.current.getCurrentRenderTarget(positionVariable.current).texture;
            points.current.material.uniforms.time.value = clock.getElapsedTime();
          }
        });

  return (
    <>
      <points ref={points} geometry={geometry} material={material} />
    </>
  );
}
