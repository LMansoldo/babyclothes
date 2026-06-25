<script lang="ts">
  const year = new Date().getFullYear()
</script>

<footer class="footer">
  <div class="footer__inner">
    <div class="footer__col">
      <h4 class="footer__heading">Sobre</h4>
      <a href="/about" class="footer__link">Quem somos</a>
      <a href="/how-it-works" class="footer__link">Como funciona</a>
      <a href="/sustainability" class="footer__link">Sustentabilidade</a>
    </div>

    <div class="footer__col">
      <h4 class="footer__heading">Ajuda</h4>
      <a href="/faq" class="footer__link">Perguntas frequentes</a>
      <a href="/contact" class="footer__link">Fale conosco</a>
      <a href="/safety" class="footer__link">Seguranca</a>
    </div>

    <div class="footer__col">
      <h4 class="footer__heading">Legal</h4>
      <a href="/terms" class="footer__link">Termos de uso</a>
      <a href="/privacy" class="footer__link">Privacidade</a>
      <a href="/cookies" class="footer__link">Cookies</a>
    </div>

    <div class="footer__col">
      <h4 class="footer__heading">Social</h4>
      <a href="https://instagram.com" class="footer__link" target="_blank" rel="noopener">Instagram</a>
      <a href="https://tiktok.com" class="footer__link" target="_blank" rel="noopener">TikTok</a>
      <a href="https://twitter.com" class="footer__link" target="_blank" rel="noopener">Twitter</a>
    </div>
  </div>

  <div class="footer__bottom">
    <span class="footer__copy">&copy; {year} BabyClothes. Todos os direitos reservados.</span>
  </div>
</footer>

<style>
  .footer {
    background: var(--bk);
    color: var(--gr);
    padding: 4rem 2rem 2rem;
    margin-top: 4.8rem;
  }

  .footer__inner {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 3.2rem;
    max-width: 120rem;
    margin: 0 auto;
  }

  .footer__col {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .footer__heading {
    font-family: var(--ld);
    font-weight: 700;
    font-size: 1.3rem;
    color: var(--wh);
    margin-bottom: 0.4rem;
  }

  .footer__link {
    font-family: var(--vd);
    font-size: 1.2rem;
    color: var(--gr);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .footer__link:hover {
    color: var(--wh);
  }

  .footer__bottom {
    border-top: 0.1rem solid rgba(255, 255, 255, 0.1);
    margin-top: 3.2rem;
    padding-top: 1.6rem;
    text-align: center;
  }

  .footer__copy {
    font-family: var(--vd);
    font-size: 1.1rem;
    color: var(--gr);
  }

  @media (max-width: 76.8rem) {
    .footer__inner {
      grid-template-columns: repeat(2, 1fr);
      gap: 2.4rem;
    }
  }

  @media (max-width: 48rem) {
    .footer__inner {
      grid-template-columns: 1fr;
    }
  }
</style>
