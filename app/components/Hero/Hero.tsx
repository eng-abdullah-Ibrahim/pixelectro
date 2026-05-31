"use client";

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Wireframe } from '@react-three/drei';
import styles from './Hero.module.css';

function AbstractShape() {
  const meshRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={2.2}>
        <MeshDistortMaterial
          color="#0B1736"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>
      {/* Outer wireframe glow effect */}
      <Sphere args={[1, 32, 32]} scale={2.4}>
        <meshStandardMaterial color="#0E8FE8" wireframe transparent opacity={0.15} />
      </Sphere>
    </Float>
  );
}

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.canvasContainer}>
        <Canvas camera={{ position: [0, 0, 6] }}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
          <directionalLight position={[-10, -10, -5]} intensity={3} color="#38D6FF" />
          <pointLight position={[0, 0, 0]} intensity={2} color="#0E8FE8" distance={10} />
          <AbstractShape />
        </Canvas>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>PIX</span>ELECTRO
        </h1>
        <p className={styles.slogan}>Creativity is our identity</p>
        <div className={styles.ctaGroup}>
          <button className={styles.primaryBtn}>View Portfolio</button>
          <button className={styles.secondaryBtn}>Get in Touch</button>
        </div>
      </div>
    </section>
  );
}
