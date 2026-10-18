/** @type {import('next').NextConfig} */

/* Derive the exact Supabase storage host so next/image is allowed to optimise
   project covers served from Supabase Storage.

   IMPORTANT: `next.config.js` is evaluated BEFORE Next.js loads `.env.local`
   into `process.env`, so reading `process.env.NEXT_PUBLIC_SUPABASE_URL` here
   can be empty. Parse `.env*` files directly, then fall back to process.env. */
const fs = require("fs");
const path = require("path");

function readEnvHost() {
  const fromProc = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (fromProc) {
    try {
      return new URL(fromProc).hostname;
    } catch {}
  }
  for (const file of [".env.local", ".env.production", ".env"]) {
    try {
      const txt = fs.readFileSync(path.join(__dirname, file), "utf8");
      const m = txt.match(/^\s*NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.+?)\s*$/m);
      if (m) return new URL(m[1].trim().replace(/^["']|["']$/g, "")).hostname;
    } catch {}
  }
  return null;
}

const supabaseHost = readEnvHost();

/* Build the allow-list. A plain explicit hostname is the form Next.js 14
   matches most reliably; the `**.supabase.co` wildcard is kept last as a
   fallback for other projects. */
const remotePatterns = [];
if (supabaseHost) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseHost,
    pathname: "/storage/v1/object/public/**",
  });
  /* Also allow the host without a path constraint — some Supabase URLs are
     served from `/storage/v1/render/image/public/**` after transforms. */
  remotePatterns.push({ protocol: "https", hostname: supabaseHost });
}
remotePatterns.push({
  protocol: "https",
  hostname: "**.supabase.co",
  pathname: "/storage/v1/object/public/**",
});

module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },

  /* SWC minification is the default in Next 14 — no `swcMinify` flag needed
     (the key was removed in 14.x and would emit a warning). */

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
  },

  /* Tree-shake barrel imports. Recharts is REMOVED from this block on
     purpose: the `recharts/es6/...` deep paths do not resolve for every
     export, and the admin analytics page lazy-loads the whole chart layer
     anyway — so only the icon set (the one real barrel on the public site)
     is modularised here. */
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  /* Instrumentation is off in production builds. */
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      // Admin routes — no indexing
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      // Global security headers
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          /* DENY is stricter than SAMEORIGIN and is safe here — nothing on
             the site frames itself. */
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            /* CSP — allows Next's inline bootstrap, the Supabase origin for
               auth/REST/storage, inline styles used by the animation layers,
               and blob: for the WebGL/texture paths. `unsafe-inline` for
               scripts is required by Next's streaming bootstrap unless a
               nonce is wired through the whole tree; frame-ancestors makes
               the X-Frame-Options intent explicit. */
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
