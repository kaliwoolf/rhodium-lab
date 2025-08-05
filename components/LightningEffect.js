import React, { useRef, useEffect } from "react";

export default function LightningEffect({ width = 320, height = 46 }) {
  const ref = useRef();

  // Функция фрактальной генерации
  function generateLightning(start, end, displace, detail) {
    if (displace < detail) return [start, end];
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    // Рандомное смещение вверх/вниз
    const offset = (Math.random() - 0.5) * displace;
    const mid = {
      x: midX,
      y: midY + offset
    };
    // Рекурсия
    return [
      ...generateLightning(start, mid, displace / 2, detail).slice(0, -1),
      ...generateLightning(mid, end, displace / 2, detail)
    ];
  }

  useEffect(() => {
    let frame;
    const ctx = ref.current.getContext("2d");
    let time = 0;

    function drawLightning() {
      ctx.clearRect(0, 0, width, height);
      const baseY = height / 2;

      // Двигаем финальную точку — чтобы линия “трепыхалась”
      const endY = baseY + Math.sin(time / 8) * 10 + (Math.random() - 0.5) * 10;
      const start = { x: 10, y: baseY };
      const end = { x: width - 10, y: endY };

      // Генерируем фрактальную молнию (чем меньше detail — тем рваней)
      const pts = generateLightning(start, end, 44, 3);

      // Glow-обводка
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "#e7a1ff";
      ctx.shadowColor = "#b666ff";
      ctx.shadowBlur = 16;
      ctx.lineWidth = 5.5;
      ctx.globalAlpha = 0.28;
      ctx.stroke();
      ctx.restore();

      // Основная линия
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      const colors = ["#cdf2ff", "#fff", "#b7e3ff"];
      ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.shadowColor = "#fff0";
      ctx.lineWidth = 1.7 + Math.sin(time / 15);
      ctx.globalAlpha = 0.89;
      ctx.stroke();
      ctx.restore();

      // Случайные вспышки на пути
      for (let k = 0; k < 3; k++) {
        const pi = Math.floor(Math.random() * pts.length);
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          pts[pi].x + (Math.random() - 0.5) * 2,
          pts[pi].y + (Math.random() - 0.5) * 2,
          2 + Math.random() * 2,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = ["#fff", "#e7a1ff", "#e6d0ff"][Math.floor(Math.random() * 3)];
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10 + Math.random() * 20;
        ctx.globalAlpha = 0.22 + Math.random() * 0.3;
        ctx.fill();
        ctx.restore();
      }

      time += 1;
      frame = requestAnimationFrame(drawLightning);
    }
    drawLightning();
    return () => cancelAnimationFrame(frame);
  }, [width, height]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        filter: "drop-shadow(0 0 8px #e7a1ff)",
        mixBlendMode: "lighter"
      }}
    />
  );
}
