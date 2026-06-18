"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * 鼠标跟随光点 — 产生一个跟随光标移动的柔和蓝色聚光效果
 */
function SpotlightGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -500, y: -500 });
  const currentRef = useRef({ x: -500, y: -500 });

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;
    let raf = 0;

    function onMouseMove(e: MouseEvent) {
      targetRef.current = { x: e.clientX, y: e.clientY };
    }

    function animate() {
      const t = targetRef.current;
      const c = currentRef.current;
      c.x += (t.x - c.x) * 0.06;
      c.y += (t.y - c.y) * 0.06;
      glow!.style.background = `radial-gradient(600px circle at ${c.x}px ${c.y}px, rgba(59,130,246,0.10), transparent 50%)`;
      raf = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={glowRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-10" />;
}

/**
 * 包裹 Hero 内容，添加光点效果（仅桌面端）
 */
export default function Spotlight({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(window.innerWidth >= 768);
    function onResize() { setShow(window.innerWidth >= 768); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      {show && <SpotlightGlow />}
      {children}
    </>
  );
}
