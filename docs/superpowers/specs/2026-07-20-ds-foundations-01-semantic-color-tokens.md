# DS Foundations 01 — Tokens semânticos de cor (tema claro)

> Data: 2026-07-20 · Parte de: doc-mãe §3 e §5 · Depende de: **00** (arquitetura de tokens).
> Bloqueia: **02** (dark mode).

## Objetivo

Introduzir a camada semântica de cor (tema **claro** apenas), mapeando os primitivos existentes para nomes por **papel/uso**. Habilita a migração de componentes para deixar de usar hex cru.

## Escopo

- **Novo** `packages/design-system/src/tokens/semantic.css`, com os tokens abaixo (valores do tema claro em `:root`), e `@import` dele no `tokens.css` agregador.
- **Piloto**: migrar **1** componente simples (recomendado: `Button` **ou** `Toast`) de hex/alias para os tokens semânticos, provando o uso. Sem mudança visual.

### Tokens (tema claro)

**Superfícies**
| Token | Valor |
|-------|-------|
| `--surface-base` | `#F8F5F2` |
| `--surface-raised` | `#FFFFFF` |
| `--surface-sunken` | `#F3F4F6` |
| `--surface-inverse` | `#111111` |
| `--surface-overlay` | `rgba(10,10,10,.5)` |

**Texto**
| Token | Valor |
|-------|-------|
| `--text-primary` | `#111111` |
| `--text-secondary` | `#374151` |
| `--text-tertiary` | `#9CA3AF` |
| `--text-on-brand` | `#FFFFFF` |
| `--text-inverse` | `#FFFFFF` |
| `--text-disabled` | `#BCBCBC` |

**Bordas**
| Token | Valor |
|-------|-------|
| `--border-subtle` | `#F3F4F6` |
| `--border-default` | `#EDE9E4` |
| `--border-strong` | `#D1D5DB` |
| `--border-focus` | `var(--color-pink)` |

**Marca / interativo**
| Token | Valor |
|-------|-------|
| `--brand` | `#FF3CAC` |
| `--brand-hover` | `#FF6EC7` |
| `--brand-subtle` | `#FFE8F5` |
| `--on-brand` | `#FFFFFF` |

**Feedback** (padrão `-solid` / `-subtle` / `-text`, para success/warning/error/info):
`--feedback-error-solid: #EF4444; --feedback-error-subtle: #FEE2E2; --feedback-error-text: #B91C1C;` (e análogos para success `#22C55E`, warning `#F59E0B`, info `#3B82F6`). `-solid` reaproveita `--color-*` existentes.

## Regras

- Semânticos referenciam primitivos onde já existe token (`var(--color-pink)`), e hex literal quando o primitivo não existe (cinzas Tailwind de-facto).
- **Não** reapontar aliases (`--pk`, `--bk`) — ficam como estão (doc-mãe §3).
- Piloto: trocar as cores hardcoded do componente por `var(--surface-*)`/`var(--text-*)`/etc., mantendo o resultado idêntico.

## Não-objetivos

- **Sem** valores de dark (é a spec 02).
- **Não** migrar outros componentes além do piloto.

## Definition of Done (TDD onde aplicável)

- `semantic.css` presente e importado; todos os tokens acima resolvem no browser.
- Piloto migrado usa **só** tokens semânticos (0 hex no bloco migrado).
- `check` + testes do DS verdes; screenshot do piloto **idêntico** ao anterior.
- Svelte MCP autofixer limpo no `.svelte` do piloto.
