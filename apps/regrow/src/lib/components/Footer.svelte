<script lang="ts">
  import { t } from '$lib/i18n'
  import LanguageToggle from './LanguageToggle.svelte'
</script>

<footer class="footer">
  <div class="footer__row">
    <a href="#top" class="footer__brand">Re<span class="footer__brand-accent">Grow</span></a>
    <div class="footer__links">
      <a href="/privacy" class="footer__link">{$t('footer.privacy')}</a>
      <a href="/terms" class="footer__link">{$t('footer.terms')}</a>
      <a href="mailto:contato@regrow.com.br" class="footer__link">{$t('footer.contact')}</a>
      <a
        href="https://instagram.com/regrowapp"
        class="footer__link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {$t('footer.instagram')}
      </a>
      <LanguageToggle />
    </div>
    <p class="footer__copyright">© 2026 ReGrow</p>
  </div>
</footer>

<style>
  .footer {
    padding: 1.6rem clamp(1rem, 5vw, 3.6rem);
    background: var(--surface-raised);
    border-top: 0.05rem solid var(--border-default);
  }

  .footer__row {
    max-width: 58rem;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
  }

  .footer__brand {
    font-family: var(--font-body);
    font-size: 0.9rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    text-decoration: none;
  }

  .footer__brand-accent {
    color: var(--pk);
  }

  .footer__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.3rem;
  }

  .footer__link {
    font-size: 0.675rem;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .footer__link:hover {
    color: var(--pk);
  }

  .footer__copyright {
    font-size: 0.675rem;
    color: var(--text-tertiary);
  }
</style>
