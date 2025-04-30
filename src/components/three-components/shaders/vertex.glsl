// uniform float uTime;

attribute float lifetime;
attribute float initialLifetime;
attribute vec3 velocity;
uniform float time;
varying float vLifetime;

varying vec2 vUv;
varying vec3 vPosition;

#include "./curlNoise.glsl"
// #include "./perlinNoise.glsl"

void main() {
    // vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);

    // vec3 noiseFactor = curlNoise(position.xyz * 0.1 + uTime * 0.1) - vec3(0.5);
    // float distortion = snoise(position.xyz * 0.005 + uTime * 0.2) - 0.5;
    // mvPosition.xyz += vec3(distortion, distortion, 0.0) * 100.0;
    // mvPosition.xyz += noiseFactor * 100.0;

    // gl_Position = projectionMatrix * mvPosition;
    // gl_PointSize = 2.0;

             vLifetime = lifetime / initialLifetime;
          
          // 根据速度和时间更新位置
          vec3 newPosition = position + velocity * time;
          
          // 重置粒子位置和时间
          float t = mod(time, initialLifetime);
          if (t > lifetime) {
            newPosition = position;
          }
          
          vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
          gl_PointSize = 5.0 * vLifetime; // 根据寿命调整大小
          gl_Position = projectionMatrix * mvPosition;

    vUv = uv;
    vPosition = position.xyz;
}