uniform sampler2D textureVelocity;
uniform sampler2D textureLife;
uniform sampler2D utexture;

varying vec2 vUv;
varying float vLife;
varying float vMask;

void main() {
    vec4 life = texture2D(textureLife, vUv);

    // if(life.x < 0.0 || life.z > 0.0 || vLife > 2.5) {
    //     discard;
    // }

    if(distance(gl_PointCoord, vec2(0.5)) > 0.5){
        discard;
    }

    vec3 color1 = texture2D(utexture, vec2(vUv.x, 1.0 - vUv.y)).rgb;
    vec3 color2 = texture2D(utexture, vec2(vUv.x, 1.0 - vUv.y)).rgb * 1.5;

    vec3 color = mix(color2, color1, vMask);

    gl_FragColor = vec4(color, 1.0);
}