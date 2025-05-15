uniform float time;

#include "../curlNoise.glsl"

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);
    vec4 life = texture2D(textureLife, uv);

    vec3 force = curlNoise(vec3(pos.x + time, pos.y, pos.z) * 0.1);

    vel.xyz += force * 0.1;
    vel.xyz *= 0.97;

    if(life.x <= 0.0 || life.z > 0.0) {
        float seed = uv.x + uv.y * 57.0 + time;
        vel.xyz = vec3(
            (fract(sin(seed + 3.0) * 43578.5453) - 0.5) * 0.1,
            (fract(sin(seed + 4.0) * 43578.5453) - 0.5) * 0.1,
            (fract(sin(seed + 5.0) * 43578.5453) - 0.5) * 0.1
        );
    } 
    gl_FragColor = vel;
}