uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 initialPos = texture2D(textureInitialPosition, uv); // 获取初始位置
    vec4 vel = texture2D(textureVelocity, uv);
    vec4 life = texture2D(textureLife, uv);

    // Update position
    pos.xyz += vel.xyz * 0.01;
    

    if(life.x <= 0.0 || life.z > 0.0) {
        pos.xyz = initialPos.xyz;
    }

    float mixFactor = distance(uv, vec2(0.5));

    vec4 newPos = mix(pos, initialPos, vec4(1.0));

    gl_FragColor = newPos;
}