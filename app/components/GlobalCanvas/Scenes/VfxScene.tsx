"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';



export default function VfxScene({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const mousePos = useRef(new THREE.Vector2(0, 0));

  useMemo(() => {
    const onMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const uniforms = useMemo(() => ({
    u_time: { value: 0 }
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    uniforms.u_time.value = t;

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.1 + mousePos.current.x * 0.2;
      meshRef.current.rotation.x = t * 0.05 + (-mousePos.current.y * 0.2);
    }
  });

  return (
    <group position={position}>
      <Float speed={2.0} rotationIntensity={0.2} floatIntensity={0.8}>
        <mesh ref={meshRef}>
          {/* Icosahedron for crystalline faceted look */}
          <icosahedronGeometry args={[2.5, 0]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transmission={0.98}
            opacity={1}
            metalness={0.1}
            roughness={0.02}
            ior={1.5}
            thickness={2.0}
            attenuationColor="#ffffff"
            attenuationDistance={10}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            envMapIntensity={2.0}
            onBeforeCompile={(shader) => {
              shader.uniforms.u_time = uniforms.u_time;
              shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                #include <common>
                uniform float u_time;
                `
              );
              shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                float breath = sin(u_time * 0.5 + position.y * 2.0) * 0.1;
                transformed += normal * breath;
                `
              );
            }}
          />
        </mesh>
        {/* Inner core for extra refraction hits */}
        <mesh>
          <octahedronGeometry args={[1.2, 0]} />
          <meshPhysicalMaterial
            color="#f5f5f7"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1.0}
          />
        </mesh>
      </Float>
    </group>
  );
}
