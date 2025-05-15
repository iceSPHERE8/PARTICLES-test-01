import { useFrame, useThree } from "@react-three/fiber";

import { useEffect, useRef, useMemo } from "react";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";

import positionFragmentShader from "./shaders/gpgpu/positionFragment.glsl";
import velocityFragmentShader from "./shaders/gpgpu/velocityFragment.glsl";
import lifeFragmentShader from "./shaders/gpgpu/lifeFragment.glsl";
import * as THREE from 'three';
import { mapLinear } from "three/src/math/MathUtils.js";

export default function PosterPlane() {
  const { gl } = useThree();
  const points = useRef();
  const gpuCompute = useRef();
  const positionVariable = useRef();
  const velocityVariable = useRef();
  const lifeVariable = useRef();

  const PARTICLE_COUNT = 100000;
  const TEXTURE_WIDTH = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  const TEXTURE_HEIGHT = TEXTURE_WIDTH;

  const age = [];

  useEffect(() => {
    gpuCompute.current = new GPUComputationRenderer(
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
      gl
    );

    // Initialize positions & velocity texture
    const positionTexture = gpuCompute.current.createTexture();
    const velocityTexture = gpuCompute.current.createTexture();
    const lifeTexture = gpuCompute.current.createTexture();

    const positionData = positionTexture.image.data;
    const velocityData = velocityTexture.image.data;
    const lifeData = lifeTexture.image.data;

    for (let i = 0; i < positionData.length; i += 4) {
      // Randomize start position
      positionData[i + 0] = (Math.random() - 0.5) * 0;
      positionData[i + 1] = (Math.random() - 0.5) * 10;
      positionData[i + 2] = (Math.random() - 0.5) * 10;

      // positionData[i + 0] = 0;
      // positionData[i + 1] = 0;
      // positionData[i + 2] = 0;
      positionData[i + 3] = 1.0;

      // Randomize start velocity
      velocityData[i + 0] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 1] = (Math.random() - 0.5) * 0.1;
      velocityData[i + 2] = (Math.random() - 0.5) * 0.1;

      // velocityData[i + 0] = 100.0;
      // velocityData[i + 1] = 0;
      // velocityData[i + 2] = 0;

      velocityData[i + 3] = 1.0;

      // lifeData[i + 0] = 2.0 - (1 * Math.random() * 0.5);
      lifeData[i + 0] = 2.0 - Math.random() * 0.5;
      lifeData[i + 1] = 2.0 - Math.random() * 0.5;
      lifeData[i + 2] = 0.0;
      lifeData[i + 3] = 1.0;
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

    lifeVariable.current = gpuCompute.current.addVariable(
      "textureLife",
      lifeFragmentShader,
      lifeTexture
    )

    gpuCompute.current.setVariableDependencies(positionVariable.current, [
      positionVariable.current,
      velocityVariable.current,
      lifeVariable.current
    ]);
    gpuCompute.current.setVariableDependencies(velocityVariable.current, [
      positionVariable.current,
      velocityVariable.current,
      lifeVariable.current
    ]);
    gpuCompute.current.setVariableDependencies(lifeVariable.current, [
      lifeVariable.current
    ])

    positionVariable.current.material.uniforms = {
      time: { value: 0.0 },
      delta: { value: 0.0 },
    };
    velocityVariable.current.material.uniforms = {
      time: { value: 0.0 },
      delta: { value: 0.0 },
    };
    lifeVariable.current.material.uniforms = {
      delta: { value: 0.0 },
    };

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
              textureVelocity: { value: null },
              textureLife: { value: null },
              time: { value: 0 },
              pointSize: { value: 2 },
            },
            vertexShader: `
              uniform sampler2D texturePosition;
              uniform sampler2D textureLife;
              uniform float pointSize;

              varying vec2 vUv;
              varying float vSize;

              float map(float value, float inMin, float inMax, float outMin, float outMax) {
                return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
              }
                
              void main() {
                vec4 pos = texture2D(texturePosition, uv);
                vec4 life = texture2D(textureLife, uv);

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);

                float size = pointSize * 2.0 * life.x;
                gl_PointSize = size;
                
                vSize = size;
                vUv = uv;
              }
            `,
            fragmentShader: `
              uniform sampler2D textureVelocity;
              uniform sampler2D textureLife;

              varying vec2 vUv;
              varying float vSize;

              float map(float value, float inMin, float inMax, float outMin, float outMax) {
                return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
              }

              void main() {
                vec4 life = texture2D(textureLife, vUv);
                vec4 vel = texture2D(textureVelocity, vUv);

                // life.x = normalize(life.x);
                life.x = map(life.x, 0.0, 2.0, 1.0, 0.0);
                if(vSize > 6.0 || vSize < 0.01){
                  discard;
                }

                gl_FragColor = vec4(1.0 - vel.x,1.0 - vel.y, 1.0 - vel.z, 0.8);
              }
            `,
            transparent: true,
          });
        }, []);
  
        // 每帧更新
        useFrame(({ clock }, delta) => {
          if (gpuCompute.current && points.current) {
            // 更新 GPGPU 计算
            gpuCompute.current.compute();            
  
            // 更新材质的 uniforms
            points.current.material.uniforms.texturePosition.value = gpuCompute.current.getCurrentRenderTarget(positionVariable.current).texture;
            points.current.material.uniforms.textureVelocity.value = gpuCompute.current.getCurrentRenderTarget(velocityVariable.current).texture;
            points.current.material.uniforms.textureLife.value = gpuCompute.current.getCurrentRenderTarget(lifeVariable.current).texture;
            points.current.material.uniforms.time.value = clock.getElapsedTime();

            // positionVariable.current.material.uniforms.delta.value = delta;
            // positionVariable.current.material.uniforms.delta.value = delta;
            velocityVariable.current.material.uniforms.time.value = clock.getElapsedTime();;
            lifeVariable.current.material.uniforms.delta.value = delta;
            
          }
        });

  return (
    <>
      <points ref={points} geometry={geometry} material={material} />
    </>
  );
}
