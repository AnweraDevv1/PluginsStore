"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const CODE_LINES: ReactNode[] = [
  <div key="1" className="text-zinc-600">// Optimized for Paper 1.20+</div>,
  <div key="2"><span className="text-[#ff7ab2]">public class</span> <span className="text-[#ccff00]">VeinMiner</span> <span className="text-[#ff7ab2]">extends</span> JavaPlugin {"{"}</div>,
  <div key="3" className="pl-4"><span className="text-zinc-500">@Override</span></div>,
  <div key="4" className="pl-4"><span className="text-[#ff7ab2]">public void</span> <span className="text-[#82aaff]">onEnable</span>() {"{"}</div>,
  <div key="5" className="pl-8">getLogger().info(<span className="text-[#c3e88d]">"⚡ Loaded "</span> + getDescription().getVersion());</div>,
  <div key="6" className="pl-8"><span className="text-[#82aaff]">registerEvents</span>(<span className="text-[#ff7ab2]">new</span> BlockBreakListener(<span className="text-[#ff7ab2]">this</span>));</div>,
  <div key="7" className="pl-8 text-zinc-500">// 12k+ servers • 0.02ms avg tick</div>,
  <div key="8" className="pl-4">{"}"}</div>,
];

const METRICS = [
  { k: "Performance", v: "A+" },
  { k: "Memory", v: "1.2MB" },
  { k: "Servers", v: "12.4k" },
];

export default function AnimatedCode({ animated }: { animated: boolean }) {
  const [visible, setVisible] = useState(animated ? 0 : CODE_LINES.length);
  const [showBuild, setShowBuild] = useState(!animated);
  const [showMetrics, setShowMetrics] = useState(!animated);

  useEffect(() => {
    if (!animated) {
      setVisible(CODE_LINES.length);
      setShowBuild(true);
      setShowMetrics(true);
      return;
    }
    setVisible(0);
    setShowBuild(false);
    setShowMetrics(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisible(i);
      if (i >= CODE_LINES.length) {
        clearInterval(id);
        setTimeout(() => setShowBuild(true), 350);
        setTimeout(() => setShowMetrics(true), 800);
      }
    }, 380);
    return () => clearInterval(id);
  }, [animated]);

  return (
    <>
      <div className="p-6 font-mono text-[12px] leading-[1.7] overflow-x-auto">
        {CODE_LINES.map((line, idx) => (
          <div
            key={idx}
            style={{
              opacity: idx < visible ? 1 : 0,
              transform: idx < visible ? "translateY(0)" : "translateY(5px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            {line}
            {animated && idx === visible - 1 && visible < CODE_LINES.length && (
              <span className="inline-block w-[7px] h-4 bg-[#ccff00] ml-1 align-middle animate-pulse" />
            )}
          </div>
        ))}

        {showBuild && (
          <div className="mt-3 flex items-center gap-2 text-[11px]" style={{ opacity: 1, transition: "opacity 0.3s ease" }}>
            <span className="px-2 py-1 rounded bg-[#ccff00] text-black font-bold">BUILD SUCCESS</span>
            <span className="text-zinc-500">42 tests • 0.8s</span>
          </div>
        )}
      </div>

      <div
        className="grid grid-cols-3 gap-px bg-zinc-800 border-t border-zinc-800"
        style={{ opacity: showMetrics ? 1 : 0, transition: "opacity 0.5s ease" }}
      >
        {METRICS.map(m => (
          <div key={m.k} className="bg-[#18181b] px-4 py-3">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">{m.k}</div>
            <div className="font-bold text-[14px] mt-1">{m.v}</div>
          </div>
        ))}
      </div>
    </>
  );
}
