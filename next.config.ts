import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  // Publishable keys are designed to be exposed to the browser.
  // Map the Vercel server-side env var to the name used by the app.
  env: {
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.SUPABASE_PUBLISHABLE_KEY ?? "",
  },
};

export default nextConfig;
