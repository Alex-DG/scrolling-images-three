uniform float time;
uniform float distanceFromCenter;
uniform vec2 pixels;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.141592653589793238;

void main() {
  vUv = ((uv - vec2(0.5)) * (0.8 - 0.2*distanceFromCenter*(2.0 - distanceFromCenter)) + vec2(0.5) ); // scaling to avoid blurry effect on Y when moving

  vec3 pos = position;

  pos.y += sin(PI*uv.x)*0.025;
  pos.z += sin(PI*uv.x)*0.025;

  pos.y += sin(time * 0.3) * 0.02;
  vUv.y -= sin(time * 0.3) * 0.02;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

  // Base setup ---
  // vUv = ((uv - vec2(0.5)) * 0.9 + vec2(0.5) ); // scaling to avoid blurry effect on Y when moving

  // vec3 pos = position;

  // pos.y += sin(PI*uv.x)*0.025;
  // pos.z += sin(PI*uv.x)*0.025;

  // pos.y += sin(time * 0.3) * 0.02;
  // vUv.y -= sin(time * 0.3) * 0.02;
  
  // gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}