"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export default function SoftwareScene({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Group>(null!);
  const mousePos = useRef(new THREE.Vector2(0, 0));

  useMemo(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.x = mousePos.current.y * 0.2;
      meshRef.current.rotation.z = mousePos.current.x * 0.2;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
        <group ref={meshRef}>
          {/* Crystalline wireframe structure */}
          <mesh>
            <cylinderGeometry args={[2, 2, 4, 6, 1, true]} />
            <meshPhysicalMaterial
              color="#ffffff"
              transmission={0.95}
              roughness={0.0}
              thickness={1.5}
              ior={1.4}
              wireframe={true}
              wireframeLinewidth={2}
            />
          </mesh>
          
          {/* Inner solid geometry bouncing refractions */}
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <boxGeometry args={[1.5, 1.5, 1.5]} />
            <meshPhysicalMaterial
              color="#0d0d0d"
              metalness={0.8}
              roughness={0.2}
              clearcoat={1.0}
            />
          </mesh>
        </group>
      </Float>
    </group>
  );
}
