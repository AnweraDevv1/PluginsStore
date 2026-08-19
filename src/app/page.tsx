"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectCard from "@/components/ProjectCard";
import AnimatedCode from "@/components/AnimatedCode";
import Reveal from "@/components/Reveal";
import Link from "next/link";
import { normalizeImageUrl } from "@/lib/media";

interface Project {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  version: string;
  minecraftVersion: string;
  downloadUrl: string;
  githubUrl?: string;
  banner?: string;
  videoUrl?: string;
  screenshots: string[];
  tags: string[];
  features: string[];
  downloads: number;
  fileSize: string;
  featured: boolean;
}

const CATEGORIES = [
  { id: "all", label: "все" },
  { id: "plugin", label: "plugins" },
  { id: "mod", label: "mods" },
  { id: "datapack", label: "datapacks" },
  { id: "library", label: "libs" },
  { id: "tool", label: "tools" },
];



export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [codeAnimation, setCodeAnimation] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(r=>r.json())
      .then(data=> {
        if (Array.isArray(data) && data.length>0) setProjects(data);
        setLoading(false);
      })
      .catch(()=>{ setLoading(false); });
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then(r=>r.json())
      .then(d=>{ if (typeof d.codeAnimation === "boolean") setCodeAnimation(d.codeAnimation); })
      .catch(()=>{});
  }, []);

  const filtered = projects.filter(p=>{
    const matchCat = filter==="all" || p.category===filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.shortDescription.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t=>t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const featured = projects.filter(p=>p.featured);
  const totalDownloads = projects.reduce((s,p)=>s+p.downloads,0);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 selection:bg-[#ccff00] selection:text-black">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-[88px] overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-[0.4] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-[#ccff00]/[0.08] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 -left-40 w-[500px] h-[500px] bg-[#7000ff]/[0.12] rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-6 py-12 md:py-20 items-start">
            
            {/* Left content */}
            <Reveal delay={80}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                доступен для заказов
              </div>

              <h1 className="mt-8 text-[42px] md:text-[72px] lg:text-[84px] font-black leading-[0.9] tracking-[-0.04em]">
                ПЛАГИНЫ<br/>
                <span className="text-zinc-600">&</span> МОДЫ<br/>
                <span className="bg-gradient-to-r from-[#ccff00] to-[#00ff88] bg-clip-text text-transparent">КОТОРЫЕ</span><br/>ЛЮБЯТ
              </h1>

              <p className="mt-6 text-[16px] md:text-[18px] leading-relaxed text-zinc-400 max-w-[520px]">
                Я — разрабатываю <span className="text-white font-medium">Paper / Spigot плагины, Fabric / Forge моды</span> и инструменты для Minecraft серверов. От идеи до релиза на Modrinth & SpigotMC.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#projects" className="h-[48px] px-7 rounded-full bg-white text-black font-bold text-[14px] flex items-center gap-2 hover:bg-[#ccff00] transition-colors">
                  СМОТРЕТЬ ПРОЕКТЫ <span>↗</span>
                </a>
                <a href="https://t.me/rev1lss" target="_blank" rel="noopener noreferrer" className="h-[48px] px-7 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur text-white font-mono text-[13px] flex items-center hover:border-zinc-700 transition">
                  Telegram →
                </a>
              </div>

              {/* Stats bar — СТАТИЧНЫЕ значения. Меняй числа/текст ниже прямо тут */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-[440px] border-t border-zinc-900 pt-8">
                <div>
                  {/* ↳ Число проектов — поменяй на нужное */}
                  <div className="text-[32px] font-black leading-none">8+</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">проектов</div>
                </div>
                <div>
                  {/* ↳ Число скачиваний — поменяй на нужное */}
                  <div className="text-[32px] font-black leading-none">2.4k+</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">скачиваний</div>
                </div>
                <div>
                  {/* ↳ Рейтинг — поменяй на нужный */}
                  <div className="text-[32px] font-black leading-none">4.9/5</div>
                  <div className="text-[11px] font-mono text-zinc-500 mt-1 uppercase tracking-widest">рейтинг</div>
                </div>
              </div>
            </Reveal>

            {/* Right code window */}
            <Reveal delay={200} className="relative lg:sticky lg:top-[120px]">
              {/* Code card */}
              <div className="rounded-[24px] bg-[#121214] border border-zinc-800 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_80px_-20px_rgba(0,0,0,1)]">
                <div className="h-[46px] flex items-center justify-between px-5 border-b border-zinc-800 bg-[#18181b]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500/80" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-4 font-mono text-[12px] text-zinc-500">Main.java — AnweraDev</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[12px]">⚡</div>
                </div>

                <AnimatedCode animated={codeAnimation} />
              </div>

              {/* Floating badges */}
              <div className="absolute -right-6 top-[30%] hidden xl:flex items-center gap-2 px-3 py-2 rounded-full bg-[#ccff00] text-black text-[11px] font-black rotate-3 shadow-xl">
                <span className="w-5 h-5 rounded-full bg-black text-[#ccff00] flex items-center justify-center">✓</span> PAPER READY
              </div>
              <div className="absolute -left-8 bottom-[20%] hidden xl:flex items-center gap-2 px-3 py-2 rounded-full bg-white text-black text-[11px] font-bold -rotate-2 shadow-xl">
                FABRIC • FORGE • NEOFORGE
              </div>
            </Reveal>
          </div>

          {/* Marquee */}
          <Reveal delay={120}>
          <div className="border-y border-zinc-900 py-3 overflow-hidden bg-[#101012]">
            <div className="flex gap-8 animate-[marquee_30s_linear_infinite] whitespace-nowrap font-mono text-[12px] text-zinc-500">
              {Array.from({length: 6}).map((_,i)=>(
                <span key={i} className="flex gap-8">
                  <span>SPIGOT</span> <span className="text-zinc-700">•</span> <span>PAPER</span> <span className="text-zinc-700">•</span> <span className="text-white">FABRIC</span> <span className="text-zinc-700">•</span> <span>FORGE</span> <span className="text-zinc-700">•</span> <span>PURPUR</span> <span className="text-zinc-700">•</span> <span className="text-[#ccff00]">JAVA 17+</span> <span className="text-zinc-700">•</span> <span>KOTLIN</span> <span className="text-zinc-700">•</span> <span>OPTIMIZED</span> <span className="text-zinc-700">•</span>
                </span>
              ))}
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
        <Reveal delay={80}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase mb-3">/ избранные работы — 2023—2026</div>
            <h2 className="text-[36px] md:text-[48px] font-black tracking-[-0.03em] leading-[0.9]">ПРОЕКТЫ КОТОРЫЕ<br/><span className="text-zinc-600">ИСПОЛЬЗУЮТ</span></h2>
          </div>
          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c=>(
                <button key={c.id} onClick={()=>setFilter(c.id)} className={`px-4 h-8 rounded-full text-[12px] font-mono border transition ${filter===c.id ? "bg-white text-black border-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white"}`}>{c.label}</button>
              ))}
            </div>
            <div className="relative">
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="поиск по тегам, названию..." className="w-[280px] h-9 rounded-full bg-zinc-900 border border-zinc-800 px-4 text-[13px] font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700" />
            </div>
          </div>
        </div>
        </Reveal>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({length:6}).map((_,i)=><div key={i} className="h-[340px] rounded-[20px] bg-zinc-900/50 animate-pulse border border-zinc-800" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p,i)=> (
              <Reveal key={p.id} delay={Math.min(i*80, 320)} className="h-full">
                <ProjectCard project={p} />
              </Reveal>
            ))}
          </div>
        )}

        {filtered.length===0 && !loading && (
          <div className="py-20 text-center border border-dashed border-zinc-800 rounded-[20px] text-zinc-500 font-mono text-[14px]">
            {projects.length===0 ? "проектов пока нет — добавь первый в админке" : `ничего не найдено по запросу "${search}" в категории ${filter}`}
          </div>
        )}

        {featured.length>0 && (
          <Reveal delay={100}>
          <div className="mt-16 rounded-[24px] bg-gradient-to-br from-[#ccff00]/10 via-[#18181b] to-[#7000ff]/10 border border-zinc-800 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ccff00]/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex-1 relative">
              <div className="inline-flex px-3 py-1 rounded-full bg-[#ccff00] text-black text-[10px] font-black tracking-widest">ТОП ПРОЕКТ МЕСЯЦА</div>
              <h3 className="mt-4 text-[28px] font-black leading-tight">{featured[0].title}</h3>
              <p className="mt-3 text-zinc-400 leading-relaxed max-w-[520px]">{featured[0].shortDescription}</p>
              <div className="mt-6 flex gap-3">
                <Link href={`/projects/${featured[0].slug}`} className="px-5 h-10 rounded-full bg-white text-black font-bold text-[13px] flex items-center">открыть проект →</Link>
                <span className="px-4 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center text-[12px] font-mono text-zinc-400">⬇ {featured[0].downloads.toLocaleString()} загрузок</span>
              </div>
            </div>
            <div className="w-full md:w-[360px] aspect-[16/10] rounded-[16px] bg-zinc-900 overflow-hidden border border-zinc-800">
              {(featured[0].banner || featured[0].screenshots[0]) ? <img src={normalizeImageUrl(featured[0].banner || featured[0].screenshots[0])} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-5xl">🚀</div>}
            </div>
          </div>
          </Reveal>
        )}
      </section>

      {/* Stack */}
      <section id="stack" className="border-t border-zinc-900 bg-[#0f0f11]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-20">
          <div className="grid lg:grid-cols-[380px_1fr] gap-12">
            <Reveal delay={80}>
            <div>
              <div className="font-mono text-[11px] tracking-widest text-zinc-500 uppercase mb-4">/ стек и экспертиза</div>
              <h2 className="text-[32px] font-black leading-[0.9] tracking-tight">ДЕЛАЮ<br/>БЫСТРО,<br/>СТАБИЛЬНО,<br/>КРАСИВО.</h2>
              <p className="mt-4 text-[14px] leading-relaxed text-zinc-400">Оптимизация под Paper, асинхронная работа с БД, кроссплатформенность Fabric/Forge. Чистый код на Java 17+ / Kotlin.</p>
              <div className="mt-8 space-y-3 font-mono text-[12px]">
                {[
                  {k:"Средний тик", v:"0.02ms"},
                  {k:"Покрытие тестами", v:"94%"},
                  {k:"Версий майна", v:"1.16 — 1.21.11"},
                ].map(i=>(
                  <div key={i.k} className="flex justify-between border-b border-zinc-900 pb-2"><span className="text-zinc-500">{i.k}</span><span className="text-white font-bold">{i.v}</span></div>
                ))}
              </div>
            </div>
            </Reveal>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                {title:"Paper / Spigot Plugins", desc:"Ивенты, NMS, ProtocolLib, PAPI, кастомные миры, оптимизация чанков.", tags:["Java 17+","Paper API","Purpur","Async"], color:"from-[#ccff00]/20"},
                {title:"Fabric / Forge Mods", desc:"Миксины, рендер, сетевой код, кроссплатформа архитектура.", tags:["Mixins","Kotlin","Architectury"], color:"from-[#00ff88]/20"},
                {title:"Прокси & Инфраструктура", desc:"MySQL, кросс-сервер синхронизация данных и серверное API.", tags:["MySQL","API"], color:"from-[#7000ff]/20"},
                {title:"UI/UX & Tools", desc:"Веб-панели, конфиг генераторы, лендинги для модов, Discord боты.", tags:["Next.js","Tailwind","Discord.js"], color:"from-white/10"},
              ].map((card,i)=>(
                <Reveal key={card.title} delay={i*90} className="h-full">
                <div className={`h-full rounded-[20px] bg-gradient-to-br ${card.color} to-[#18181b] border border-zinc-800 p-6 relative overflow-hidden group hover:border-zinc-700 transition`}>
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full blur-[20px] group-hover:bg-white/10 transition" />
                  <h3 className="font-bold text-[16px]">{card.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{card.desc}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {card.tags.map(t=><span key={t} className="px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-zinc-300">{t}</span>)}
                  </div>
                </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-24">
        <Reveal delay={80}>
        <div className="rounded-[32px] bg-white text-black p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ccff00]/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          <div className="relative grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
            <div>
              <h2 className="text-[36px] md:text-[56px] font-black leading-[0.85] tracking-[-0.03em]">НУЖЕН<br/>ПЛАГИН<br/>ИЛИ МОД?</h2>
              <p className="mt-6 text-[16px] leading-relaxed text-zinc-600 max-w-[440px]">Пиши в Telegram, обсудим ТЗ и сроки — цену назову после обсуждения деталей, она всегда договорная. Делаю MVP за 2-3 дня, релиз с поддержкой.</p>
            </div>
            <div className="space-y-4">
              <a href="https://t.me/rev1lss" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between w-full h-[56px] px-6 rounded-full bg-black text-white font-bold hover:bg-zinc-900 transition">
                <span>Telegram: @rev1lss</span> <span>→</span>
              </a>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[16px] bg-zinc-100 p-4 border border-zinc-200">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">отвечаю за</div>
                  <div className="font-bold text-[18px] mt-1">2 часа</div>
                </div>
                <div className="rounded-[16px] bg-zinc-100 p-4 border border-zinc-200">
                  <div className="text-[11px] font-mono text-zinc-500 uppercase">цена</div>
                  <div className="font-bold text-[18px] mt-1">договорная</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  )
}
