import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  const base = 'https://regrow.com.br';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${base}/pt</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${base}/pt"/>
    <xhtml:link rel="alternate" hreflang="en" href="${base}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/pt"/>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${base}/en</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${base}/pt"/>
    <xhtml:link rel="alternate" hreflang="en" href="${base}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${base}/pt"/>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
};
