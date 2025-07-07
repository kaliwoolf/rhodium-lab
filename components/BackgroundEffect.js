import { useEffect } from 'react';

export default function BackgroundEffect() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: '-1',
      pointerEvents: 'none',
      background: 'transparent',
    });
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.1, 0.1, 0.2, 0.5);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return () => {
      document.body.removeChild(canvas);
    };
  }, []);

  return null;
}