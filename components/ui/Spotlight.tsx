"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ============================================================
 *  Spotlight + SparkleCursor
 *  - 柔和蓝色光晕跟随鼠标（适用于深色背景）
 *  - 移动光标时迸发彩色粒子火花
 *  - 移动端自动隐藏（无鼠标）
 * ============================================================ */

// ---------- 粒子物理 ----------

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

const PARTICLE_POOL: Particle[] = [];
const MAX_PARTICLES = 80;

function spawnParticles(x: number, y: number, count: number) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const speed = 1 + Math.random() * 4;
    if (PARTICLE_POOL.length < MAX_PARTICLES) {
      PARTICLE_POOL.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.8,
        size: 2 + Math.random() * 4,
        hue: 30 + Math.random() * 40, // 暖色系：橙-金色谱
      });
    }
  }
}

// ---------- 光晕层 ----------

function SpotlightGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -500, y: -500 });
  const current = useRef({ x: -500, y: -500 });

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    let raf = 0;

    function onMouseMove(e: MouseEvent) {
      target.current = { x: e.clientX, y: e.clientY };
    }
    function animate() {
      const t = target.current;
      const c = current.current;
      c.x += (t.x - c.x) * 0.05;
      c.y += (t.y - c.y) * 0.05;
      glow!.style.background = `radial-gradient(700px circle at ${c.x}px ${c.y}px, rgba(96,165,250,0.12), transparent 55%)`;
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    raf = requestAnimationFrame(animate);
    return () => { window.removeEventListener("mousemove", onMouseMove); cancelAnimationFrame(raf); };
  }, []);

  return <div ref={glowRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-10" />;
}

// ---------- 粒子画布 ----------

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -500, y: -500 });
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
    }
    resize();
    window.addEventListener("resize", resize);

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      const now = performance.now();
      // 每 40ms 产生一波粒子（移动越快、粒子越密）
      if (now - lastSpawnRef.current > 40) {
        lastSpawnRef.current = now;
        spawnParticles(e.clientX, e.clientY, 6);
      }
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (let i = PARTICLE_POOL.length - 1; i >= 0; i--) {
        const p = PARTICLE_POOL[i];
        p.life -= 0.016 / p.maxLife;
        if (p.life <= 0) {
          PARTICLE_POOL.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // 重力
        p.vx *= 0.99;

        const alpha = p.life * 0.9;
        // 光晕
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 100%, 65%, ${alpha * 0.3})`;
        ctx!.fill();
        // 核心
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 100%, 75%, ${alpha})`;
        ctx!.fill();
      }

      // 绘制光标处的静态光点
      const m = mouseRef.current;
      const gradient = ctx!.createRadialGradient(m.x, m.y, 0, m.x, m.y, 24);
      gradient.addColorStop(0, "rgba(251,191,36,0.5)");
      gradient.addColorStop(0.5, "rgba(251,146,60,0.2)");
      gradient.addColorStop(1, "rgba(251,146,60,0)");
      ctx!.beginPath();
      ctx!.arc(m.x, m.y, 24, 0, Math.PI * 2);
      ctx!.fillStyle = gradient;
      ctx!.fill();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-20" />;
}

// ---------- 入口组件 ----------

export default function Spotlight({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function update() { setShow(window.innerWidth >= 768); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      {show && (
        <>
          <SpotlightGlow />
          <ParticleCanvas />
        </>
      )}
      {children}
    </>
  );
}
