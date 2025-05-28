import { useState, useRef, useEffect } from "react";
import * as THREE from "three";

import {
  Autofocus,
  Noise,
  DepthOfField,
  Bloom,
  EffectComposer,
} from "@react-three/postprocessing";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Particles from "./components/three-components/particles";

import "./App.css";

function App() {
  /**
   * Adding canvas mask
   */
  // const canvasRef = useRef(null);
  // const planeRef = useRef(null);
  // const threeCanvas = useRef(null);

  // const [maskTexture, setMaskTexture] = useState(null);

  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext("2d");

  //   // 设置画布大小与 mainImage 一致
  //   canvas.width = 640;
  //   canvas.height = 807;
  //   ctx.fillStyle = "white"; // 默认背景为白色（静止区域）
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);

  //   // 绘制事件
  //   let isDrawing = false;
  //   console.log(threeCanvas)
  //   window.addEventListener("mousedown", (event) => {
  //     const mouseVector = new THREE.Vector2(
  //       (event.clientX / window.innerWidth) * 2 - 1,
  //       -(event.clientY / window.innerHeight) * 2 + 1
  //     );
  //     console.log(mouseVector);

  //     const raycaster = new THREE.Raycaster();
  //     raycaster.setFromCamera(mouseVector, camera);

  //     const intersects = raycaster.intersectObject(planeRef.current);
  //   });

  // // 创建射线投射器
  // const raycaster = new THREE.Raycaster();
  // raycaster.setFromCamera(mouseVector, camera);

  // // 获取与平面的交点
  // const intersects = raycaster.intersectObject(planeRef.current);

  // if (intersects.length > 0) {
  //   // 获取第一个交点的 UV 坐标
  //   const intersect = intersects[0];
  //   const uvPoint = intersect.uv;
  //   setUv({ u: uvPoint.x.toFixed(4), v: uvPoint.y.toFixed(4) });
  // } else {
  //   setUv(null); // 没有交点时清空 UV
  // }

  //  console.log(mouseVector)
  // }, []);

  // 更新遮罩纹理
  // const updateMaskTexture = () => {
  //   const canvas = canvasRef.current;
  //   const maskTex = new THREE.Texture(canvas);
  //   maskTex.needsUpdate = true;
  //   setMaskTexture(maskTex);
  // };

  return (
    <>
      <Canvas>
        <EffectComposer>
          <Autofocus bokehScale={ 2 } target={ [0, 0, 0] } />
          <Bloom mipmapBlur luminanceThreshold={ 0.8 } luminanceSmoothing={ 0.1 } height={300} />

          <OrbitControls enableRotate={true} />
          <Particles />
          {/* <mesh position={[0, 0, 0]} ref={planeRef}>
          <planeGeometry args={[64, 81, 2, 2]} />
          <meshBasicMaterial color={"white"} />
        </mesh> */}
        </EffectComposer>
      </Canvas>
      {/* <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }}
      /> */}
    </>
  );
}

export default App;
