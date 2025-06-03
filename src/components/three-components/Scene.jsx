import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import {
  Autofocus,
  Noise,
  DepthOfField,
  Bloom,
  EffectComposer,
} from "@react-three/postprocessing";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Particles from "./particles";

export default function Scene(props) {
    const {drawingTexture} = props;

  const { camera } = useThree();
  const planeRef = useRef();
  const interactivePlane = planeRef.current;

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPositions, setDrawPositions] = useState([]);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(9999, 9999);

  const screenCursor = new THREE.Vector2(9999, 9999);
  const canvasCursor = new THREE.Vector2(9999, 9999);
  const canvasCursorPrevious = new THREE.Vector2(9999, 9999);

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
      screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
      setIsDrawing(true);
    //   setDrawPositions([]);
    };

    const handlePointerUp = () => {
      setIsDrawing(false);
      props.transferCanvasCursor(drawPositions);
      console.log("绘制结束，所有点：", drawPositions);
    };

    const handlePointerMove = (event) => {
      if (isDrawing) {
        screenCursor.x = (event.clientX / sizes.width) * 2 - 1;
        screenCursor.y = -(event.clientY / sizes.height) * 2 + 1;
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [isDrawing, drawPositions]);

  useFrame(() => {
    const interactivePlane = planeRef.current;
    if (!interactivePlane) return;

    raycaster.setFromCamera(screenCursor, camera);
    const intersections = raycaster.intersectObject(interactivePlane);

    if (intersections.length && isDrawing) {
      const uv = intersections[0].uv;
      canvasCursor.x = uv.x * 640;
      canvasCursor.y = (1 - uv.y) * 810;

      // 将新的点添加到 drawPositions 数组中
      setDrawPositions((prevPositions) => {
        if (prevPositions.length > 0) {
          const lastPoint = prevPositions[prevPositions.length - 1];
          if (lastPoint.distanceTo(canvasCursor) < 0.1) {
            return prevPositions;
          }
        }
        return [...prevPositions, canvasCursor.clone()];
      });
    }
  });

  return (
    <EffectComposer>
      {/* <Autofocus bokehScale={ 2 } target={ [0, 0, 0] } /> */}
      {/* <Bloom mipmapBlur luminanceThreshold={ 0.8 } luminanceSmoothing={ 0.1 } height={300} /> */}

      {/* OrbitControls from @react-three/drei automatically hooks into the camera and canvas */}
      <OrbitControls enableRotate={false} />
      <Particles drawTexture={drawingTexture} />
      <mesh position={[0, 0, 1]} ref={planeRef} visible={false}>
        <planeGeometry args={[64, 81, 2, 2]} />
        <meshBasicMaterial color={"white"} />
      </mesh>
    </EffectComposer>
  );
}
