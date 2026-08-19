"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { authHeaders } from "@/lib/clientAuth";

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check", { headers: authHeaders() }).then(r=>r.json()).then(d=>setIsAdmin(d.authenticated)).catch(()=>{});
  }, []);
  return (
    <footer className="border-t border-zinc-900 mt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between gap-8 text-[13px] font-mono text-zinc-500">
        <div>
          <div className="text-white font-bold mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-[#ccff00] text-black flex items-center justify-center font-black text-[12px]">An</span>
            AnweraDev © {new Date().getFullYear()}
          </div>
          <div className="max-w-[360px] leading-relaxed">Разрабатываю плагины и моды которые используют тысячи серверов. Spigot • Paper • Fabric • Forge • Purpur</div>
        </div>
        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <div className="text-zinc-300">навигация</div>
            <a href="#projects" className="hover:text-white">проекты</a>
            {isAdmin && <Link href="/guide" className="hover:text-white">хостинг гайд</Link>}
            {isAdmin ? (
              <Link href="/admin" className="hover:text-white">админка</Link>
            ) : (
              <Link href="/login" className="hover:text-white">войти</Link>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-zinc-300">контакты</div>
            <a href="https://t.me/rev1lss" target="_blank" rel="noopener noreferrer" className="hover:text-white">Telegram: @rev1lss</a>
            <a href="https://github.com/AnweraDevv1" target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub: @AnweraDevv1</a>
          </div>
        </div>
      </div>
      <div className="h-[4px] w-full bg-gradient-to-r from-[#ccff00] via-[#00ff88] to-[#7000ff]" />
    </footer>
  )
}
