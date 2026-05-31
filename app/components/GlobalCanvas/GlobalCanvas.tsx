"use client";

import { Canvas } from '@react-three/fiber';
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Suspense } from 'react';
import SceneManager from './SceneManager';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import CanvasLoader from './CanvasLoader';

export default function GlobalCanvas() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#030303']} />
        {/* Studio Three-Point Lighting Setup: Clinical Precision */}
        <directionalLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" />
        <directionalLight position={[-5, 2, 5]} intensity={1.0} color="#e2e8f0" />
        <spotLight position={[0, 5, -5]} intensity={3.5} color="#cbd5e1" angle={0.5} penumbra={1} castShadow />

        <CanvasErrorBoundary>
          <Suspense fallback={<CanvasLoader />}>
            <SceneManager />
            
            <EffectComposer>
              <DepthOfField focusDistance={0} focalLength={0.01} bokehScale={2} height={480} />
              <Noise opacity={0.02} />
              <Vignette eskil={false} offset={0.08} darkness={1.2} />
            </EffectComposer>
          </Suspense>
        </CanvasErrorBoundary>
      </Canvas>
    </div>
  );
}
