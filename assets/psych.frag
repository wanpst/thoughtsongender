#version 100
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

// just keep throwing numbers at the wall and eventually we'll get there!
#define PI 3.14159265358979323846264338327950288

// only god knows who came up with this
float rand(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    vec2 coolifiedUV = uv + (6.0 * rand(uv)) * vec2(sin(u_time), cos(u_time));
    float pattern = sin(pow(length(coolifiedUV), 3.0));

    vec3 color = sin(coolifiedUV.xyx + u_time + vec3(0, 2, 8)) + pattern;
    color.g = (color.r + color.g + color.b) / 3.0;
    gl_FragColor = vec4(fract(color), 1.0);
}
