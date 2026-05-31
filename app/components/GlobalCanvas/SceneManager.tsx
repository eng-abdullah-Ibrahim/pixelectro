"use client";

import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroScene from './Scenes/HeroScene';
import BrandingScene from './Scenes/BrandingScene';
import VideoScene from './Scenes/VideoScene';
import VfxScene from './Scenes/VfxScene';
import SoftwareScene from './Scenes/SoftwareScene';

gsap.registerPlugin(ScrollTrigger);

export default function SceneManager() {
  const { camera } = useThree();
  const groupRef = useRef<any>(null);

  useEffect(() => {
    // Wait a brief moment for DOM to be fully ready for ScrollTrigger
    setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Move the world up as we scroll down to simulate camera falling
      gsap.to(groupRef.current.position, {
        y: 40, // 4 sections * 10 units distance
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        }
      });

      // Subtle camera rotation for cinematic feel during scroll
      gsap.to(camera.rotation, {
        x: -0.1,
        z: 0.05,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
        }
      });
    }, 100);

  }, [camera]);

  return (
    <group ref={groupRef}>
      <HeroScene position={[0, 0, 0]} />
      <BrandingScene position={[0, -10, 0]} />
      <VideoScene position={[0, -20, 0]} />
      <VfxScene position={[0, -30, 0]} />
      <SoftwareScene position={[0, -40, 0]} />
    </group>
  );
}
