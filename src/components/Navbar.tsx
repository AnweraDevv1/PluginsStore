"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { authHeaders } from "@/lib/clientAuth";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handle);
    
    fetch("/api/auth/check", { headers: authHeaders() }).then(r=>r.json()).then(d=>setIsAdmin(d.authenticated)).catch(()=>{});

    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-zinc-800" : "bg-transparent border-b border-transparent"}`}>
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-[#ccff00] flex items-center justify-center text-black font-black text-[16px] group-hover:rotate-12 transition-transform">An</div>
          <div className="leading-none">
            <div className="font-bold tracking-tight text-[15px]">AnweraDev</div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">plugins & mods</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-[13px] font-mono text-zinc-400">
          <a href="#projects" className="hover:text-white transition">/проекты</a>
          <a href="#stack" className="hover:text-white transition">/стек</a>
          {isAdmin && (
            <Link href="/guide" className="hover:text-white transition">/хостинг</Link>
          )}
          {isAdmin ? (
            <Link href="/admin" className="px-4 py-2 rounded-full bg-white text-black font-bold hover:bg-[#ccff00] transition">АДМИНКА →</Link>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-full border border-zinc-800 hover:border-white hover:text-white transition">войти</Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-3">
          <Link href={isAdmin ? "/admin" : "/login"} className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center">→</Link>
        </div>
      </div>
    </nav>
  )
}
