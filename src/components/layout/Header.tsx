"use client";

import Link from "next/link";
import { ShoppingCart, User, Search, Menu, Heart, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { useState, useEffect } from "react";

export default function Header({ storeName = "KRZME HOME" }: { storeName?: string }) {
  const count = useCart((s) => s.count());
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const words = storeName.split(" ");
  const first = words[0];
  const rest = words.slice(1).join(" ");

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1f1f1f]" : "bg-[#0a0a0a] border-b border-[#1a1a1a]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold tracking-widest uppercase text-white">
              {first}{rest && <span className="text-[#3b82f6]"> {rest}</span>}
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
            <Link href="/cart" className="relative flex p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors">
              <ShoppingCart className="w-4.5 h-4.5 text-[#888] hover:text-white" />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3b82f6] text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
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
