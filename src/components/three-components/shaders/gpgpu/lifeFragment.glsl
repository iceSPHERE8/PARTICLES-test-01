uniform float delta;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 life = texture2D(textureLife, uv);

    life.x -= delta;

    if(life.x < 0.0) {
        life.x = life.y;
        life.z = 1.0;
    } else if(life.z > 0.0) {
        life.z = 0.0;
    }

    gl_FragColor = life;
}