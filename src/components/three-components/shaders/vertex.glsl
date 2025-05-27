uniform sampler2D texturePosition;
uniform sampler2D textureLife;
uniform float pointSize;

varying vec2 vUv;
varying float vSize;
varying vec3 vPos;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}

void main() {
  vec4 pos = texture2D(texturePosition, uv);
  vec4 life = texture2D(textureLife, uv);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);

  float size = pointSize * 2.0;
  gl_PointSize = size;

  vSize = size;
  vUv = uv;
  vPos = pos.xyz;
}