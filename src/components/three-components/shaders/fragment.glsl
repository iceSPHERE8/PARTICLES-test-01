varying vec2 vUv;
varying vec3 vPosition;

 varying float vLifetime;

#include "./curlNoise.glsl"

void main() {
    // float distortion = snoise(vPosition.xyz * 0.05);  
    // distortion += snoise(vPosition.xyz * 0.005);

    // gl_FragColor = vec4(vec3(distortion) * 2.0, distortion);


           
          // 圆形粒子
          vec2 coord = gl_PointCoord - vec2(0.5);
          if (length(coord) > 0.5) discard;

          // 根据寿命调整透明度
          gl_FragColor = vec4(1.0, 0.5, 0.2, vLifetime * 0.8);
}