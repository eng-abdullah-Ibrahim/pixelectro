"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import styles from './GlobalFootprint.module.css';

function Globe() {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          color="#0B1736" 
          roughness={0.3} 
          metalness={0.8} 
        />
      </Sphere>
      <Sphere args={[2.02, 32, 32]}>
        <meshBasicMaterial color="#38D6FF" wireframe transparent opacity={0.15} />
      </Sphere>
      
      {/* Hotspots: USA, Canada, Turkey, GCC, Jordan */}
      <mesh position={[-1.2, 0.8, 1.2]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#0E8FE8" />
      </mesh>
      <mesh position={[-1.0, 1.2, 1.0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#0E8FE8" />
      </mesh>
      <mesh position={[1.2, 0.8, -1.0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#0E8FE8" />
      </mesh>
      <mesh position={[1.4, 0.5, 0.8]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#0E8FE8" />
      </mesh>
      <mesh position={[1.3, 0.6, 0.9]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#0E8FE8" />
      </mesh>
    </group>
  );
}

export default function GlobalFootprint() {
  return (
    <section className={styles.footprintSection}>
      <h2 className={styles.title}>Global <span className={styles.titleAccent}>Footprint</span></h2>
      <p className={styles.description}>
        Delivering premium cinematic experiences across the GCC, Jordan, USA, Canada, and Turkey. Our creativity knows no borders.
      </p>
      <div className={styles.globeContainer}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
          <pointLight position={[-5, -5, 5]} intensity={1} color="#38D6FF" />
          <Globe />
        </Canvas>
      </div>
    </section>
  );
}
