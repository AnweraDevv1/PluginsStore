"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { normalizeImageUrl, driveVideoEmbed, videoEmbedUrl } from "@/lib/media";

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
  modrinthUrl?: string;
  curseforgeUrl?: string;
  banner?: string;
  videoUrl?: string;
  screenshots: string[];
  tags: string[];
  features: string[];
  downloads: number;
  fileSize: string;
  featured: boolean;
}

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/projects/slug/${slug}`).then(r=>{
      if (!r.ok) throw new Error("not found");
      return r.json();
    }).then(data=>{
      setProject(data);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, [slug]);

  function handleDownload() {
    if (!project) return;
    // Прямая скачка через сервер: сам отдаёт файл или перенаправляет
    // на прямую ссылку (в т.ч. Google Drive -> uc?export=download)
    window.location.href = `/api/projects/slug/${project.slug}/download`;
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono">загрузка проекта...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] text-white flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🕳️</div>
        <div className="font-black text-[24px]">Проект не найден</div>
        <Link href="/" className="mt-6 px-6 h-10 rounded-full bg-white text-black font-bold flex items-center">← на главную</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      <Navbar />

      {/* Hero */}
      <div className="pt-[88px] pb-10 border-b border-zinc-900 bg-[#0f0f11] relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative">
          <Link href="/#projects" className="inline-flex items-center gap-2 text-[12px] font-mono text-zinc-500 hover:text-white mb-6">← назад к проектам</Link>
          
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#ccff00] text-black text-[11px] font-black tracking-widest uppercase">{project.category}</span>
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono">v{project.version}</span>
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono">{project.minecraftVersion}</span>
                {project.featured && <span className="px-3 py-1 rounded-full bg-white text-black text-[11px] font-black">FEATURED</span>}
              </div>

              <h1 className="text-[32px] md:text-[48px] font-black leading-[0.9] tracking-[-0.02em]">{project.title}</h1>
              <p className="mt-4 text-[16px] leading-relaxed text-zinc-400 max-w-[600px]">{project.shortDescription}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.tags.map(t=>(
                  <span key={t} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[12px] font-mono text-zinc-400">#{t}</span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={handleDownload} className="h-[52px] px-8 rounded-full bg-white text-black font-black text-[14px] flex items-center gap-3 hover:bg-[#ccff00] transition">
                  ⬇ СКАЧАТЬ {project.fileSize && `• ${project.fileSize}`}
                </button>
                {project.githubUrl && <a href={project.githubUrl} target="_blank" className="h-[52px] px-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center gap-2 text-[13px] font-mono hover:border-zinc-700">GitHub ↗</a>}
                {project.modrinthUrl && <a href={project.modrinthUrl} target="_blank" className="h-[52px] px-6 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] flex items-center gap-2 text-[13px] font-mono hover:bg-[#00ff88]/20">Modrinth ↗</a>}
              </div>

              <div className="mt-10 grid grid-cols-3 gap-px bg-zinc-800 rounded-[16px] overflow-hidden border border-zinc-800 max-w-[420px]">
                {[
                  {k:"скачиваний", v: project.downloads.toLocaleString()},
                  {k:"размер", v: project.fileSize},
                  {k:"версия", v: project.version},
                ].map(i=>(
                  <div key={i.k} className="bg-[#18181b] p-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{i.k}</div>
                    <div className="font-bold mt-1">{i.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery (скриншоты) */}
            <div className="space-y-3">
              <div className="aspect-[16/10] rounded-[20px] overflow-hidden bg-zinc-900 border border-zinc-800 relative group cursor-zoom-in" onClick={()=>{ if(project.screenshots[0]){ setActiveImg(normalizeImageUrl(project.screenshots[0])); setShowLightbox(true);} }}>
                {project.screenshots?.[0] ? (
                  <img src={normalizeImageUrl(project.screenshots[0])} className="w-full h-full object-cover group-hover:scale-[1.02] transition" alt={project.title} onError={e=>{(e.target as HTMLImageElement).parentElement!.classList.add("bg-zinc-900");}} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-6xl">🧩</div>
                )}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur text-[11px] font-mono">клик для увеличения</div>
              </div>

              {project.screenshots?.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {project.screenshots.slice(1,5).map((img,i)=>(
                    <button key={i} onClick={()=>{ setActiveImg(normalizeImageUrl(img)); setShowLightbox(true); }} className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
                      <img src={normalizeImageUrl(img)} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Баннер — отдельная плашка */}
      {project.banner && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10">
          <div className="relative rounded-[24px] overflow-hidden border border-zinc-800 bg-[#0f0f11] aspect-[21/9] min-h-[200px]">
            <img src={normalizeImageUrl(project.banner)} alt={`${project.title} — баннер`} className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.display="none";}} />
            <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur border border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-300">баннер</div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-12">
        {/* Content */}
        <div className="space-y-10">
          {/* Description */}
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 mb-4">/ описание</div>
            <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-h2:font-black prose-h2:text-[24px] prose-h3:font-bold">
              <div className="whitespace-pre-wrap leading-relaxed text-[15px] text-zinc-300">{project.description}</div>
            </div>
          </div>

          {/* Видео */}
          {project.videoUrl && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 mb-4">/ видео</div>
              <div className="rounded-[20px] overflow-hidden border border-zinc-800 bg-black aspect-video">
                <iframe
                  src={videoEmbedUrl(project.videoUrl)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  title={`${project.title} — видео`}
                />
              </div>
              <div className="text-[11px] font-mono text-zinc-500 mt-2">открыть в отдельном окне → <a href={driveVideoEmbed(project.videoUrl)} target="_blank" rel="noopener noreferrer" className="text-zinc-300 underline hover:text-white">полноэкранное видео</a></div>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length>0 && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 mb-4">/ фичи</div>
              <div className="grid gap-3">
                {project.features.map((f,i)=>(
                  <div key={i} className="flex gap-3 p-4 rounded-[12px] bg-[#151518] border border-zinc-800">
                    <span className="w-6 h-6 rounded-full bg-[#ccff00] text-black flex items-center justify-center text-[12px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                    <span className="text-[14px] leading-relaxed text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots full */}
          {project.screenshots?.length>0 && (
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 mb-4">/ скриншоты • {project.screenshots.length}</div>
              <div className="grid gap-4">
                {project.screenshots.map((img,i)=>(
                  <button key={i} onClick={()=>{ setActiveImg(normalizeImageUrl(img)); setShowLightbox(true); }} className="rounded-[16px] overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition">
                    <img src={normalizeImageUrl(img)} alt={`screenshot ${i}`} className="w-full" onError={e=>{(e.target as HTMLImageElement).style.opacity="0.2";}} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-[100px] self-start space-y-6">
          <div className="rounded-[20px] bg-[#151518] border border-zinc-800 p-6">
            <div className="font-bold text-[16px] mb-4">Скачать проект</div>
            <button onClick={handleDownload} className="w-full h-[48px] rounded-full bg-[#ccff00] text-black font-black text-[14px] hover:bg-[#d4ff33] transition">
              ⬇ СКАЧАТЬ {project.fileSize}
            </button>
            <div className="mt-3 text-[11px] font-mono text-zinc-500 text-center">Версия {project.version} • {project.minecraftVersion}</div>
            <div className="mt-6 space-y-2.5 text-[13px]">
              {project.githubUrl && <a href={project.githubUrl} target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0b] border border-zinc-800 hover:border-zinc-700"><span>GitHub исходники</span><span>↗</span></a>}
              {project.curseforgeUrl && <a href={project.curseforgeUrl} target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0b] border border-zinc-800 hover:border-zinc-700"><span>CurseForge</span><span>↗</span></a>}
              {project.modrinthUrl && <a href={project.modrinthUrl} target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0b] border border-zinc-800 hover:border-zinc-700"><span>Modrinth</span><span>↗</span></a>}
            </div>
          </div>

          <div className="rounded-[20px] bg-white text-black p-6">
            <div className="font-black text-[18px] leading-tight">Нужна кастомная версия под твой сервер?</div>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">Делаю доработки, интеграции с твоими плагинами, фиксы, оптимизацию.</p>
            <a href="https://t.me/rev1lss" target="_blank" rel="noopener noreferrer" className="mt-4 w-full h-11 rounded-full bg-black text-white font-bold text-[13px] flex items-center justify-center">Telegram: @rev1lss →</a>
          </div>

          <div className="rounded-[20px] bg-[#101012] border border-zinc-900 p-5 font-mono text-[11px] text-zinc-500">
            <div className="text-zinc-300 font-bold mb-2">/ install</div>
            <div className="bg-black rounded-lg p-3 text-zinc-300 leading-relaxed">
              <span className="text-zinc-600">$</span> /plugins помести .jar<br/>
              <span className="text-zinc-600">$</span> restart / reload<br/>
              <span className="text-[#00ff88]">✔ plugin enabled</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Lightbox */}
      {showLightbox && activeImg && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6" onClick={()=>setShowLightbox(false)}>
          <img src={activeImg} className="max-w-full max-h-[90vh] rounded-[16px] shadow-2xl" alt="" />
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur text-white flex items-center justify-center hover:bg-white/20">✕</button>
        </div>
      )}
    </div>
  )
}
