"use client";

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Materials ─────────────────────────────────────────────────────────

const SapphireGlassMaterial = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => setIsMobile(window.innerWidth < 768), []);
  
  return (
    <MeshTransmissionMaterial
      backside={!isMobile}
      samples={isMobile ? 1 : 2}
      resolution={isMobile ? 64 : 128}
      thickness={isMobile ? 1 : 2}
      chromaticAberration={0.03}
      anisotropy={0.1}
      distortion={isMobile ? 0.05 : 0.1}
      distortionScale={0.2}
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
};

const MatteBlueMaterial = () => (
  <meshStandardMaterial
    color="#1565D8"
    emissive="#0C2461"
    emissiveIntensity={0.4}
    roughness={0.2}
    metalness={0.8}
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

// ── Custom useInView Hook ─────────────────────────────────────────────
function useInView(ref: React.RefObject<Element | null>, options: IntersectionObserverInit = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options.rootMargin]);
  return inView;
}

// ── Reusable Canvas Wrapper ───────────────────────────────────────────

const SectionCanvas = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { rootMargin: '200px' });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div ref={ref} className="threeCanvasWrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      {inView && (
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 45 }} 
          dpr={isMobile ? [0.5, 1] : [1, 1.5]}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[-10, 10, 5]} intensity={2} color="#ffffff" />
          <directionalLight position={[10, -10, -5]} intensity={1} color="#1565D8" />
          {children}
          <Environment preset="city" />
        </Canvas>
      )}
    </div>
  );
};

// ── 1. Hero Scene (Anchor) ───────────────────────────────────────────

function HeroAnchor() {
  const ref = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isDesktop = viewport.width > 8;

  useFrame(() => {
    if (!ref.current) return;
    const scrollY = window.scrollY;
    ref.current.rotation.y = (scrollY * 0.002) + (Date.now() * 0.0005);
    ref.current.rotation.x = Date.now() * 0.0003;
    ref.current.position.y = scrollY * 0.002;
  });

  const x = isDesktop ? viewport.width * 0.25 : 0;
  return (
    <group ref={ref} position={[x, 0, -2]}>
      <Float speed={2.5} rotationIntensity={2} floatIntensity={3}>
        <mesh scale={isDesktop ? 1.8 : 1.2}>
          <torusKnotGeometry args={[1, 0.4, 128, 32, 2, 3]} />
          <SapphireGlassMaterial />
        </mesh>
      </Float>
    </group>
  );
}

export function HeroScene() {
  return (
    <SectionCanvas>
      <HeroAnchor />
    </SectionCanvas>
  );
}

// ── 2. Services Scene (Cubes) ────────────────────────────────────────

