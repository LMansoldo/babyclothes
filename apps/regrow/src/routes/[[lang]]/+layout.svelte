<script lang="ts">
  import { initI18n, t } from '$lib/i18n'
  import LandingTopbar from '$lib/components/LandingTopbar.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import '../../app.postcss'
  import type { LayoutData } from './$types'

  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props()

  // Initialize i18n without awaiting - the library handles loading
  void initI18n(data.lang)

  const htmlLang = $derived(data.lang === 'pt' ? 'pt-BR' : 'en')
  const ogLocale = $derived(htmlLang.replace('-', '_'))
  const canonicalBase = 'https://regrow.com.br'
  const canonicalUrl = $derived(`${canonicalBase}/${data.lang}`)
  const jsonLd = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ReGrow',
      url: canonicalBase,
      description: $t('meta.description'),
      inLanguage: htmlLang,
      potentialAction: {
        '@type': 'JoinAction',
        target: `${canonicalUrl}#waitlist`,
      },
    }),
  )
</script>

<svelte:head>
  <html lang={htmlLang}></html>

  <title>{$t('meta.title')}</title>
  <meta name="description" content={$t('meta.description')} />

  <link rel="canonical" href={canonicalUrl} />

  <link rel="alternate" hreflang="pt-BR" href="{canonicalBase}/pt" />
  <link rel="alternate" hreflang="en" href="{canonicalBase}/en" />
  <link rel="alternate" hreflang="x-default" href="{canonicalBase}/pt" />

  <meta property="og:title" content={$t('meta.title')} />
  <meta property="og:description" content={$t('meta.description')} />
  <meta property="og:image" content="{canonicalBase}/og-image-{data.lang}.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:locale" content={ogLocale} />
  <meta property="og:site_name" content="ReGrow" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={$t('meta.title')} />
  <meta name="twitter:description" content={$t('meta.description')} />
  <meta name="twitter:image" content="{canonicalBase}/og-image-{data.lang}.jpg" />

  <meta name="robots" content="index, follow" />

  {@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<LandingTopbar />
{@render children()}
<Footer />
