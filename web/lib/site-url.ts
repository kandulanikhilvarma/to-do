// Canonical origin for metadata, sitemap and robots. An explicit override
// wins; on Vercel the project production domain is provided at build time;
// locally it is the dev server.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