function ServicesShapes() {
  const ref = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isDesktop = viewport.width > 8;
  
  const shapesRef = useRef(Array.from({ length: 5 }).map(() => ({
    pos: new THREE.Vector3(
      1 + Math.random() * 3, // Start on the right side
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 2 - 1
    ),
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.01
    ),
    rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
    rotSpeed: new THREE.Euler((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
    scale: 0.6 + Math.random() * 0.8
  })));

  useFrame(() => {
    if (!ref.current) return;
    
    // Box dimensions for Services (Cubes): Right side of the screen
    const rightBound = viewport.width / 2;
    // Left wall: pushed to the right to avoid the large text
    const leftBound = isDesktop ? (viewport.width * 0.15) : -rightBound; 
    const topBound = viewport.height / 2;
    const bottomBound = -topBound;

    ref.current.children.forEach((child, i) => {
      const state = shapesRef.current[i];
      
      // Update position
      state.pos.add(state.vel);
      
      // Bounce X (Text wall is on the left)
      if (state.pos.x > rightBound) { state.pos.x = rightBound; state.vel.x *= -1; }
      if (state.pos.x < leftBound) { state.pos.x = leftBound; state.vel.x *= -1; }
      
      // Bounce Y
      if (state.pos.y > topBound) { state.pos.y = topBound; state.vel.y *= -1; }
      if (state.pos.y < bottomBound) { state.pos.y = bottomBound; state.vel.y *= -1; }
      
      // Update rotation
      state.rot.x += state.rotSpeed.x;
      state.rot.y += state.rotSpeed.y;
      state.rot.z += state.rotSpeed.z;

      // Apply to mesh
      const floatGroup = child as THREE.Group;
      if (floatGroup && floatGroup.children[0]) {
        floatGroup.position.copy(state.pos);
        floatGroup.children[0].rotation.copy(state.rot);
      }
    });
  });

  return (
    // Group stays at origin, children move freely in world space
    <group ref={ref}>
      {shapesRef.current.map((shape, i) => (
        <group key={i} position={shape.pos}>
          <mesh rotation={shape.rot} scale={shape.scale}>
            <boxGeometry args={[1, 1, 1]} />
            {i % 2 === 0 ? <FastGlassMaterial /> : <MatteBlueMaterial />}
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function ServicesScene() {
  return (
    <SectionCanvas>
      <ServicesShapes />
    </SectionCanvas>
  );
}

// ── 3. Statement Scene (Diamond) ─────────────────────────────────────

function StatementShapes() {
  const ref = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isDesktop = viewport.width > 8;

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.003;
      ref.current.rotation.z += 0.001;
    }
  });

  return (
    <group ref={ref} position={[isDesktop ? -viewport.width * 0.25 : 0, 0, -2]}>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <mesh scale={isDesktop ? 2.0 : 1.5}>
          <icosahedronGeometry args={[1, 0]} />
          <FastGlassMaterial />
        </mesh>
      </Float>
    </group>
  );
}

export function StatementScene() {
  return (
    <SectionCanvas>
      <StatementShapes />
    </SectionCanvas>
  );
}

// ── 4. Process Scene (Rings) ─────────────────────────────────────────

function ProcessShapes() {
  const ref = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const isDesktop = viewport.width > 8;
  
  const shapesRef = useRef(Array.from({ length: 3 }).map(() => ({
    pos: new THREE.Vector3(
      1 + Math.random() * 2, // Start Top Right
      1 + Math.random() * 2,
      (Math.random() - 0.5) * 2 - 1
    ),
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.01
    ),
    rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
    rotSpeed: new THREE.Euler((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
    scale: 0.7 + Math.random() * 0.5
  })));

  useFrame(() => {
    if (!ref.current) return;

    // Box dimensions for Process (Rings): Top Right corner
    const rightBound = viewport.width / 2;
    // Left wall: center of screen to avoid left text
    const leftBound = isDesktop ? 0 : -rightBound; 
    const topBound = viewport.height / 2;
    // Bottom wall: above the process steps
    const bottomBound = isDesktop ? (viewport.height * -0.1) : -topBound;

    ref.current.children.forEach((child, i) => {
      const state = shapesRef.current[i];
      
      // Update position
      state.pos.add(state.vel);
      
      // Bounce X (Text wall is on the left)
      if (state.pos.x > rightBound) { state.pos.x = rightBound; state.vel.x *= -1; }
      if (state.pos.x < leftBound) { state.pos.x = leftBound; state.vel.x *= -1; }
      
      // Bounce Y (Text wall is on the bottom)
      if (state.pos.y > topBound) { state.pos.y = topBound; state.vel.y *= -1; }
      if (state.pos.y < bottomBound) { state.pos.y = bottomBound; state.vel.y *= -1; }
      
      // Update rotation
      state.rot.x += state.rotSpeed.x;
      state.rot.y += state.rotSpeed.y;
      state.rot.z += state.rotSpeed.z;

      // Apply to mesh
      const group = child as THREE.Group;
      if (group && group.children[0]) {
        group.position.copy(state.pos);
        group.children[0].rotation.copy(state.rot);
      }
    });
  });

  return (
    // Group stays at origin, children move freely in world space
    <group ref={ref}>
      {shapesRef.current.map((shape, i) => (
        <group key={i} position={shape.pos}>
          <mesh rotation={shape.rot} scale={shape.scale}>
            <torusGeometry args={[1, 0.15, 16, 48]} />
            <MatteBlueMaterial />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function ProcessScene() {
  return (
    <SectionCanvas>
      <ProcessShapes />
    </SectionCanvas>
  );
}

// ── 5. New 12 Premium 3D Models Library ──────────────────────────────

// Abstract Group Helpers
function createShapeState(count: number, spread: number) {
  return Array.from({ length: count }).map(() => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread),
    rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
    rotSpeed: new THREE.Euler((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02),
    scale: 0.5 + Math.random() * 1.5
  }));
}

// Model 1
function BrandingShapes() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.005; });
  return (
    <group ref={ref} position={[0, 0, -2]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh><torusGeometry args={[1.5, 0.4, 32, 64]} /><SapphireGlassMaterial /></mesh>
        <mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[1.2, 0.1, 16, 64]} /><MatteBlueMaterial /></mesh>
      </Float>
    </group>
  );
}
export function BrandingScene() { return <SectionCanvas><BrandingShapes /></SectionCanvas>; }

// Model 2
function FilmShapes() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) { ref.current.rotation.x += 0.003; ref.current.rotation.y += 0.002; } });
  return (
    <group ref={ref} position={[0, 0, -2]}>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <mesh><octahedronGeometry args={[1.8, 0]} /><FastGlassMaterial /></mesh>
        <mesh scale={0.5}><octahedronGeometry args={[1.8, 0]} /><MatteBlueMaterial /></mesh>
      </Float>
    </group>
  );
}
export function FilmScene() { return <SectionCanvas><FilmShapes /></SectionCanvas>; }

// Model 3
function VFXShapes() {
  const ref = useRef<THREE.Group>(null);
  const shapes = useRef(createShapeState(10, 4));
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.001;
    ref.current.children.forEach((child, i) => {
      child.rotation.x += shapes.current[i].rotSpeed.x;
      child.rotation.y += shapes.current[i].rotSpeed.y;
    });
  });
  return (
    <group ref={ref} position={[0, 0, -3]}>
      {shapes.current.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale * 0.4}>
          <sphereGeometry args={[1, 32, 32]} />
          {i % 2 === 0 ? <SapphireGlassMaterial /> : <FastGlassMaterial />}
        </mesh>
      ))}
    </group>
  );
}
export function VFXScene() { return <SectionCanvas><VFXShapes /></SectionCanvas>; }

