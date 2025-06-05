uniform sampler2D textureVelocity;
uniform sampler2D textureLife;
uniform sampler2D utexture;

varying vec2 vUv;
varying float vMask;
varying float vLife;

void main() {
    vec4 life = texture2D(textureLife, vUv);

    // if(vSize < 0.0) {
    //     discard;
    // }

    if(distance(gl_PointCoord, vec2(0.5)) > 0.5){
        discard;
    }

    vec3 color1 = texture2D(utexture, vec2(vUv.x, 1.0 - vUv.y)).rgb;
    vec3 color2 = texture2D(utexture, vec2(vUv.x, 1.0 - vUv.y)).rgb * 1.2;

    vec3 color = mix(color2, color1, vMask);

    float alpha = 1.0;
    float changingAlpha = alpha * smoothstep(0.0, 1.0, vLife);

    float newAlpha = mix(changingAlpha,alpha,  vMask);

    gl_FragColor = vec4(color, newAlpha);
}