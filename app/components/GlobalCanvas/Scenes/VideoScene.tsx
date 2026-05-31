"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';


export default function VideoScene({ position }: { position: [number, number, number] }) {
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
    u_time: { value: 0 },
    u_speed: { value: 1.2 },
    u_amplitude: { value: 0.6 }
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    uniforms.u_time.value = t;

    if (meshRef.current) {
      // Subtle mouse interaction
      meshRef.current.rotation.y += (mousePos.current.x * 0.2 - meshRef.current.rotation.y) * 0.05;
      meshRef.current.rotation.x += (-mousePos.current.y * 0.2 - meshRef.current.rotation.x) * 0.05;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef} rotation={[Math.PI / 4, 0, 0]}>
          <planeGeometry args={[12, 4, 128, 32]} />
          <meshPhysicalMaterial
            color="#111111"
            metalness={0.9}
            roughness={0.15}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            envMapIntensity={2.5}
            onBeforeCompile={(shader) => {
              shader.uniforms.u_time = uniforms.u_time;
              shader.uniforms.u_speed = uniforms.u_speed;
              shader.uniforms.u_amplitude = uniforms.u_amplitude;
              shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                #include <common>
                uniform float u_time;
                uniform float u_speed;
                uniform float u_amplitude;
                `
              );
              shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                float wave1 = sin(position.z * 1.5 + u_time * u_speed) * u_amplitude;
                float wave2 = cos(position.x * 2.0 - u_time * (u_speed * 0.8)) * (u_amplitude * 0.5);
                float wave3 = sin((position.x + position.z) * 1.0 + u_time * u_speed) * (u_amplitude * 0.3);
                
                transformed.y += wave1 + wave2 + wave3;
                
                float pinch = smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);
                transformed.x *= pinch;
                `
              );
            }}
          />
        </mesh>
      </Float>
      
      {/* Subtle clinical lighting */}
      <pointLight position={[2, 3, 4]} color="#ffffff" intensity={1.5} distance={15} />
      <pointLight position={[-3, -2, -2]} color="#94a3b8" intensity={0.8} distance={10} />
    </group>
  );
}
