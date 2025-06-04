import { useFrame, useThree } from "@react-three/fiber";

import { useEffect, useRef, useMemo, useState } from "react";
import { GPUComputationRenderer } from "three/examples/jsm/Addons.js";

import positionFragmentShader from "./shaders/gpgpu/positionFragment.glsl";
import velocityFragmentShader from "./shaders/gpgpu/velocityFragment.glsl";
import lifeFragmentShader from "./shaders/gpgpu/lifeFragment.glsl";

import vertextShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import * as THREE from "three";

export default function Particles(props) {
  // const {drawTexture} = props;

  const { gl } = useThree();
  const points = useRef();
  const gpuCompute = useRef();
  const positionVariable = useRef();
  const velocityVariable = useRef();
  const lifeVariable = useRef();

  const initialPositionVariable = useRef();

  const { particlesTexture, particlesMask } = props;
  const [mainTexture, setMainTexture] = useState(null);
  const [maskTexture, setMaskTexture] = useState(null);

  const DEFAULT_WIDTH = 1280;
  const DEFAULT_HEIGHT = 1615;
  const [textureSize, setTextureSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  // Effect to load main texture
  useEffect(() => {
    let textureLoader = new THREE.TextureLoader();
    let currentLoadedTexture = null;

    // if (particlesTexture && particlesTexture.preview) {
    //   // Load user-provided texture
    //   currentLoadedTexture = textureLoader.load(
    //     particlesTexture.preview,
    //     (tex) => {
    //       setMainTexture(tex);
    //       setTetxtureSize[(tex.image.width, tex.image.height)];
    //     }
    //   );
    // } else {
    //   // Load default texture if no user texture is provided
    //   currentLoadedTexture = textureLoader.load(
    //     "./13af905c382ab964d2cf4fe98615deb2.jpg",
    //     (tex) => {
    //       setMainTexture(tex);
    //       setTetxtureSize[(tex.image.width, tex.image.height)];
    //     }
    //   );
    // }

    const onLoadCallback = (tex) => {
      setMainTexture(tex);
      if (tex.image) {
        setTextureSize({
          width: tex.image.width * 2,
          height: tex.image.height * 2 + 1,
        });
      }
    };

    if (particlesTexture && particlesTexture.preview) {
      currentLoadedTexture = textureLoader.load(
        particlesTexture.preview,
        onLoadCallback
      );
    } else {
      currentLoadedTexture = textureLoader.load(
        "./13af905c382ab964d2cf4fe98615deb2.jpg",
        onLoadCallback
      );
      setTextureSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    }

    // Cleanup function: dispose of the texture when the effect re-runs or component unmounts
    return () => {
      if (currentLoadedTexture) {
        currentLoadedTexture.dispose();
      }

      setTextureSize({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
    };
  }, [particlesTexture]);

  // Effect to load mask texture
  useEffect(() => {
    let textureLoader = new THREE.TextureLoader();
    let currentLoadedMask = null;

    if (particlesMask && particlesMask.preview) {
      // Load user-provided mask
      currentLoadedMask = textureLoader.load(particlesMask.preview, (tex) => {
        setMaskTexture(tex);
      });
    } else {
      // Load default mask if no user mask is provided
      currentLoadedMask = textureLoader.load("./mask.jpg", (tex) => {
        setMaskTexture(tex);
      });
    }

    // Cleanup function: dispose of the mask texture
    return () => {
      if (currentLoadedMask) {
        currentLoadedMask.dispose();
      }
    };
  }, [particlesMask]);

  const PARTICLE_COUNT = textureSize.width * textureSize.height;

  const TEXTURE_WIDTH = textureSize.width + 1;
  const TEXTURE_HEIGHT = textureSize.height + 1;

  const newGeometry = useMemo(() => {
    if (textureSize.width === 0 || textureSize.height === 0) {
      return null;
    }
    return new THREE.PlaneGeometry(
      textureSize.width / 2 / 10,
      textureSize.height / 2 / 10,
      textureSize.width,
      textureSize.height
    );
  }, [textureSize]);

  const newPos = newGeometry.attributes.position.array;

  // useEffect(() => {
  //   gpuCompute.current = new GPUComputationRenderer(
  //     TEXTURE_WIDTH,
  //     TEXTURE_HEIGHT,
  //     gl
  //   );

  useEffect(() => {
    if (!mainTexture || !maskTexture) {
      return;
    }

    if (gpuCompute.current) {
      gpuCompute.current.dispose();
    }

    gpuCompute.current = new GPUComputationRenderer(
      TEXTURE_WIDTH,
      TEXTURE_HEIGHT,
      gl
    );

    // Initialize positions & velocity texture
    const positionTexture = gpuCompute.current.createTexture();
    const velocityTexture = gpuCompute.current.createTexture();
    const lifeTexture = gpuCompute.current.createTexture();
    const initialPositionTexture = gpuCompute.current.createTexture();

    const positionData = positionTexture.image.data;
    const velocityData = velocityTexture.image.data;
    const lifeData = lifeTexture.image.data;
    const initialPositionData = initialPositionTexture.image.data;

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

      initialPositionData[index + 0] = newPos[posIndex + 0];
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

    gpuCompute.current.setVariableDependencies(
      initialPositionVariable.current,
      [positionVariable.current, initialPositionVariable.current]
    );

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
      maskTexture: { value: maskTexture },
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
  }, [gl, mainTexture, maskTexture]);

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
  }, [PARTICLE_COUNT, TEXTURE_WIDTH, TEXTURE_HEIGHT]);

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

  // Particles Material
  const material = useMemo(() => {
    if (!mainTexture || !maskTexture) {
      return null;
    }

    return new THREE.ShaderMaterial({
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        textureLife: { value: null },
        textureInitialPosition: { value: null },
        time: { value: 0 },
        utexture: { value: mainTexture },
        pointSize: { value: 2 },
        maskTexture: { value: maskTexture },
      },
      vertexShader: vertextShader,
      fragmentShader: fragmentShader,
      transparent: true,
      // blending: THREE.AdditiveBlending,
    });
  }, [mainTexture, maskTexture]);

  // Update Frame
  useFrame(({ clock }, delta) => {
    if (gpuCompute.current && points.current && material) {
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
        ).texture;

      velocityVariable.current.material.uniforms.time.value =
        clock.getElapsedTime();
      lifeVariable.current.material.uniforms.delta.value = delta;
    }
  });

  if (!material) {
    return null;
  }

  return (
    <>
      <points ref={points} geometry={geometry} material={material} />
    </>
  );
}
