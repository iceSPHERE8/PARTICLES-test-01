import { useEffect, useState } from "react";
// import * as THREE from "three";

import { Canvas } from "@react-three/fiber";
import "./App.css";

import Scene from "./components/three-components/Scene";

import DropzoneComponent from "./components/DropzoneComponent";

function App() {
  const [uploadedTexture, setUploadTexture] = useState(null);
  const [uploadedMask, setUploadMask] = useState(null);

  const promoteTexture = (data) => {
    setUploadTexture(data);
  }

  const promoteMask = (data) => {
    setUploadMask(data);
  }

  useEffect(() => {
    console.log(uploadedTexture, uploadedMask)
  }, [uploadedTexture, uploadedMask])

  // const canvasRef = useRef();

  // const [canvasCursor, setCanvasCursor] = useState(null);
  // const [drawingTexture, setDrawingTexture] = useState(null);

  // const transferCanvasCursor = (data) => {
  //   setCanvasCursor(data);
  // };

  // const glowImage = new Image();
  // glowImage.src = "./glow.png";

  // useEffect(() => {
  //   if (canvasRef.current) {
  //      canvasRef.current.width = 640;
  //     canvasRef.current.height = 810;

  //     const width = parseInt(canvasRef.current.width);
  //     const Height = parseInt(canvasRef.current.height);

  //     const ctx = canvasRef.current.getContext("2d");
  //     ctx.fillStyle = "white";
  //     ctx.fillRect(0, 0, width, Height);

  //     if (canvasCursor) {
  //       for (const pos of canvasCursor) {
  //         ctx.fillStyle = "black";
  //         const glowSize = 100;
  //         ctx.globalCompositeOperation = 'multiply'
  //         // ctx.globalAlpha = alpha
  //         ctx.drawImage(
  //           glowImage,
  //           pos.x,
  //           pos.y,
  //           glowSize,
  //           glowSize
  //         );
  //       }
  //     }
  //     if (!drawingTexture) {
  //       const texture = new THREE.CanvasTexture(canvasRef.current);
  //       setDrawingTexture(texture);
  //     } else {
  //       drawingTexture.needsUpdate = true;
  //     }
  //   }
  // }, [canvasCursor, drawingTexture]);

  return (
    <>
      <Canvas 
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 75] }}
      >
        <Scene
        // transferCanvasCursor={transferCanvasCursor}
        // drawingTexture={drawingTexture}
        particlesTexture={uploadedTexture}
        particlesMask={uploadedMask}
        />
      </Canvas>
      {/* <canvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          width: 640,
          height: 810,
          display: 'none'
        }}
        ref={canvasRef}
      /> */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          display: "flex",
          justifyContent: "center",
          margin: "10px",
          width: "100%"
        }}
      >
        <DropzoneComponent promoteTexture={promoteTexture} displayText = {'图片'} />
        <DropzoneComponent promoteMask={promoteMask} displayText = {'遮罩'} />
      </div>
    </>
  );
}

export default App;
