"use client";

import Link from "next/link";
import { User, Search, Menu, Heart, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header({ storeName = "AQUA STEEL" }: { storeName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const words = storeName.split(" ");
  const first = words[0];
  const rest = words.slice(1).join(" ");

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0d0d0f]/96 backdrop-blur border-b border-[var(--border)]" : "bg-transparent border-b border-[var(--border)]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-black tracking-widest uppercase font-[family-name:var(--font-exo)] text-white">
              {first}{rest && <span className="text-[var(--amber)]"> {rest}</span>}
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/catalog", label: "Каталог" },
              { href: "/catalog?filter=new", label: "Новинки" },
              { href: "/catalog?filter=sale", label: "Акции" },
              { href: "/#about", label: "О нас" },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-sm font-medium text-[#888] hover:text-white transition-colors tracking-wide uppercase">
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="hidden sm:flex p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors">
              <Search className="w-4.5 h-4.5 text-[#888] hover:text-white" />
            </button>
            <Link href="/account/wishlist" className="hidden sm:flex p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors">
              <Heart className="w-4.5 h-4.5 text-[#888] hover:text-white" />
            </Link>
            <Link href="/account" className="hidden sm:flex p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors">
              <User className="w-4.5 h-4.5 text-[#888] hover:text-white" />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-[#888]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1f1f1f] bg-[#0d0d0d] px-4 py-5 space-y-1">
          {[
            { href: "/catalog", label: "Каталог" },
            { href: "/catalog?filter=new", label: "Новинки" },
            { href: "/catalog?filter=sale", label: "Акции" },
            { href: "/#about", label: "О нас" },
            { href: "/account", label: "Личный кабинет" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className="block py-3 px-2 text-sm font-medium text-[#888] hover:text-white transition-colors tracking-wide uppercase border-b border-[#1a1a1a] last:border-0">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
