"use client";

import { useEffect, useRef, useState } from "react";

interface Stat { value: number; suffix: string; label: string; }

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const duration = 1600;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(Math.round(eased * value));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const STATS: Stat[] = [
  { value: 500, suffix: "+", label: "Довольных клиентов" },
  { value: 3,   suffix: "",  label: "Категории товаров" },
  { value: 100, suffix: "%", label: "Проверенное качество" },
  { value: 5,   suffix: "+", label: "Лет на рынке" },
];

export default function StatsCounter() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
      {STATS.map(({ value, suffix, label }) => (
        <div key={label} className="bg-[var(--bg-card)] flex flex-col items-center justify-center py-10 px-4 text-center">
          <p className="text-3xl sm:text-4xl font-black font-[family-name:var(--font-exo)] text-[var(--amber)] tracking-tight">
            <Counter value={value} suffix={suffix} />
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)] font-medium tracking-wide uppercase">{label}</p>
        </div>
      ))}
    </div>
  );
}
