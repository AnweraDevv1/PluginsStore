"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { authHeaders } from "@/lib/clientAuth";

export default function GuidePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check", { headers: authHeaders() }).then(r=>r.json()).then(d=>{
      if (!d.authenticated) router.replace("/");
      else setChecked(true);
    }).catch(()=>router.replace("/"));
  }, [router]);

  if (!checked) {
    return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono">загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <Navbar />

      <div className="pt-[88px]">
        {/* Header */}
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-16 border-b border-zinc-900">
          <div className="inline-flex px-3 py-1 rounded-full bg-[#ccff00] text-black text-[11px] font-black tracking-widest">БЕСПЛАТНЫЙ ХОСТИНГ ГАЙД • 2026</div>
          <h1 className="mt-6 text-[36px] md:text-[56px] font-black leading-[0.9] tracking-[-0.04em]">КАК ЗАЛИТЬ ЭТО<br/>ПОРТФОЛИО НА<br/><span className="text-[#ccff00]">БЕСПЛАТНЫЙ</span> ХОСТИНГ</h1>
          <p className="mt-6 text-[16px] leading-relaxed text-zinc-400 max-w-[640px]">Это портфолио сделано на Next.js + PostgreSQL. Его можно задеплоить бесплатно за 10 минут. Я собрал 3 лучших варианта — выбирай любой.</p>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-12 grid lg:grid-cols-[1fr_320px] gap-12">
          <div className="space-y-12">
            {/* Option 1 */}
            <div className="rounded-[24px] bg-[#151518] border border-zinc-800 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black">1</div>
                  <div>
                    <h2 className="font-black text-[20px]">Vercel — РЕКОМЕНДУЮ ★</h2>
                    <div className="text-[12px] font-mono text-zinc-500">самый простой, быстрый, для Next.js</div>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-zinc-300">
                  <div className="flex gap-3">
                    <span className="text-[#ccff00] font-mono">ШАГ 1</span>
                    <span>Залей код на GitHub. Создай репозиторий <span className="font-mono bg-zinc-900 px-1.5 py-0.5 rounded">artem-portfolio</span> и запушь:</span>
                  </div>
                  <div className="bg-[#0a0a0b] border border-zinc-800 rounded-xl p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
                    git init<br/>git add .<br/>git commit -m "initial"<br/>git branch -M main<br/>git remote add origin https://github.com/USERNAME/artem-portfolio.git<br/>git push -u origin main
                  </div>

                  <div className="flex gap-3">
                    <span className="text-[#ccff00] font-mono">ШАГ 2</span>
                    <span>Зайди на <a href="https://vercel.com" target="_blank" className="text-white underline">vercel.com</a> → Login with GitHub → New Project → выбери репозиторий.</span>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-[#ccff00] font-mono">ШАГ 3</span>
                    <span>Добавь переменные окружения в Vercel Dashboard → Settings → Environment Variables:</span>
                  </div>
                  <div className="bg-[#0a0a0b] border border-zinc-800 rounded-xl p-4 font-mono text-[12px]">
                    <div>DATABASE_URL=postgresql://... (возьми бесплатно ниже)</div>
                    <div>AUTH_SECRET=любая_длинная_строка_секрета</div>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-[#ccff00] font-mono">ШАГ 4 — БАЗА</span>
                    <span>Бесплатная PostgreSQL:</span>
                  </div>
                  <ul className="list-disc pl-6 text-zinc-400 space-y-1 text-[13px]">
                    <li><b className="text-white">Neon</b> — neon.tech → Create Project → скопируй DATABASE_URL (бесплатно 0.5GB)</li>
                    <li><b className="text-white">Supabase</b> — supabase.com → New Project → Database → Connection string</li>
                    <li><b className="text-white">Vercel Postgres</b> — прямо в Vercel: Storage → Create Postgres</li>
                  </ul>

                  <div className="flex gap-3">
                    <span className="text-[#ccff00] font-mono">ШАГ 5</span>
                    <span>Deploy! Vercel сам соберёт. После деплоя открой <span className="font-mono text-white">/api/health</span> — должен вернуть ok. Готово! Твой сайт на <span className="text-white">https://твой-домен.vercel.app</span></span>
                  </div>
                </div>
              </div>

              <div className="bg-[#ccff00] text-black px-8 py-4 font-mono text-[12px] flex items-center justify-between">
                <span>💰 Бесплатно: 100GB трафика, SSL, домен .vercel.app, авто-деплои из GitHub</span>
                <span className="font-black">ЛУЧШИЙ ВЫБОР</span>
              </div>
            </div>

            {/* Option 2 */}
            <div className="rounded-[24px] bg-[#151518] border border-zinc-800 p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-black">2</div>
                <h2 className="font-black text-[20px]">Netlify</h2>
              </div>
              <div className="mt-4 text-[14px] leading-relaxed text-zinc-400 space-y-3">
                <p>Тоже очень просто, но Vercel лучше оптимизирован под Next.js.</p>
                <div className="bg-[#0a0a0b] border border-zinc-800 rounded-xl p-4 font-mono text-[12px]">
                  1. netlify.com → Add new site → Import from GitHub<br/>
                  2. Build command: npm run build<br/>
                  3. Publish directory: .next (или оставь дефолт Next.js plugin)<br/>
                  4. Добавь env переменные DATABASE_URL<br/>
                  5. Deploy
                </div>
                <p className="text-[12px]">Поддерживает Next.js через @netlify/plugin-nextjs — ставится автоматически.</p>
              </div>
            </div>

            {/* Option 3 */}
            <div className="rounded-[24px] bg-[#151518] border border-zinc-800 p-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 text-white flex items-center justify-center font-black">3</div>
                <h2 className="font-black text-[20px]">Railway / Render + Cloudflare</h2>
              </div>
              <div className="mt-4 text-[14px] leading-relaxed text-zinc-400 space-y-3">
                <p>Если нужен Docker и полный контроль:</p>
                <div className="bg-[#0a0a0b] border border-zinc-800 rounded-xl p-4 font-mono text-[12px]">
                  railway.app → New Project → Deploy from GitHub<br/>
                  Добавь PostgreSQL плагин (бесплатно)<br/>
                  Переменная DATABASE_URL подтянется автоматически<br/>
                  <br/>
                  Или: render.com → New Web Service → подключи GitHub
                </div>
                <p className="text-[12px]">Railway даёт $5 бесплатных кредитов в месяц, Render — 750 часов бесплатно. Подключи Cloudflare для CDN.</p>
              </div>
            </div>

            {/* Files */}
            <div className="rounded-[24px] bg-[#0f0f11] border border-zinc-900 p-8">
              <h3 className="font-black text-[18px]">📁 А как хранить файлы .jar и скрины бесплатно?</h3>
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-[13px]">
                <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800">
                  <div className="font-bold text-white">Вариант А: GitHub Releases</div>
                  <div className="text-zinc-500 mt-1">Загрузи .jar в Releases своего репозитория — прямая ссылка бессрочно, без лимитов. Рекомендую.</div>
                </div>
                <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800">
                  <div className="font-bold text-white">Вариант Б: Cloudinary / Imgur</div>
                  <div className="text-zinc-500 mt-1">Для скринов — Cloudinary (25GB бесплатно) или Imgur. В админке просто вставляешь URL.</div>
                </div>
                <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800">
                  <div className="font-bold text-white">Вариант В: /public/uploads</div>
                  <div className="text-zinc-500 mt-1">В этом сайте есть загрузка файлов через /api/upload → сохраняется в /public/uploads. На Vercel работает, но файлы могут сбрасываться. Используй для теста.</div>
                </div>
                <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800">
                  <div className="font-bold text-white">Вариант Г: Modrinth + CurseForge</div>
                  <div className="text-zinc-500 mt-1">Загружай моды туда и ставь ссылки в портфолио — двойной трафик + доверие.</div>
                </div>
              </div>
            </div>

            {/* Domain */}
            <div className="rounded-[24px] bg-white text-black p-8">
              <h3 className="font-black text-[20px]">🌐 Бесплатный домен?</h3>
              <div className="mt-4 text-[14px] leading-relaxed text-zinc-700 space-y-2">
                <p>• Vercel даёт <b>твой-проект.vercel.app</b> бесплатно с SSL.</p>
                <p>• Хочешь свой домен? Бесплатно: <b>freedns.afraid.org</b>, <b>is-a.dev</b> (через GitHub), или купи <b>.com за $1</b> на первый год в Cloudflare/Namecheap.</p>
                <p>• Подключение: Vercel Dashboard → Domains → Add → следуй инструкции (CNAME).</p>
              </div>
              <div className="mt-6 flex gap-3">
                <a href="https://vercel.com/docs/concepts/projects/domains" target="_blank" className="h-10 px-5 rounded-full bg-black text-white font-bold text-[13px] flex items-center">дока Vercel →</a>
                <Link href="/admin" className="h-10 px-5 rounded-full border border-zinc-300 text-[13px] font-bold flex items-center">в админку →</Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 self-start sticky top-[100px]">
            <div className="rounded-[20px] bg-[#151518] border border-zinc-800 p-6">
              <div className="font-bold text-[14px] mb-4">Чек-лист перед деплоем</div>
              <div className="space-y-3 text-[12px] font-mono text-zinc-400">
                {[
                  "Сменил AUTH_SECRET в .env",
                  "Создал БД Neon/Supabase и взял DATABASE_URL",
                  "Проверил npm run build локально",
                  "Запушил на GitHub",
                  "Добавил env в Vercel",
                  "Зашёл в /admin и добавил первый проект",
                  "Проверил скачку и скрины",
                ].map((item,i)=>(
                  <label key={i} className="flex gap-2 cursor-pointer group">
                    <input type="checkbox" className="mt-0.5" />
                    <span className="group-hover:text-white transition">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] bg-[#ccff00] text-black p-6">
              <div className="font-black text-[16px] leading-tight">Нужна помощь с деплоем?</div>
              <div className="text-[13px] mt-2 leading-relaxed">Напиши мне, помогу бесплатно за 10 минут задеплоить.</div>
              <a href="https://t.me/rev1lss" target="_blank" rel="noopener noreferrer" className="mt-4 w-full h-10 rounded-full bg-black text-white font-bold text-[13px] flex items-center justify-center">Telegram: @rev1lss →</a>
            </div>

            <div className="rounded-[20px] bg-[#0f0f11] border border-zinc-900 p-6 font-mono text-[11px] text-zinc-500 leading-relaxed">
              <div className="text-white font-bold mb-2">Переменные окружения .env</div>
              DATABASE_URL=postgresql://user:pass@host/db<br/>
              AUTH_SECRET=твоя_супер_длинная_строка_123<br/>
              <div className="mt-3 text-[10px]">Не коммить .env в GitHub! Используй Vercel ENV.</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
