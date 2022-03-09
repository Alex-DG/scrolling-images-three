uniform float time;
uniform float progress;
uniform float distanceFromCenter;
uniform sampler2D texture1;
uniform vec4 resolution;

varying vec2 vUv;
varying vec3 vPosition;

float PI = 3.141592653589793238;

void main()	{

	vec4 t = texture2D(texture1, vUv);
	float bw = (t.r + t.b + t.g) / 3.0;
	vec4 another = vec4(bw, bw, bw, 1.0);

	gl_FragColor = t;
	gl_FragColor.a = clamp(distanceFromCenter, 0.3, 1.0);

	// Black and white effect --
	// vec4 t = texture2D(texture1, vUv);
	// float bw = (t.r + t.b + t.g) / 3.0;
	// vec4 another = vec4(bw, bw, bw, 1.0);

	// gl_FragColor = mix(t, another, distanceFromCenter);
	// gl_FragColor.a = clamp(distanceFromCenter, 0.2, 1.0);

	// Base effect -- 
	// vec4 t = texture2D(texture1, vUv);
	// float bw = (t.r + t.b + t.g) / 3.0;
	// vec4 another = vec4(bw, bw, bw, 1.0);

	// gl_FragColor = t;
	// gl_FragColor.a = clamp(distanceFromCenter, 0.6, 1.0);
}