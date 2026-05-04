"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(pointer: coarse)").matches) return;
    el.style.opacity = "1";
    const move = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top  = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9990,
        width: 600,
        height: 600,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle at center, rgba(232,160,32,0.07) 0%, rgba(74,158,221,0.03) 40%, transparent 65%)",
        opacity: 0,
        transition: "opacity 0.4s",
        willChange: "transform",
      }}
    />
  );
}
