uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);
    vec4 life = texture2D(textureLife, uv);

    // Update position
        pos.xyz += vel.xyz * 0.01;

    if(life.x <= 0.0 || life.z > 0.0){
        float seed = uv.x + uv.y * 57.0 + time;
        pos.xyz = vec3(
            (fract(sin(seed) * 43758.5453) - 0.5) * 0.0,
            (fract(sin(seed + 1.0) * 43758.5453) - 0.5) * 10.0,
            (fract(sin(seed + 2.0) * 43758.5453) - 0.5) * 10.0
        );

        // pos.xyz = texture2D(texturePosition, uv).xyz;
    }

    // if(time > 0.0){
    //     pos *= 0.0;
    // }

    gl_FragColor = pos;
}