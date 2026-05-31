"use client";

import { Html, useProgress } from "@react-three/drei";

export default function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-syncopate), sans-serif',
        color: '#f5f5f7',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        fontWeight: 'bold',
        fontSize: '14px',
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '2px solid rgba(255, 255, 255, 0.05)',
          borderTop: '2px solid #f5f5f7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '10px'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        {progress.toFixed(0)}%
      </div>
    </Html>
  );
}
