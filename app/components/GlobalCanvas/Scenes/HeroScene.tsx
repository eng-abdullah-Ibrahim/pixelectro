"use client";

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';


export default function HeroScene({ position }: { position: [number, number, number] }) {
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
    u_speed: { value: 0.8 },
    u_amplitude: { value: 0.8 }
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    uniforms.u_time.value = t;

    if (meshRef.current) {
      // Fluid mouse tilt
      meshRef.current.rotation.y += (mousePos.current.x * 0.3 - meshRef.current.rotation.y) * 0.08;
      meshRef.current.rotation.x += (-mousePos.current.y * 0.3 - meshRef.current.rotation.x) * 0.08;
    }
  });

  return (
    <group position={position}>
      <Float speed={1.0} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[2.2, 128, 128]} />
          <meshPhysicalMaterial
            color="#050505"
            metalness={1.0}
            roughness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            envMapIntensity={3.0}
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
                float wave1 = sin(position.x * 2.5 + u_time * u_speed) * u_amplitude;
                float wave2 = cos(position.y * 3.0 - u_time * (u_speed * 1.2)) * (u_amplitude * 0.4);
                float wave3 = sin(sqrt(position.x*position.x + position.y*position.y) * 4.0 - u_time * u_speed) * (u_amplitude * 0.2);
                
                transformed.z += wave1 + wave2 + wave3;
                `
              );
            }}
          />
        </mesh>
      </Float>
      
      {/* Studio rim lighting */}
      <spotLight position={[5, 5, -5]} intensity={4.0} color="#ffffff" angle={0.6} penumbra={1} />
      <pointLight position={[-5, -5, 5]} intensity={1.5} color="#cbd5e1" />
    </group>
  );
}
