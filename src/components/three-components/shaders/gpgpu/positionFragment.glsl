uniform float time;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 pos = texture2D(texturePosition, uv);
    vec4 vel = texture2D(textureVelocity, uv);

    // Update position
    pos.xyz += vel.xyz * 0.1;

    if(length(pos.xyz) > 5.0){
        pos.xyz = normalize(pos.xyz) * 5.0;
    }

    gl_FragColor = pos;
}