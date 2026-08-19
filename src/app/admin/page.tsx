"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authHeaders, clearToken } from "@/lib/clientAuth";
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
  status: string;
  createdAt: string;
}

const EMPTY_FORM: Partial<Project> = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "plugin",
  version: "1.0.0",
  minecraftVersion: "1.20+",
  downloadUrl: "",
  githubUrl: "",
  modrinthUrl: "",
  curseforgeUrl: "",
  banner: "",
  videoUrl: "",
  screenshots: [],
  tags: [],
  features: [],
  fileSize: "~2 MB",
  featured: false,
  status: "published",
};

export default function AdminPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [codeAnim, setCodeAnim] = useState(true);

  // auth check
  useEffect(() => {
    fetch("/api/auth/check", { headers: authHeaders() }).then(r=>r.json()).then(d=>{
      if (!d.authenticated) router.push("/login");
      else fetchProjects();
    }).catch(()=>router.push("/login"));
  }, []);

  // site settings
  useEffect(() => {
    fetch("/api/settings", { headers: authHeaders() }).then(r=>r.json()).then(d=>{
      if (typeof d.codeAnimation === "boolean") setCodeAnim(d.codeAnimation);
    }).catch(()=>{});
  }, []);

  async function toggleCodeAnim() {
    const next = !codeAnim;
    setCodeAnim(next);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ codeAnimation: next, data: {} }),
    }).catch(()=>{});
  }

  function fetchProjects() {
    setLoading(true);
    fetch("/api/projects?all=true", { headers: authHeaders() }).then(r=>r.json()).then(data=>{
      if (Array.isArray(data)) setProjects(data);
      setLoading(false);
    }).catch(()=>setLoading(false));
  }

  function openCreate() {
    setEditing(null);
    setForm({...EMPTY_FORM});
    setShowForm(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setForm({
      ...p,
      screenshots: p.screenshots || [],
      tags: p.tags || [],
      features: p.features || [],
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title || !form.shortDescription || !form.downloadUrl) {
      alert("Заполни название, краткое описание и ссылку на скачку!");
      return;
    }
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/projects/${editing.id}` : "/api/projects";
      
      // Process tags/features from string if needed
      const payload = {
        ...form,
        tags: Array.isArray(form.tags) ? form.tags : (typeof form.tags === "string" ? (form.tags as string).split(",").map((s:string)=>s.trim()).filter(Boolean) : []),
        features: Array.isArray(form.features) ? form.features : (typeof form.features === "string" ? (form.features as string).split("\n").map((s:string)=>s.trim()).filter(Boolean) : []),
        screenshots: Array.isArray(form.screenshots) ? form.screenshots : [],
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сохранения");
      }
      setShowForm(false);
      fetchProjects();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить проект?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchProjects();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: "screenshots" | "file" | "banner") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", headers: authHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      
      if (type === "screenshots") {
        setForm((prev: any)=> ({ ...prev, screenshots: [...(prev.screenshots||[]), data.url] }));
      } else if (type === "banner") {
        setForm((prev: any)=> ({ ...prev, banner: data.url }));
      } else {
        setForm((prev: any)=> ({ ...prev, downloadUrl: data.url }));
      }
    } catch (err: any) {
      alert(err.message + " — Используй прямую ссылку на файл (Google Drive, GitHub Releases и т.д.)");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addScreenshotUrl() {
    const url = prompt("Вставь URL скриншота (Unsplash, Imgur и т.д.):");
    if (url) setForm((prev:any)=>({...prev, screenshots: [...(prev.screenshots||[]), url]}));
  }

  async function handleLogout() {
    clearToken();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-zinc-500 font-mono">загрузка админки...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100">
      {/* Top bar */}
      <div className="h-[64px] border-b border-zinc-900 flex items-center justify-between px-6 bg-[#0f0f11] sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ccff00] flex items-center justify-center text-black font-black text-[14px]">A</div>
            <span className="font-bold text-[14px]">ADMIN</span>
          </Link>
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">admin • owner</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/guide" className="h-8 px-4 rounded-full bg-zinc-900 border border-zinc-800 text-[12px] font-mono hover:border-zinc-700 transition">хостинг гайд</Link>
          <Link href="/" className="h-8 px-4 rounded-full bg-zinc-900 border border-zinc-800 text-[12px] font-mono hover:border-zinc-700 transition hidden md:flex">← сайт</Link>
          <button onClick={handleLogout} className="h-8 px-4 rounded-full bg-white text-black text-[12px] font-bold hover:bg-zinc-200 transition">выход</button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {label:"всего проектов", value: projects.length},
            {label:"скачиваний", value: projects.reduce((s,p)=>s+p.downloads,0).toLocaleString()},
            {label:"featured", value: projects.filter(p=>p.featured).length},
            {label:"категорий", value: new Set(projects.map(p=>p.category)).size},
          ].map(s=>(
            <div key={s.label} className="rounded-[16px] bg-[#151518] border border-zinc-800 p-5">
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">{s.label}</div>
              <div className="text-[28px] font-black mt-2 leading-none">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Header + create */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-black tracking-tight">Мои проекты</h1>
            <p className="text-[13px] text-zinc-500 font-mono mt-1">Добавляй описание, скрины, ссылки на скачку. Всё сразу появится на сайте.</p>
          </div>
          <button onClick={openCreate} className="h-11 px-6 rounded-full bg-[#ccff00] text-black font-bold text-[14px] hover:bg-[#d4ff33] transition self-start">
            + ДОБАВИТЬ ПРОЕКТ
          </button>
        </div>

        {/* Table */}
        <div className="rounded-[20px] bg-[#151518] border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[#0f0f10] border-b border-zinc-800 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                <tr>
                  <th className="text-left p-4 font-medium">проект</th>
                  <th className="text-left p-4 font-medium">категория</th>
                  <th className="text-left p-4 font-medium">версия</th>
                  <th className="text-left p-4 font-medium">скачиваний</th>
                  <th className="text-left p-4 font-medium">статус</th>
                  <th className="text-right p-4 font-medium">действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {projects.map(p=>(
                  <tr key={p.id} className="hover:bg-zinc-900/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                          {p.screenshots?.[0] ? <img src={p.screenshots[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-zinc-600">🧩</div>}
                        </div>
                        <div>
                          <div className="font-bold leading-tight max-w-[260px] truncate">{p.title}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-1 truncate max-w-[260px]">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono">{p.category}</span></td>
                    <td className="p-4 font-mono text-zinc-400">{p.version} • {p.minecraftVersion}</td>
                    <td className="p-4 font-mono">{p.downloads}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-[11px] font-mono ${p.status==="published" ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20" : "bg-zinc-800 text-zinc-400"}`}>{p.status}</span></td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={()=>openEdit(p)} className="h-8 px-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[12px]">edit</button>
                        <Link href={`/projects/${p.slug}`} target="_blank" className="h-8 px-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-[12px] flex items-center">view</Link>
                        <button onClick={()=>handleDelete(p.id)} className="h-8 w-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 flex items-center justify-center">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projects.length===0 && (
            <div className="p-16 text-center">
              <div className="text-5xl mb-4">📦</div>
              <div className="font-bold">Пока нет проектов</div>
              <div className="text-zinc-500 text-[13px] mt-2">Нажми "Добавить проект" чтобы создать первый плагин в портфолио</div>
            </div>
          )}
        </div>

        {/* Site settings */}
        <div className="mt-8 rounded-[20px] bg-[#151518] border border-zinc-800 p-6">
          <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
            <div>
              <div className="font-bold text-[15px]">⚡ Анимация кода на главной</div>
              <div className="text-[12px] text-zinc-500 mt-1 max-w-[560px] leading-relaxed">Когда включено — код в hero-блоке «компилируется» с анимацией (строки появляются по одной). Выключи — и код будет просто статичным, как раньше.</div>
            </div>
            <button
              onClick={toggleCodeAnim}
              aria-label="Переключить анимацию кода"
              className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ${codeAnim ? "bg-[#ccff00]" : "bg-zinc-700"}`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-200 ${codeAnim ? "left-7" : "left-1"}`} />
            </button>
          </div>
        </div>

        {/* Hosting guide teaser */}
        <div className="mt-8 rounded-[16px] bg-[#ccff00] text-black p-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <div className="font-black text-[18px]">🚀 Как залить на бесплатный хостинг?</div>
            <div className="text-[13px] mt-1 font-medium text-zinc-800 max-w-[600px] leading-relaxed">Я подготовил полный гайд: Vercel (рекомендую), Netlify, Railway. С доменом, базой PostgreSQL и CDN для файлов.</div>
          </div>
          <Link href="/guide" className="h-10 px-6 rounded-full bg-black text-white font-bold text-[13px] flex items-center self-start">ОТКРЫТЬ ГАЙД →</Link>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-[900px] my-8 rounded-[24px] bg-[#18181b] border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="sticky top-0 bg-[#18181b] border-b border-zinc-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-[20px] font-black">{editing ? "Редактировать проект" : "Новый проект"}</h2>
                <p className="text-[12px] font-mono text-zinc-500 mt-1">Все поля сохранятся в PostgreSQL и сразу покажутся на сайте</p>
              </div>
              <button onClick={()=>setShowForm(false)} className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800">✕</button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">название проекта *</label>
                  <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Например: AdvancedEnchants" className="w-full h-11 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-4 text-[14px] focus:border-zinc-700 outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">slug (url)</label>
                    <input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} placeholder="advanced-enchants" className="w-full h-11 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-4 text-[13px] font-mono focus:border-zinc-700 outline-none" />
                    <div className="text-[10px] text-zinc-600 mt-1">если пусто — сгенерится автоматически</div>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">категория</label>
                    <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="w-full h-11 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-4 text-[14px] focus:border-zinc-700 outline-none">
                      <option value="plugin">plugin (Paper/Spigot)</option>
                      <option value="mod">mod (Fabric/Forge)</option>
                      <option value="datapack">datapack</option>
                      <option value="library">library / API</option>
                      <option value="tool">tool / утилита</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">краткое описание * (для карточки)</label>
                  <textarea value={form.shortDescription} onChange={e=>setForm({...form, shortDescription:e.target.value})} rows={3} placeholder="60+ кастомных зачарований с анимациями..." className="w-full rounded-xl bg-[#0a0a0b] border border-zinc-800 p-4 text-[14px] focus:border-zinc-700 outline-none resize-none" />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">полное описание (markdown поддерживается)</label>
                  <textarea value={form.description} onChange={e=>setForm({...form, description:e.target.value})} rows={10} placeholder="## Особенности&#10;- 60+ зачарований&#10;- GUI&#10;- Оптимизация..." className="w-full rounded-xl bg-[#0a0a0b] border border-zinc-800 p-4 text-[13px] leading-relaxed font-mono focus:border-zinc-700 outline-none" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">версия</label>
                    <input value={form.version} onChange={e=>setForm({...form, version:e.target.value})} className="w-full h-10 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-3 text-[13px] font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">MC версия</label>
                    <input value={form.minecraftVersion} onChange={e=>setForm({...form, minecraftVersion:e.target.value})} className="w-full h-10 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-3 text-[13px] font-mono" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">размер файла</label>
                    <input value={form.fileSize} onChange={e=>setForm({...form, fileSize:e.target.value})} placeholder="~2.5 MB" className="w-full h-10 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-3 text-[13px] font-mono" />
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="space-y-5">
                <div className="rounded-[16px] bg-[#0a0a0b] border border-zinc-800 p-4">
                  <div className="font-bold text-[13px] mb-3">📥 Ссылки на скачку и репозитории</div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-1.5">основная ссылка на скачку * (.jar, .zip)</label>
                      <div className="flex gap-2">
                        <input value={form.downloadUrl} onChange={e=>setForm({...form, downloadUrl:e.target.value})} placeholder="https://... или /uploads/file.jar" className="flex-1 h-10 rounded-xl bg-[#151518] border border-zinc-800 px-3 text-[12px] font-mono" />
                        <label className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center text-[11px] font-mono cursor-pointer hover:border-zinc-700">
                          {uploading ? "..." : "📁"}<input type="file" hidden onChange={e=>handleFileUpload(e,"file")} />
                        </label>
                      </div>
                      <div className="text-[10px] text-zinc-600 mt-1">Загрузи файл или вставь ссылку на GitHub Releases / Google Drive / Modrinth</div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <input value={form.githubUrl} onChange={e=>setForm({...form, githubUrl:e.target.value})} placeholder="GitHub URL (https://github.com/...)" className="w-full h-10 rounded-xl bg-[#151518] border border-zinc-800 px-3 text-[12px] font-mono" />
                      <input value={form.modrinthUrl} onChange={e=>setForm({...form, modrinthUrl:e.target.value})} placeholder="Modrinth URL (https://modrinth.com/...)" className="w-full h-10 rounded-xl bg-[#151518] border border-zinc-800 px-3 text-[12px] font-mono" />
                      <input value={form.curseforgeUrl} onChange={e=>setForm({...form, curseforgeUrl:e.target.value})} placeholder="CurseForge URL" className="w-full h-10 rounded-xl bg-[#151518] border border-zinc-800 px-3 text-[12px] font-mono" />
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] bg-[#0a0a0b] border border-zinc-800 p-4">
                  <div className="font-bold text-[13px] mb-3">🖼️ Баннер (главное изображение проекта)</div>
                  <div className="flex gap-2">
                    <input value={form.banner || ""} onChange={e=>setForm({...form, banner:e.target.value})} placeholder="https://... или Google Drive / /uploads/banner.png" className="flex-1 h-10 rounded-xl bg-[#151518] border border-zinc-800 px-3 text-[12px] font-mono" />
                    <label className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center text-[11px] font-mono cursor-pointer hover:border-zinc-700">
                      {uploading ? "..." : "📁"}<input type="file" accept="image/*" hidden onChange={e=>handleFileUpload(e,"banner")} />
                    </label>
                  </div>
                  {form.banner ? (
                    <div className="mt-3 relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                      <img src={normalizeImageUrl(form.banner)} alt="" className="w-full h-32 object-cover" onError={e=>{(e.target as HTMLImageElement).style.opacity="0.15";}} />
                      <button onClick={()=>setForm({...form, banner:""})} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white text-[12px] flex items-center justify-center">✕</button>
                    </div>
                  ) : (
                    <div className="mt-3 h-16 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-[11px] font-mono">баннер не задан — покажется обложкой на карточке проекта</div>
                  )}
                </div>

                <div className="rounded-[16px] bg-[#0a0a0b] border border-zinc-800 p-4">
                  <div className="font-bold text-[13px] mb-3">🎬 Видео (Google Drive / YouTube)</div>
                  <input value={form.videoUrl || ""} onChange={e=>setForm({...form, videoUrl:e.target.value})} placeholder="https://drive.google.com/file/d/... или https://youtu.be/..." className="w-full h-10 rounded-xl bg-[#151518] border border-zinc-800 px-3 text-[12px] font-mono" />
                  <div className="text-[10px] text-zinc-600 mt-1">Вставь ссылку на видео — на странице проекта оно откроется во встроенном плеере</div>
                </div>

                <div className="rounded-[16px] bg-[#0a0a0b] border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-[13px]">🖼️ Скриншоты</div>
                    <div className="flex gap-2">
                      <button onClick={addScreenshotUrl} className="h-7 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono hover:border-zinc-700">+ URL</button>
                      <label className="h-7 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono hover:border-zinc-700 cursor-pointer flex items-center">
                        {uploading ? "загрузка..." : "+ файл"}<input type="file" accept="image/*" hidden onChange={e=>handleFileUpload(e,"screenshots")} />
                      </label>
                    </div>
                  </div>

                  {(!form.screenshots || form.screenshots.length===0) ? (
                    <div className="h-24 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 text-[12px] font-mono">нет скринов — добавь URL или загрузи файл</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {form.screenshots.map((url:string,i:number)=>(
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[16/10]">
                          <img src={normalizeImageUrl(url)} alt="" className="w-full h-full object-cover" onError={e=>{(e.target as HTMLImageElement).style.opacity="0.15";}} />
                          <button onClick={()=>setForm({...form, screenshots: form.screenshots.filter((_:any,idx:number)=>idx!==i)})} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white text-[12px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">✕</button>
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 backdrop-blur text-[9px] font-mono truncate">{url.slice(0,40)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">теги (через запятую)</label>
                    <input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={e=>setForm({...form, tags: e.target.value})} placeholder="pvp, economy, paper, optimization" className="w-full h-10 rounded-xl bg-[#0a0a0b] border border-zinc-800 px-3 text-[13px]" />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">фичи (каждая с новой строки)</label>
                    <textarea value={Array.isArray(form.features) ? form.features.join("\n") : form.features} onChange={e=>setForm({...form, features: e.target.value})} rows={4} placeholder="60+ кастомных зачарований&#10;GUI конфигуратор&#10;Поддержка PAPI" className="w-full rounded-xl bg-[#0a0a0b] border border-zinc-800 p-3 text-[13px] resize-none" />
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={e=>setForm({...form, featured:e.target.checked})} className="w-4 h-4 rounded" />
                      <span className="text-[12px] font-mono">★ featured (топ)</span>
                    </label>
                    <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="h-8 rounded-full bg-zinc-900 border border-zinc-800 px-3 text-[11px] font-mono">
                      <option value="published">published</option>
                      <option value="draft">draft</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[#18181b] border-t border-zinc-800 p-4 flex justify-between items-center">
              <button onClick={()=>setShowForm(false)} className="h-11 px-6 rounded-full bg-zinc-900 border border-zinc-800 text-[13px] font-mono hover:border-zinc-700">отмена</button>
              <button onClick={handleSave} disabled={saving} className="h-11 px-8 rounded-full bg-white text-black font-bold text-[14px] hover:bg-[#ccff00] transition disabled:opacity-50">
                {saving ? "сохранение..." : editing ? "СОХРАНИТЬ" : "СОЗДАТЬ ПРОЕКТ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
