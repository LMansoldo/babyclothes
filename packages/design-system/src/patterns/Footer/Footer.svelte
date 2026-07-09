<script lang="ts">
  let {
    links,
    copyright,
  }: {
    links: { href: string; label: string }[]
    copyright: string
  } = $props()
</script>

<footer class="footer">
  <nav class="footer__links">
    {#each links as link (link.href)}
      <a class="footer__link" href={link.href}>{link.label}</a>
    {/each}
  </nav>
  <p class="footer__copyright">{copyright}</p>
</footer>

<style>
  .footer {
    background: var(--wh);
    border-top: 0.075rem solid rgba(10, 10, 10, 0.08);
    padding: 1.2rem 1.4rem 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: center;
  }

  .footer__links {
    display: flex;
    gap: 1.2rem;
  }

  .footer__link {
    font-family: var(--ld);
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--gr);
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer__link:hover {
    color: var(--pk);
  }

  .footer__copyright {
    margin: 0;
    font-size: 0.62rem;
    color: var(--color-gray-2);
  }
</style>
