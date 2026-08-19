import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Загруженные файлы (/uploads/...) отдаём через API,
        // чтобы работали файлы, добавленные уже после сборки
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
