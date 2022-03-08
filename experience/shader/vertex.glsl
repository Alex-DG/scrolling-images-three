uniform float time;
uniform vec2 pixels;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.141592653589793238;

void main() {
  vUv = uv;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}