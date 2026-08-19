"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setToken } from "@/lib/clientAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      // Сохраняем токен в localStorage как fallback (на случай если cookie не сохраняется)
      if (data.token) setToken(data.token);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#ccff00]/[0.07] rounded-full blur-[120px]" />

      <div className="w-full max-w-[420px] relative">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[#ccff00] flex items-center justify-center text-black font-black text-[16px]">An</div>
          <span className="font-bold tracking-tight">AnweraDev</span>
        </Link>

        <div className="rounded-[24px] bg-[#151518] border border-zinc-800 p-8 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="mb-6">
            <h1 className="text-[24px] font-black tracking-tight">Вход</h1>
            <p className="text-[13px] text-zinc-500 font-mono mt-2">Только для владельца</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">email</label>
              <input
                type="email"
                value={email}
                onChange={e=>setEmail(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-4 text-[14px] focus:outline-none focus:border-zinc-700 text-white"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2 block">пароль</label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                className="w-full h-11 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-4 text-[14px] focus:outline-none focus:border-zinc-700 text-white"
                placeholder="••••••••••••"
                required
              />
            </div>

            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">{error}</div>}

            <button disabled={loading} className="w-full h-11 rounded-full bg-white text-black font-bold text-[14px] hover:bg-[#ccff00] transition disabled:opacity-50">
              {loading ? "Вход..." : "ВОЙТИ →"}
            </button>

            <div className="pt-4 text-[11px] font-mono text-zinc-600 border-t border-zinc-900 leading-relaxed">
              <Link href="/" className="text-zinc-400 hover:text-white underline mt-2 inline-block">← на главную</Link>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center font-mono text-[11px] text-zinc-600">
          Защищено HMAC-SHA256 • 7 дней
        </div>
      </div>
    </div>
  )
}
