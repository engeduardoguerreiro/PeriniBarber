"use client";

import { useEffect, useRef } from "react";

export function PremiumMouseEffects() {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let glowX = targetX;
    let glowY = targetY;
    let ringX = targetX;
    let ringY = targetY;

    function move(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;
      document.documentElement.style.setProperty("--mouse-x", `${targetX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${targetY}px`);
    }

    function tick() {
      glowX += (targetX - glowX) * 0.12;
      glowY += (targetY - glowY) * 0.12;
      ringX += (targetX - ringX) * 0.26;
      ringY += (targetY - ringY) * 0.26;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
      }

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      frame = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", move, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="pointer-glow" />
      <div ref={ringRef} className="pointer-ring" />
      <div className="page-spotlight" />
    </>
  );
}
