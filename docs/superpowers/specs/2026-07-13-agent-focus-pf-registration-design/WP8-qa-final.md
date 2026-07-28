## WP8 — QA final (checklist de aceite)

Executar nos dois modos (`.env` full e `.env.agent`):

| # | Verificação | full | agent |
|---|---|---|---|
| 1 | `/catalog` acessível | ✓ | 303 → `/agent` |
| 2 | `/sell` acessível | ✓ | 303 → `/agent` |
| 3 | BottomNav renderiza | ✓ | ausente |
| 4 | TopBar busca + Publicar | ✓ | ausente (AgentTopBar) |
| 5 | `/register` tela | PF/PJ (RegisterScreen) | wizard PF 2 passos (RegisterPFScreen) |
| 6 | Action aceita `type=pj` | ✓ | fail 400 `pj_disabled` |
| 7 | Pós-registro | `/catalog` | `/onboarding` → `/agent` |
| 8 | `/chat` | ✓ | 308 → `/agent` |
| 9 | Intake: 3 ramos completos | n/a | ✓ (crianças persistidas) |
| 10 | Sugestões clicáveis enviam mensagem | n/a | ✓ |
| 11 | `/profile`, `/child`, `/child/[id]`, `/notifications` | ✓ | ✓ (via avatar/sino) |
| 12 | `check` + `test` (web e design-system) | ✓ | ✓ |
| 13 | Storybook: 6 stories novas renderizam | ✓ | — |
| 14 | grep: zero emojis em código novo; zero `import.meta.env` fora de `env.ts` | ✓ | ✓ |
| 15 | Wizard: passo 1 inválido não avança; voltar preserva valores | n/a | ✓ |
| 16 | Signup completo (2 passos) cria conta já autenticada → `/onboarding` | n/a | ✓ |
| 17 | Login por e-mail/senha após logout leva a `/agent` | ausente (flag off) | ✓ |
| 18 | Senha errada no login → "E-mail ou senha incorretos." | n/a | ✓ |
| 19 | E-mail duplicado no signup → erro no campo, wizard volta ao passo 1 | n/a | ✓ |
| 20 | `GET /auth/session` retorna phone/nationality/cep/address_line/city/state | ✓ (null p/ contas Google) | ✓ |
| 21 | Nenhuma resposta da API contém `password_hash`; senha nunca logada | ✓ | ✓ |
