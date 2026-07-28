# Spec: Modo Agente — Feature Flag + Registro PF-only

> Data: 2026-07-13
> Base visual: [BabyClothes Chat Mocks.dc.html](../../../../BabyClothes%20architecture%20diagrams/Chat%20com%20agente%20de%20bebês/BabyClothes%20Chat%20Mocks.dc.html) (telas 01–12)

## Visão geral

Feature flag `PUBLIC_APP_MODE` que alterna entre modo **full** (marketplace completo) e modo **agent** (foco no agente de IA com registro PF-only). 12 work packages autocontidos para delegação a subagentes.

## Ordem de execução e dependências

```
WP9 (API e-mail/senha) ──► WP3 (registro PF) e WP11 (login e-mail)
WP10 (DS Select) ──► WP3
WP1 (flags) ──► WP2 (shell/guards) ──► WP8 (QA)
WP1 ──► WP3 (registro PF) e WP11 (login e-mail)
WP4 (DS components) ──► WP5 (onboarding) e WP6 (agente)
WP1 + WP4 ──► WP5, WP6
WP7 (i18n) pode rodar em paralelo; WP3/5/6/11 dependem das chaves
```

## Work Packages

| WP | Arquivo | Escopo | Dependências |
|----|---------|--------|--------------|
| — | [Regras globais](00-regras-globais.md) | Regras, tokens, convenções | — |
| WP0 | [Ambiente](WP0-ambiente.md) | `.env.agent`, script `dev:agent` | — |
| WP1 | [Feature flags](WP1-feature-flags.md) | `feature-flags.ts`, `parseAppMode`, `deriveFlags` | WP0 |
| WP2 | [Guards e shell](WP2-guards-shell.md) | Redirects, TopBar condicional, BottomNav | WP1 |
| WP3 | [Registro PF](WP3-registro-pf.md) | Wizard 2 passos, schemas, server action, cookies | WP1, WP7, WP9, WP10 |
| WP4 | [DS components](WP4-ds-components.md) | ChoiceChipGroup, AgentFormCard, MonthPicker, ChildInlineForm, AgentTopBar, OnboardingHero | — |
| WP5 | [Onboarding](WP5-onboarding.md) | Rota `/onboarding`, localStorage guard | WP1, WP4, WP7 |
| WP6 | [Agent intake + chat](WP6-agent-intake-chat.md) | IntakeMachine, rota `/agent`, payloads | WP1, WP4, WP7 |
| WP7 | [i18n](WP7-i18n.md) | Chaves `pt.json` / `en.json` | — |
| WP8 | [QA final](WP8-qa-final.md) | Checklist 21 itens, dois modos | WP1–WP7, WP9–WP11 |
| WP9 | [API e-mail/senha](WP9-api-email-auth.md) | Elixir: signup, login, perfil, migration | — |
| WP10 | [DS Select](WP10-ds-select.md) | Primitive `Select` no design system | — |
| WP11 | [Login e-mail](WP11-login-email.md) | Login e-mail/senha modo agent | WP1, WP3.5, WP7, WP9 |

## Protótipo

As telas de referência estão no mock interativo:

→ [BabyClothes Chat Mocks.dc.html](../../../../BabyClothes%20architecture%20diagrams/Chat%20com%20agente%20de%20bebês/BabyClothes%20Chat%20Mocks.dc.html)

| Tela | WP responsável | Descrição |
|------|----------------|-----------|
| 01 | WP3 | Login / escolha de registro |
| 02 | WP3 | Registro PF — passo 1 (conta) |
| 03 | WP4, WP5 | Onboarding — hero com features |
| 04 | WP6 | Intake — pergunta filhos |
| 05 | WP6 | Intake — formulário criança |
| 06 | WP6 | Intake — previsão nascimento |
| 07 | WP6 | Intake — sugestões de busca |
| 08 | WP6 | Chat livre |
| 09–12 | WP6 | Variações de chat (carrinho, alertas) |
