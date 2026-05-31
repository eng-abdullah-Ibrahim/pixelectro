"use client";

import { useEffect, useRef } from 'react';

export default function GridBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `
          radial-gradient(circle at var(--x, 50vw) var(--y, 50vh), rgba(47, 168, 232, 0.08) 0%, transparent 40%),
          radial-gradient(circle at calc(var(--x, 50vw) + 200px) calc(var(--y, 50vh) - 100px), rgba(21, 101, 216, 0.05) 0%, transparent 50%),
          url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjEsIDEwMSwgMjE2LCAwLjE1KSIvPjwvc3ZnPg==')
        `,
        backgroundSize: '100% 100%, 100% 100%, 40px 40px',
        opacity: 0.8
      }}
      aria-hidden="true"
    />
  );
}
