uniform float delta;
uniform sampler2D maskTexture;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 life = texture2D(textureLife, uv);
    vec4 restLife = texture2D(textureLife, uv);

    life.x -= delta;

    if(life.x < 0.0) {
        life.x = life.y;
        life.z = 1.0;
    } else if(life.z > 0.0) {
        life.z = 0.0;
    }

    vec2 maskUv = vec2(uv.x, 1.0 - uv.y);
    float mask = texture2D(maskTexture, maskUv).r;

    vec4 newLife = mix(life,restLife, mask);

    gl_FragColor = newLife;
}