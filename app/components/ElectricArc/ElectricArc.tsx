"use client";

import { useEffect, useRef } from 'react';
import styles from './ElectricArc.module.css';

/*
  SIGNATURE ELEMENT: Electric Arc Particle System
  MOVEMENT: Electric Alchemy
  
  A WebGL-like particle system using Canvas 2D that simulates
  electric arcs connecting nodes in a constellation pattern.
  Nodes drift slowly. Mouse proximity creates new connections.
  Arcs pulse, flicker, and glow with electric cyan.
  
  Seeded randomness ensures reproducible beauty.
*/

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Arc {
  from: number;
  to: number;
  intensity: number;
  flickerPhase: number;
  flickerSpeed: number;
}

export default function ElectricArc() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const seed = 42;
    const rand = mulberry32(seed);

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const nodeCount = width < 768 ? 12 : 24;

    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: rand() * width,
      y: rand() * height,
      vx: (rand() - 0.5) * 0.15,
      vy: (rand() - 0.5) * 0.15,
      radius: 2 + rand() * 3,
      pulsePhase: rand() * Math.PI * 2,
      pulseSpeed: 0.5 + rand() * 1.5,
    }));

    const maxDist = Math.min(width, height) * 0.35;
    const arcs: Arc[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          arcs.push({
            from: i,
            to: j,
            intensity: 1 - dist / maxDist,
            flickerPhase: rand() * Math.PI * 2,
            flickerSpeed: 2 + rand() * 4,
          });
        }
      }
    }

    let mouseX = -1000;
    let mouseY = -1000;
    let mouseActive = false;
    let mouseTimeout: ReturnType<typeof setTimeout> | null = null;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
      if (mouseTimeout) clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => { mouseActive = false; }, 100);
    };
    canvas.addEventListener('mousemove', onMouseMove);

    let time = 0;
    let raf = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(
      (entries) => { isVisible = entries[0].isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        node.pulsePhase += node.pulseSpeed * 0.016;
      });

      arcs.forEach((arc) => {
        const n1 = nodes[arc.from];
        const n2 = nodes[arc.to];

        arc.flickerPhase += arc.flickerSpeed * 0.016;
        const flicker = Math.sin(arc.flickerPhase) * 0.5 + 0.5;
        const flicker2 = Math.sin(arc.flickerPhase * 1.7 + 1) * 0.5 + 0.5;
        const combinedFlicker = flicker * flicker2;

        let mouseBoost = 0;
        if (mouseActive) {
          const mdx1 = mouseX - n1.x;
          const mdy1 = mouseY - n1.y;
          const mdx2 = mouseX - n2.x;
          const mdy2 = mouseY - n2.y;
          const dist1 = Math.sqrt(mdx1 * mdx1 + mdy1 * mdy1);
          const dist2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2);
          const avgDist = (dist1 + dist2) / 2;
          const mouseRange = 250;
          if (avgDist < mouseRange) {
            mouseBoost = (1 - avgDist / mouseRange) * 0.8;
          }
        }

        const alpha = (arc.intensity * 0.35 + mouseBoost * 0.65) * combinedFlicker;
        if (alpha < 0.02) return;

        const midX = (n1.x + n2.x) / 2;
        const midY = (n1.y + n2.y) / 2;
        const offsetX = Math.sin(time * 2 + arc.flickerPhase) * 15;
        const offsetY = Math.cos(time * 1.5 + arc.flickerPhase) * 10;

        const g = Math.floor(175 + alpha * 80);

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, n2.x, n2.y);
        ctx.strokeStyle = `rgba(0, ${g}, 255, ${alpha})`;
        ctx.lineWidth = 0.5 + arc.intensity * 1.5 + mouseBoost;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);
        ctx.quadraticCurveTo(midX + offsetX, midY + offsetY, n2.x, n2.y);
        ctx.strokeStyle = `rgba(0, 195, 255, ${alpha * 0.15})`;
        ctx.lineWidth = 4 + arc.intensity * 6;
        ctx.stroke();
      });

      nodes.forEach((node) => {
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const glowRadius = node.radius * (2 + pulse * 1.5);

        const glow = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, glowRadius * 3
        );
        glow.addColorStop(0, `rgba(0, 195, 255, ${0.2 + pulse * 0.1})`);
        glow.addColorStop(0.5, `rgba(0, 195, 255, ${0.05})`);
        glow.addColorStop(1, 'rgba(0, 195, 255, 0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, glowRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.4})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    const loop = () => {
      if (isVisible) draw();
      else raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      observer.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      if (mouseTimeout) clearTimeout(mouseTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-hidden="true"
    />
  );
}
