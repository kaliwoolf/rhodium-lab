// anomaly.glsl (содержимое из https://codepen.io/atzedent/pen/oggKrGW)
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform vec2 move;
uniform vec2 touch;
uniform int pointerCount;
uniform vec2 pointers[32];

#define T time
#define R resolution
#define M move

float field(in vec3 p) {
  float strength = 7. + .03 * log(1.e-6 + fract(sin(T*10.)*5e5));
  float accum = 0.;
  float prev = 0.;
  float tw = 0.;
  for (int i = 0; i < 32; ++i) {
    float mag = dot(p, p);
    p = abs(p) / mag + vec3(-.5, -.4, -1.5);
    float w = exp(-float(i) / 7.);
    accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
    tw += w;
    prev = mag;
  }
  return max(0., 5. * accum / tw - .7);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - .5 * R.xy) / R.y;
  vec2 m = M.xy / R;
  vec3 dir = normalize(vec3(uv * 1.6, 1.));
  vec3 origin = vec3(1., .5, .5) + vec3(m * 2., -2.);
  float zoom = .4;
  float t = T * .1;
  origin += zoom * vec3(sin(t), sin(t * .9), sin(t * .7));
  float v = field(origin + dir);
  vec3 col = vec3(v);
  col = mix(vec3(.4, .1, .3), vec3(1., .8, .8), col);
  gl_FragColor = vec4(col, 1.);
}
