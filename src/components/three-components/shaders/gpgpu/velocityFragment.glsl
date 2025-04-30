uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);

    vec3 force = vec3(
        -pos.y * 0.1,
        pos.x * 0.1,
        sin(time * 0.5) * 0.05
    );

    vel.xyz += force * 0.01;
    vel.xyz *= 0.98;

    gl_FragColor = vel;
}