"use client";

import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Materials ─────────────────────────────────────────────────────────

const SapphireGlassMaterial = () => (
  <MeshTransmissionMaterial
    backside
    samples={2}
    resolution={128}
    thickness={2}
    chromaticAberration={0.05}
    anisotropy={0.2}
    distortion={0.1}
    distortionScale={0.3}
    temporalDistortion={0.05}
    color="#ffffff"
    attenuationColor="#2FA8E8"
    attenuationDistance={2}
    clearcoat={1}
    clearcoatRoughness={0.1}
    roughness={0.05}
    ior={1.2}
  />
);

const FastGlassMaterial = () => (
  <meshPhysicalMaterial
    color="#F5F8FF"
    transmission={0.9}
    opacity={1}
    transparent
    roughness={0.1}
    metalness={0.1}
    clearcoat={1}
    ior={1.5}
  />
);

const MatteBlueMaterial = () => (
  <meshStandardMaterial
    color="#1565D8"
    emissive="#0C2461"
    emissiveIntensity={0.6}
    roughness={0.2}
    metalness={0.8}
  />
);

// ── Canvas Wrapper ────────────────────────────────────────────────────

const DisciplineCanvas = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
    <Canvas camera={{ position: [0, 0, 12], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[-10, 10, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[10, -10, -5]} intensity={1} color="#1565D8" />
      {children}
      <Environment preset="city" />
    </Canvas>
  </div>
);

// ── Bouncing shape hook ───────────────────────────────────────────────
// Each shape bounces freely across the FULL section, bounded by:
//   X: [-hw, +hw]  (screen left/right edges)
//   Y: [titleBottom, +hh]  (title text is the bottom wall, top is screen top)

function useBounce(scale: number) {
  const meshRef = useRef<THREE.Mesh>(null);
  const vel = useRef(new THREE.Vector3(
    (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.03),
    (Math.random() > 0.5 ? 1 : -1) * (0.03 + Math.random() * 0.03),
    0
  ));
  const rot = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.03,
    (Math.random() - 0.5) * 0.03,
    (Math.random() - 0.5) * 0.02
  ));

  const { viewport } = useThree();

  useFrame(() => {
    const m = meshRef.current;
    if (!m) return;

    const hw = viewport.width / 2 - scale * 0.5;
    const hh = viewport.height / 2 - scale * 0.5;
    // Title wall: keep shape in top ~60% of the section to avoid text/grid
    const bottomWall = -hh * 0.3;

    m.position.x += vel.current.x;
    m.position.y += vel.current.y;

    if (m.position.x > hw)  { m.position.x = hw;         vel.current.x *= -1; }
    if (m.position.x < -hw) { m.position.x = -hw;        vel.current.x *= -1; }
    if (m.position.y > hh)  { m.position.y = hh;         vel.current.y *= -1; }
    if (m.position.y < bottomWall) { m.position.y = bottomWall; vel.current.y *= -1; }

    m.rotation.x += rot.current.x;
    m.rotation.y += rot.current.y;
    m.rotation.z += rot.current.z;
  });

  return meshRef;
}

// ── 1. Branding — rotating coin ───────────────────────────────────────

function BrandingShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[2, 1, 0]} scale={2.5}>
      <cylinderGeometry args={[1.2, 1.2, 0.18, 64]} />
      <SapphireGlassMaterial />
    </mesh>
  );
}
export const BrandingScene = () => <DisciplineCanvas><BrandingShape /></DisciplineCanvas>;

// ── 2. Film — lens torus ──────────────────────────────────────────────

function FilmShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[-2, 1, 0]} scale={2.5}>
      <torusGeometry args={[1, 0.28, 32, 100]} />
      <FastGlassMaterial />
    </mesh>
  );
}
export const FilmScene = () => <DisciplineCanvas><FilmShape /></DisciplineCanvas>;

// ── 3. 3D & VFX — wireframe octahedron ───────────────────────────────

function VFXShape() {
  const solidRef = useBounce(1.5);
  return (
    <group>
      <mesh ref={solidRef} position={[1.5, 0.5, 0]} scale={2.2}>
        <octahedronGeometry args={[1.2, 0]} />
        <MatteBlueMaterial />
      </mesh>
    </group>
  );
}
export const VFXScene = () => <DisciplineCanvas><VFXShape /></DisciplineCanvas>;

// ── 4. Software — dodecahedron network ────────────────────────────────

function SoftwareShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[-1.5, 1, 0]} scale={2.2}>
      <dodecahedronGeometry args={[1.2, 0]} />
      <SapphireGlassMaterial />
    </mesh>
  );
}
export const SoftwareScene = () => <DisciplineCanvas><SoftwareShape /></DisciplineCanvas>;

// ── 5. Performance — ascending cone ──────────────────────────────────

function PerformanceShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[2, 0, 0]} scale={2.2} rotation={[Math.PI / 4, 0, 0]}>
      <coneGeometry args={[1, 2.5, 32]} />
      <FastGlassMaterial />
    </mesh>
  );
}
export const PerformanceScene = () => <DisciplineCanvas><PerformanceShape /></DisciplineCanvas>;

// ── 6. AI Solutions — pulsating sphere ───────────────────────────────

function AIShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const vel = useRef(new THREE.Vector3(0.035, 0.025, 0));
  const rot = useRef(new THREE.Vector3(0.01, 0.015, 0.005));
  const { viewport } = useThree();

  useFrame(({ clock }) => {
    const m = meshRef.current;
    if (!m) return;

    const hw = viewport.width / 2 - 1.2;
    const hh = viewport.height / 2 - 1.2;
    const bottomWall = -hh * 0.3;

    m.position.x += vel.current.x;
    m.position.y += vel.current.y;

    if (m.position.x > hw)  { m.position.x = hw;         vel.current.x *= -1; }
    if (m.position.x < -hw) { m.position.x = -hw;        vel.current.x *= -1; }
    if (m.position.y > hh)  { m.position.y = hh;         vel.current.y *= -1; }
    if (m.position.y < bottomWall) { m.position.y = bottomWall; vel.current.y *= -1; }

    m.rotation.x += rot.current.x;
    m.rotation.y += rot.current.y;

    // Pulsate
    const pulse = 2 + Math.sin(clock.elapsedTime * 2.5) * 0.15;
    m.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef} position={[-1, 1.5, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <SapphireGlassMaterial />
    </mesh>
  );
}
export const AIScene = () => <DisciplineCanvas><AIShape /></DisciplineCanvas>;

// ── 7. New Scenes for the Library ─────────────────────────────────────

function IcosahedronShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[0, 1, 0]} scale={2.5}>
      <icosahedronGeometry args={[1, 0]} />
      <FastGlassMaterial />
    </mesh>
  );
}
export const IcosahedronScene = () => <DisciplineCanvas><IcosahedronShape /></DisciplineCanvas>;

function BoxShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[1.5, 0.5, 0]} scale={2}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <SapphireGlassMaterial />
    </mesh>
  );
}
export const BoxScene = () => <DisciplineCanvas><BoxShape /></DisciplineCanvas>;

function RingShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[-1.5, 1, 0]} scale={2.2}>
      <ringGeometry args={[0.5, 1.2, 32]} />
      <MatteBlueMaterial />
    </mesh>
  );
}
export const RingScene = () => <DisciplineCanvas><RingShape /></DisciplineCanvas>;

function CapsuleShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[0, 1.5, 0]} scale={2}>
      <capsuleGeometry args={[0.8, 1.5, 32, 32]} />
      <FastGlassMaterial />
    </mesh>
  );
}
export const CapsuleScene = () => <DisciplineCanvas><CapsuleShape /></DisciplineCanvas>;

function TorusKnotShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[2, 1, 0]} scale={1.5}>
      <torusKnotGeometry args={[1, 0.3, 100, 16]} />
      <SapphireGlassMaterial />
    </mesh>
  );
}
export const TorusKnotScene = () => <DisciplineCanvas><TorusKnotShape /></DisciplineCanvas>;

function TetrahedronShape() {
  const ref = useBounce(1.5);
  return (
    <mesh ref={ref} position={[-2, 0.5, 0]} scale={2.5}>
      <tetrahedronGeometry args={[1.2, 0]} />
      <MatteBlueMaterial />
    </mesh>
  );
}
export const TetrahedronScene = () => <DisciplineCanvas><TetrahedronShape /></DisciplineCanvas>;

// ── Registry ─────────────────────────────────────────────────────────

export const sceneRegistry: Record<string, React.FC> = {
  BrandingScene,
  FilmScene,
  VFXScene,
  SoftwareScene,
  PerformanceScene,
  AIScene,
  IcosahedronScene,
  BoxScene,
  RingScene,
  CapsuleScene,
  TorusKnotScene,
  TetrahedronScene
};