// Model 4
function SoftwareShapes() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) ref.current.rotation.y -= 0.004; });
  return (
    <group ref={ref} position={[0, 0, -2]}>
      <Float speed={1} rotationIntensity={0.5} floatIntensity={2}>
        <mesh><boxGeometry args={[2, 2, 2]} /><FastGlassMaterial /></mesh>
        <mesh><icosahedronGeometry args={[1.2, 0]} /><MatteBlueMaterial /></mesh>
      </Float>
    </group>
  );
}
export function SoftwareScene() { return <SectionCanvas><SoftwareShapes /></SectionCanvas>; }

// Model 5
function PerformanceShapes() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) { ref.current.rotation.z += 0.002; ref.current.rotation.x += 0.002; } });
  return (
    <group ref={ref} position={[0, 0, -2]}>
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <mesh><torusKnotGeometry args={[1, 0.3, 128, 16]} /><SapphireGlassMaterial /></mesh>
      </Float>
    </group>
  );
}
export function PerformanceScene() { return <SectionCanvas><PerformanceShapes /></SectionCanvas>; }

// Model 6
function AIShapes() {
  const ref = useRef<THREE.Group>(null);
  const shapes = useRef(createShapeState(6, 3));
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.002;
  });
  return (
    <group ref={ref} position={[0, 0, -2]}>
      {shapes.current.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot} scale={s.scale * 0.7}>
          <tetrahedronGeometry args={[1, 0]} />
          <FastGlassMaterial />
        </mesh>
      ))}
      <mesh><sphereGeometry args={[0.5, 32, 32]} /><MatteBlueMaterial /></mesh>
    </group>
  );
}
export function AIScene() { return <SectionCanvas><AIShapes /></SectionCanvas>; }

// Model 7
export function IcosahedronScene() {
  return (
    <SectionCanvas>
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[0, 0, -2]} scale={1.8}>
          <icosahedronGeometry args={[1, 1]} />
          <SapphireGlassMaterial />
        </mesh>
      </Float>
    </SectionCanvas>
  );
}

// Model 8
function BoxShapes() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { if (ref.current) { ref.current.rotation.x += 0.002; ref.current.rotation.y += 0.003; } });
  return (
    <group ref={ref} position={[0, 0, -2]}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <mesh scale={1.5}><boxGeometry args={[1, 1, 1]} /><FastGlassMaterial /></mesh>
        <mesh scale={0.7} position={[1, 1, 1]}><boxGeometry args={[1, 1, 1]} /><MatteBlueMaterial /></mesh>
        <mesh scale={0.5} position={[-1, -1, -1]}><boxGeometry args={[1, 1, 1]} /><SapphireGlassMaterial /></mesh>
      </Float>
    </group>
  );
}
export function BoxScene() { return <SectionCanvas><BoxShapes /></SectionCanvas>; }

// Model 9
export function RingScene() {
  return (
    <SectionCanvas>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <group position={[0, 0, -2]}>
          <mesh rotation={[Math.PI/4, 0, 0]}><torusGeometry args={[1.5, 0.05, 16, 100]} /><MatteBlueMaterial /></mesh>
          <mesh rotation={[-Math.PI/4, 0, 0]}><torusGeometry args={[1.2, 0.1, 16, 100]} /><FastGlassMaterial /></mesh>
          <mesh rotation={[0, Math.PI/4, 0]}><torusGeometry args={[0.9, 0.2, 16, 100]} /><SapphireGlassMaterial /></mesh>
        </group>
      </Float>
    </SectionCanvas>
  );
}

// Model 10
export function CapsuleScene() {
  return (
    <SectionCanvas>
      <Float speed={2} rotationIntensity={2} floatIntensity={2}>
        <mesh position={[0, 0, -2]} scale={1.2}>
          <capsuleGeometry args={[1, 1, 16, 32]} />
          <SapphireGlassMaterial />
        </mesh>
      </Float>
    </SectionCanvas>
  );
}

// Model 11
export function TorusKnotScene() {
  return (
    <SectionCanvas>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[0, 0, -2]} scale={1.5}>
          <torusKnotGeometry args={[1, 0.25, 100, 16, 3, 4]} />
          <FastGlassMaterial />
        </mesh>
      </Float>
    </SectionCanvas>
  );
}

// Model 12
export function TetrahedronScene() {
  return (
    <SectionCanvas>
      <Float speed={3} rotationIntensity={2} floatIntensity={3}>
        <group position={[0, 0, -2]}>
          <mesh scale={1.8}><tetrahedronGeometry args={[1, 0]} /><SapphireGlassMaterial /></mesh>
          <mesh scale={1.8} rotation={[Math.PI, 0, 0]}><tetrahedronGeometry args={[1, 0]} /><FastGlassMaterial /></mesh>
        </group>
      </Float>
    </SectionCanvas>
  );
}
