import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artem — Plugin & Mod Developer",
  description: "Портфолио разработчика Minecraft плагинов, модов и инструментов. Spigot, Paper, Fabric, Forge.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className="bg-[#0a0a0b] text-zinc-100 antialiased min-h-screen selection:bg-[#ccff00] selection:text-black">
        {children}
      </body>
    </html>
  );
}
