import { describe, it, expect } from 'vitest';
import { GET } from './+server';

describe('GET /sitemap.xml', () => {
  it('returns XML content-type', async () => {
    const response = GET();
    expect(response.headers.get('content-type')).toBe('application/xml');
  });

  it('includes both /pt and /en URLs with hreflang alternates', async () => {
    const response = GET();
    const body = await response.text();
    expect(body).toContain('<loc>https://regrow.com.br/pt</loc>');
    expect(body).toContain('<loc>https://regrow.com.br/en</loc>');
    expect(body).toContain('hreflang="x-default"');
  });
});
