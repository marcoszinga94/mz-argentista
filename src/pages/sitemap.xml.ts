import type { APIRoute } from "astro";

const pages = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/dolar", priority: "0.9", changefreq: "daily" },
  { path: "/inflacion", priority: "0.9", changefreq: "monthly" },
];

const buildTime = new Date().toISOString();

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://argentista.vercel.app");

  const urls = pages
    .map(
      (page) =>
        `  <url>\n    <loc>${new URL(page.path, base).href}</loc>\n    <lastmod>${buildTime}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600",
    },
  });
};
