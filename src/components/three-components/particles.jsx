import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

import { useEffect, useRef, useMemo } from "react";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";

import positionFragmentShader from "./shaders/gpgpu/positionFragment.glsl";
import velocityFragmentShader from "./shaders/gpgpu/velocityFragment.glsl";
import lifeFragmentShader from "./shaders/gpgpu/lifeFragment.glsl";

import vertextShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import * as THREE from "three";

export default function PosterPlane() {
  const { gl } = useThree();
  const points = useRef();
  const gpuCompute = useRef();
  const positionVariable = useRef();
  const velocityVariable = useRef();
  const lifeVariable = useRef();

  const initialPositionVariable = useRef();

  const PARTICLE_COUNT = 1280 * 1615;
  // const TEXTURE_WIDTH = Math.ceil(Math.sqrt(PARTICLE_COUNT));
  // const TEXTURE_HEIGHT = TEXTURE_WIDTH;

  const TEXTURE_WIDTH = 1281;
  const TEXTURE_HEIGHT = 1615;

  const mainImage = useTexture("./13af905c382ab964d2cf4fe98615deb2.jpg");
  const mask = useTexture("./mask.jpg");

  const newGeometry = new THREE.PlaneGeometry(64, 80, 1280, 1614);
  const newPos = newGeometry.attributes.position.array;

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
    const initialPositionTexture = gpuCompute.current.createTexture(); // 新增

    const positionData = positionTexture.image.data;
    const velocityData = velocityTexture.image.data;
    const lifeData = lifeTexture.image.data;
    const initialPositionData = initialPositionTexture.image.data; // 新增

    for (let i = 0; i < positionData.length; i++) {
      const index = i * 4;
      const posIndex = i * 3;

      // Randomize start position
      // positionData[i + 0] = (Math.random() - 0.5) * 10;
      // positionData[i + 1] = (Math.random() - 0.5) * 10;
      // positionData[i + 2] = (Math.random() - 0.5) * 10;

      positionData[index + 0] = newPos[posIndex + 0];
      positionData[index + 1] = newPos[posIndex + 1];
      positionData[index + 2] = newPos[posIndex + 2];
      positionData[index + 3] = 1.0;

      initialPositionData[index + 0] = newPos[posIndex + 0]; // 保存初始位置
      initialPositionData[index + 1] = newPos[posIndex + 1];
      initialPositionData[index + 2] = newPos[posIndex + 2];
      initialPositionData[index + 3] = 1.0;

      // Randomize start velocity
      // velocityData[i + 0] = (Math.random() - 0.5) * 0.1;
      // velocityData[i + 1] = (Math.random() - 0.5) * 0.1;
      // velocityData[i + 2] = (Math.random() - 0.5) * 0.1;

      velocityData[index + 0] = 0;
      velocityData[index + 1] = 0;
      velocityData[index + 2] = 0;
      velocityData[index + 3] = 1.0;

      // Randomize initial life
      lifeData[index + 0] = 5.0 - Math.random(i * 256) * 2.5;
      lifeData[index + 1] = 5.0 - Math.random(i * 256) * 2.5;
      lifeData[index + 2] = 0.0;
      lifeData[index + 3] = 1.0;
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
    );

    initialPositionVariable.current = gpuCompute.current.addVariable(
      // 新增
      "textureInitialPosition",
      `void main() 
        { 
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          vec4 initialPos = texture2D(textureInitialPosition, uv);

          gl_FragColor = initialPos; 
        }
        
      `, // 仅用于存储初始值，不更新
      initialPositionTexture
    );

    gpuCompute.current.setVariableDependencies(positionVariable.current, [
      positionVariable.current,
      velocityVariable.current,
      lifeVariable.current,
      initialPositionVariable.current,
    ]);

    gpuCompute.current.setVariableDependencies(initialPositionVariable.current, [
      positionVariable.current,
      initialPositionVariable.current,
    ]);

    gpuCompute.current.setVariableDependencies(velocityVariable.current, [
      positionVariable.current,
      velocityVariable.current,
      lifeVariable.current,
    ]);
    gpuCompute.current.setVariableDependencies(lifeVariable.current, [
      lifeVariable.current,
    ]);

    positionVariable.current.material.uniforms = {
      time: { value: 0.0 },
      delta: { value: 0.0 },
      maskTexture: { value: mask }
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

  // Create Particles Geo
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

      const u = (i % TEXTURE_WIDTH) / TEXTURE_WIDTH;
      const v = Math.floor(i / TEXTURE_WIDTH) / TEXTURE_HEIGHT;
      uvs[uvIndex + 0] = u;
      uvs[uvIndex + 1] = v;
    }

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    return geom;
  }, []);

  //   const geometry = useMemo(() => {
  //   const geom = new THREE.BufferGeometry();
  //   const positions = new Float32Array(PARTICLE_COUNT * 3);
  //   const uvs = new Float32Array(PARTICLE_COUNT * 2);

  //   // 使用 PlaneGeometry 的 UV 坐标
  //   const planeGeometry = new THREE.PlaneGeometry(64, 81, 639, 806);
  //   const planeUVs = planeGeometry.attributes.uv.array;

  //   for (let i = 0; i < PARTICLE_COUNT; i++) {
  //     const index = i * 3;
  //     const uvIndex = i * 2;

  //     positions[index + 0] = 0; // 位置由 GPGPU 控制
  //     positions[index + 1] = 0;
  //     positions[index + 2] = 0;

  //     // 直接使用 PlaneGeometry 的 UV
  //     uvs[uvIndex + 0] = planeUVs[uvIndex + 0]; // u
  //     uvs[uvIndex + 1] = planeUVs[uvIndex + 1]; // v
  //   }

  //   geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  //   geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  //   return geom;
  // }, [PARTICLE_COUNT]);

  // Paricles Material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        textureLife: { value: null },
        textureInitialPosition: { value: null }, // 新增
        time: { value: 0 },
        utexture: { value: mainImage },
        pointSize: { value: 2 },
      },
      vertexShader: vertextShader,
      fragmentShader: fragmentShader,
      transparent: true,
      // blending: THREE.AdditiveBlending,
    });
  }, []);

  // Upadate Frame
  useFrame(({ clock }, delta) => {
    if (gpuCompute.current && points.current) {
      // Update GPU Compute
      gpuCompute.current.compute();

      // Update Uniforms
      points.current.material.uniforms.texturePosition.value =
        gpuCompute.current.getCurrentRenderTarget(
          positionVariable.current
        ).texture;
      points.current.material.uniforms.textureVelocity.value =
        gpuCompute.current.getCurrentRenderTarget(
          velocityVariable.current
        ).texture;
      points.current.material.uniforms.textureLife.value =
        gpuCompute.current.getCurrentRenderTarget(lifeVariable.current).texture;
      points.current.material.uniforms.time.value = clock.getElapsedTime();

      points.current.material.uniforms.textureInitialPosition.value =
        gpuCompute.current.getCurrentRenderTarget(
          initialPositionVariable.current
        ).texture; // 新增

      // positionVariable.current.material.uniforms.delta.value = delta;
      // positionVariable.current.material.uniforms.delta.value = delta;
      velocityVariable.current.material.uniforms.time.value =
        clock.getElapsedTime();
      lifeVariable.current.material.uniforms.delta.value = delta;
    }
  });

  return (
    <>
      <points ref={points} geometry={geometry} material={material} />
      
    </>
  );
}
