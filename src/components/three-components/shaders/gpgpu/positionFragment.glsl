uniform float time;
uniform sampler2D maskTexture;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 initialPos = texture2D(textureInitialPosition, uv); // 获取初始位置
    vec4 vel = texture2D(textureVelocity, uv);
    vec4 life = texture2D(textureLife, uv);

    // Update position
    pos.xyz += vel.xyz * 0.1;
    

    if(life.x < 0.1 || life.z > 0.0) {
        pos.xyz = initialPos.xyz;
    }

    vec2 maskUv = vec2(uv.x, 1.0 - uv.y);
    float mask = texture2D(maskTexture, maskUv).r;

    vec4 newPos = mix(pos, initialPos, mask);

    gl_FragColor = newPos;
}