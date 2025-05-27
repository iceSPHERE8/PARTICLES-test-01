uniform sampler2D textureVelocity;
uniform sampler2D textureLife;
uniform sampler2D utexture;

varying vec2 vUv;
varying float vSize;
varying vec3 vPos;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
}

void main() {
    vec4 life = texture2D(textureLife, vUv);
    vec4 vel = texture2D(textureVelocity, vUv);

    // life.x = normalize(life.x);
    life.x = map(life.x, 0.0, 2.0, 1.0, 0.0);
    if(vSize > 6.0 || vSize < 0.01) {
        discard;
    }

    if(distance(gl_PointCoord, vec2(0.5)) > 0.5){
        discard;
    }

    vec3 color = texture2D(utexture, vec2(vUv.x, 1.0 - vUv.y)).rgb;

    // gl_FragColor = vec4(vec3(vec2(vUv.x, vUv.y * 1.0), 0.0), 0.8);
    gl_FragColor = vec4(color, 1.0);
}