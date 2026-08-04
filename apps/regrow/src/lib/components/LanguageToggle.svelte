<script lang="ts">
  import { page } from '$app/stores'
  import { t } from '$lib/i18n'

  const currentLang = $derived($page.params.lang ?? 'pt')
  const otherLang = $derived(currentLang === 'pt' ? 'en' : 'pt')
  const otherPath = $derived($page.url.pathname.replace(`/${currentLang}`, `/${otherLang}`))
</script>

<a href={otherPath} hreflang={otherLang} class="language-toggle">{$t('footer.lang_toggle')}</a>

<style>
  .language-toggle {
    font-size: 0.675rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .language-toggle:hover {
    color: var(--pk);
  }
</style>
