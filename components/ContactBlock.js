'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Tilt from 'react-parallax-tilt'
import * as THREE from 'three'

// 🌀 без SSR, чтобы избежать document is not defined
const GlassLensCanvas = dynamic(() => import('../components/GlassLensCanvas'), { ssr: false })

export default function ContactBlock() {
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/video/ice.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    const handleCanPlay = () => {
      console.log('[✅] Видео готово к воспроизведению');
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
      setVideoTexture(texture);

      video.play().then(() => {
        console.log('[▶️] Видео воспроизводится');
      }).catch((err) => {
        console.error('[🛑] Ошибка воспроизведения:', err);
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    video.load();

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

 
  return (
    <section
      id="contact"
      className="relative text-white min-h-screen flex items-center justify-center px-4 py-24 overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouse.current.set(
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height
        )
      }}
    >
      
      {/* 🔮 Фоновая линза */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {videoTexture && (
          <GlassLensCanvas
            mouse={mouse}
            texture={videoTexture}
            className="absolute inset-0 w-full h-full z-0"
          />
        )}
      </div>

      {/* 🧊 Панель с Tilt и видеофоном */}
      <Tilt
        glareEnable
        glareMaxOpacity={0.15}
        scale={1.02}
        transitionSpeed={2500}
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        className="w-[90vw] max-w-[960px] h-[720px] relative z-20 rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(255,255,255,0.1)]"
      >
  
        {/* Контент поверх видео */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-10 px-4">
          <div className="uppercase tracking-widest text-sm text-white/60 flex items-center gap-2">
            <span className="text-white/40">✦</span>
            СВЯЗАТЬСЯ
            <span className="text-white/40">✦</span>
          </div>

          <a
            href="mailto:hi@rhodium.vision"
            className="text-2xl md:text-4xl font-mono font-light tracking-[0.15em] md:tracking-[0.3em] text-center text-fuchsia-300 drop-shadow-[0_0_6px_rgba(255,0,255,0.3)] hover:drop-shadow-[0_0_10px_rgba(255,0,255,0.5)] transition"
          >
            HI@RHODIUM.VISION
          </a>

          <div className="relative w-[160px] sm:w-[180px] h-[200px] sm:h-[220px] rounded-xl overflow-hidden border border-white/20 shadow-xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              src="/video/ice.mp4"
            />
            <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
              <Image src="/qr-code.png" width={120} height={120} alt="QR" />
              <p className="text-xs text-white/60 text-center mt-3 tracking-widest">[ crafted in rhodium ]</p>
            </div>
          </div>
        </div>
      </Tilt>
    </section>
  )
}
