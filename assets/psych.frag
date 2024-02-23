#version 100

// the noise effect requires high precision
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// only god knows who came up with this
float rand(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    #ifdef GL_FRAGMENT_PRECISION_HIGH
    vec3 color = vec3(
        rand(sin(uv.yx)),
        rand(sin(uv.xy * u_time)) * 0.8,
        rand(sin(uv.yx * u_time))
    );

    vec3 color_strong_red = vec3(
        rand(sin(color.rg * u_time)),
        color.g * 0.8,
        color.b * 0.8
    );
    #else // we can't generate noise! just do something kinda cool
    vec3 color = vec3(sin(uv.y), 0.0, sin(uv.y));
    vec3 color_strong_red = vec3(sin(uv.y), 0.0, sin(uv.x) * 0.2);
    #endif

    gl_FragColor = vec4(mix(color, color_strong_red, sin(u_time) * 0.5 + 0.5), 1.0);
}
