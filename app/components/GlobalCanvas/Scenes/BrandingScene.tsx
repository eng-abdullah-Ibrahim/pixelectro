"use client";

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BrandingScene({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!);
  const mat1Ref  = useRef<THREE.MeshStandardMaterial>(null!);
  const mat2Ref  = useRef<THREE.MeshStandardMaterial>(null!);
  const mousePos = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const helixData = useMemo(() => {
    const points: { pos: [number, number, number]; strand: 0 | 1 }[] = [];
    const steps = 80, heightSpan = 8, radius = 1.4, turns = 4;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a1 = t * turns * Math.PI * 2;
      const a2 = a1 + Math.PI;
      const y  = t * heightSpan - heightSpan / 2;
      points.push({ pos: [Math.cos(a1) * radius, y, Math.sin(a1) * radius], strand: 0 });
      points.push({ pos: [Math.cos(a2) * radius, y, Math.sin(a2) * radius], strand: 1 });
    }
    return points;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y += (t * 0.12 - groupRef.current.rotation.y) * 0.02;
      groupRef.current.rotation.x += (mousePos.current.y * 0.3 - groupRef.current.rotation.x) * 0.04;
    }
    const pulse = (Math.sin(t * 2) * 0.5 + 0.5) * 0.6;
    if (mat1Ref.current) mat1Ref.current.emissiveIntensity = pulse;
    if (mat2Ref.current) mat2Ref.current.emissiveIntensity = pulse * 0.6;
  });

  return (
    <group ref={groupRef} position={position}>
      {helixData.map((d, i) => (
        <mesh key={i} position={d.pos}>
          <sphereGeometry args={[d.strand === 0 ? 0.1 : 0.08, 8, 8]} />
          <meshStandardMaterial
            ref={d.strand === 0 && i === 0 ? mat1Ref : d.strand === 1 && i === 1 ? mat2Ref : undefined}
            color={d.strand === 0 ? '#f5f5f7' : '#ffffff'}
            emissive={d.strand === 0 ? '#f5f5f7' : '#ffffff'}
            emissiveIntensity={0.2}
            roughness={0.15}
            metalness={0.9}
          />
        </mesh>
      ))}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 8, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
      <pointLight position={[0, 0, 2]} color="#ffffff" intensity={2} distance={8} />
    </group>
  );
}
