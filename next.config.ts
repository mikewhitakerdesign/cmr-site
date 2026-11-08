import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 is Next's default; 90 is used only by the desktop hero photo, whose
    // source is already soft (src/components/home/HomeHero.tsx).
    qualities: [75, 90],
  },
};

export default nextConfig;
