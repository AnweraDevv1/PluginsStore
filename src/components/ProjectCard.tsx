"use client";
import Link from "next/link";
import { useState } from "react";
import { driveImageUrl } from "@/lib/media";

interface Project {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  category: string;
  version: string;
  minecraftVersion: string;
  downloads: number;
  fileSize: string;
  banner?: string;
  videoUrl?: string;
  screenshots: string[];
  tags: string[];
  featured: boolean;
}

export default function ProjectCard({ project }: { project: Project }) {
  const [imgError, setImgError] = useState(false);
  // Баннер — отдельная плашка на карточке; если его нет — первый скриншот
  const cover = project.banner || project.screenshots?.[0];

  return (
    <Link href={`/projects/${project.slug}`} className="group relative bg-[#151518] border border-zinc-800 rounded-[20px] overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] flex flex-col h-full">
      {/* Image */}
      <div className="aspect-[16/10] bg-[#0f0f10] relative overflow-hidden">
        {cover && !imgError ? (
          <img src={driveImageUrl(cover)} alt={project.title} onError={()=>setImgError(true)} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 relative">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="text-6xl opacity-20">🧩</div>
          </div>
        )}
        
        {/* top bar */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest uppercase text-white">{project.category}</span>
            {project.featured && <span className="px-2.5 py-1 rounded-full bg-[#ccff00] text-black text-[10px] font-black tracking-widest uppercase">FEATURED</span>}
          </div>
          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300">v{project.version}</span>
        </div>

        {/* gradient */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#151518] to-transparent" />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[17px] leading-tight tracking-tight group-hover:text-[#ccff00] transition-colors">{project.title}</h3>
        <p className="text-[13px] text-zinc-400 leading-relaxed mt-2 line-clamp-2 flex-1">{project.shortDescription}</p>
        
        <div className="flex flex-wrap gap-1.5 mt-4">
          {project.tags?.slice(0,3).map(t=>(
            <span key={t} className="px-2 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">#{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>⬇ {project.downloads.toLocaleString()}</span>
            <span>• {project.fileSize}</span>
            <span>• {project.minecraftVersion}</span>
          </div>
          <span className="w-7 h-7 rounded-full bg-zinc-900 group-hover:bg-white group-hover:text-black flex items-center justify-center transition-colors">→</span>
        </div>
      </div>
    </Link>
  )
}
