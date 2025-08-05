import React, { useRef, useEffect } from "react";

export default function LightningEffect() {
  const ref = useRef();

  useEffect(() => {
    let frame;
    const ctx = ref.current.getContext("2d");
    let time = 0;

    function drawLightning() {
      const w = ref.current.width;
      const h = ref.current.height;
      ctx.clearRect(0, 0, w, h);

      // === Параметры ===
      const points = 32;
      const baseY = h / 2;
      const amp = 12 + Math.sin(time / 6) * 5;
      const glitch = 8 + Math.sin(time / 13) * 4;

      // === Генерим точки ===
      let pts = [];
      for (let i = 0; i < points; i++) {
        const x = (w / (points - 1)) * i;
        // Базовый синус + noise + глитч
        const y =
          baseY +
          Math.sin(i * 0.35 + time / 8) * amp +
          (Math.random() - 0.5) * glitch +
          Math.sin(i * 2.2 + time * 1.5) * (Math.random() * 5);
        pts.push({ x, y });
      }

      // === Молния — основной слой ===
      ctx.save();
      ctx.shadowColor = "#ff44ff";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3.4;
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.restore();

      // === Цветной слой (глитч-обводка) ===
      ctx.save();
      ctx.shadowColor = "#a23eff";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.strokeStyle = "#f0f";
      ctx.lineWidth = 7.5;
      ctx.globalAlpha = 0.44;
      ctx.stroke();
      ctx.restore();

      // === Эффект искр ===
      for (let k = 0; k < 3; k++) {
        const sparkIndex = Math.floor(Math.random() * points);
        ctx.save();
        ctx.globalAlpha = 0.7 + Math.random() * 0.2;
        ctx.beginPath();
        ctx.arc(
          pts[sparkIndex].x + Math.random() * 5 - 2.5,
          pts[sparkIndex].y + Math.random() * 5 - 2.5,
          2.8 + Math.random() * 2.7,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = ["#fff", "#a23eff", "#f0f", "#ff44ff"][Math.floor(Math.random() * 4)];
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.restore();
      }

      // === Вспышка (редко) ===
      if (Math.random() > 0.95) {
        ctx.save();
        ctx.globalAlpha = 0.22 + Math.random() * 0.22;
        ctx.beginPath();
        ctx.arc(
          w / 2 + Math.random() * 60 - 30,
          baseY + Math.random() * 12 - 6,
          35 + Math.random() * 14,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#ff00ee";
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.restore();
      }

      time += 1;
      frame = requestAnimationFrame(drawLightning);
    }
    drawLightning();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={ref}
      width={320}
      height={46}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        filter: "drop-shadow(0 0 10px #e4a4ff) blur(0.5px)",
        mixBlendMode: "lighter"
      }}
    />
  );
}
