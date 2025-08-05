import React, { useRef, useEffect } from "react";

// ======= ВСЯ ЛОГИКА ===========
function randomWavePoints(width, height, points = 20, amp = 8, phase = 0, noise = 0.7) {
  const pts = [];
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const base = Math.sin((i / points) * Math.PI * 2 + phase) * amp;
    const y = height / 2 + base + (Math.random() - 0.5) * amp * noise;
    pts.push([x, y]);
  }
  return pts;
}

function ptsToString(pts) {
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

export default function LightningEffect({
  width = 240,
  height = 36,
  color = "#ff22dd",
  color2 = "#ffffff",
  style = {},
}) {
  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();

  useEffect(() => {
    let frame = 0;
    let anim;
    function animate() {
      frame += 1;
      const t = frame / 18;
      const pts1 = randomWavePoints(width, height, 20, 10, t, 0.35);
      const pts2 = randomWavePoints(width, height, 20, 14, t + 1, 0.18);
      const pts3 = randomWavePoints(width, height, 20, 16, t + 2, 0.8);

      if (ref1.current) ref1.current.setAttribute("points", ptsToString(pts1));
      if (ref2.current) ref2.current.setAttribute("points", ptsToString(pts2));
      if (ref3.current) ref3.current.setAttribute("points", ptsToString(pts3));
      anim = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(anim);
  }, [width, height]);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: "screen",
        ...style,
      }}
    >
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        ref={ref3}
        fill="none"
        stroke={color}
        strokeWidth="14"
        filter="url(#glow)"
        opacity="0.25"
      />
      <polyline
        ref={ref1}
        fill="none"
        stroke={color}
        strokeWidth="6"
        filter="url(#glow)"
        opacity="0.82"
      />
      <polyline
        ref={ref2}
        fill="none"
        stroke={color2}
        strokeWidth="2"
        filter="url(#glow)"
        opacity="0.72"
      />
    </svg>
  );
}
