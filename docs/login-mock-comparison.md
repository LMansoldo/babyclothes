# Login Screen — de/para comparativo com Design System Mock

Mock de referência: `BabyClothes architecture diagrams/BabyClothes Design System.dc.html`
Seção principal: **Hero** (`#brand`, linhas 79–111)
Complemento: **Card (composto)** (`#card`, linhas 747–800) + **Efeitos** (`#effects`, linhas 316–373)

---

## 1. Background do container `.login-page`

| Propriedade | Mock (Hero `#brand`) | Implementação atual (`.login-page`) | De → Para |
|---|---|---|---|
| `background` | `linear-gradient(140deg,#0F0F0F 0%,#1A0814 55%,#0A0A1A 100%)` | `linear-gradient(160deg, #0F0F0F 0%, #1A0814 60%, #0A0A0A 100%)` | Ângulo: `160deg` → `140deg`. Mid-stop: `60%` → `55%`. Cor final: `#0A0A0A` → `#0A0A1A` |
| `overflow` | `hidden` | (ausente) | Adicionar `overflow: hidden` |
| `position` | `relative` | (padrão static) | Adicionar `position: relative` |

---

## 2. Glows decorativos (elementos radiais posicionados)

| Propriedade | Mock (2 glows) | Implementação atual (`.authscreen__glow` - apenas 1) | De → Para |
|---|---|---|---|
| **Glow 1 (pink top-right)** | `top:-80px; right:-40px; width:420px; height:420px; background:radial-gradient(circle,rgba(255,60,172,.18) 0%,transparent 65%)` | `top:-15rem; right:-15rem; width:40rem; height:40rem; background:radial-gradient(circle, rgba(255,60,172,0.15), transparent 60%)` | opacity: `0.15` → `0.18`. cutoff: `60%` → `65%`. Tamanho: `40rem` → `420px` |
| **Glow 2 (purple bottom-left)** | `bottom:-60px; left:120px; width:280px; height:280px; background:radial-gradient(circle,rgba(176,62,255,.12) 0%,transparent 65%)` | **AUSENTE** | Adicionar segundo glow roxo no canto inferior esquerdo |

---

## 3. Card de vidro (glass surface que envolve o conteúdo)

| Propriedade | Mock (Hero stat cards + Card composto em dark) | Implementação atual (`.authscreen__content`) | De → Para |
|---|---|---|---|
| Elemento | `<div>` glass envolvendo todo o conteúdo | **AUSENTE** — conteúdo solto diretamente no fundo escuro | Criar wrapper `.authscreen__card` com as propriedades glass |
| `background` | `rgba(255,255,255,.08)` (stats) / `rgba(255,255,255,.1)` (Card composto) | (inexistente) | `rgba(255, 255, 255, 0.08)` |
| `backdrop-filter` | `blur(12px)` | (inexistente) | `blur(12px)` (sem saturate) |
| `border` | `1px solid rgba(255,255,255,.12)` (stats) / `1px solid rgba(255,255,255,.18)` (Card composto) | (inexistente) | `1px solid rgba(255, 255, 255, 0.12)` |
| `border-radius` | `0.875rem` (stats) / `1rem` (Card composto) | (inexistente) | `1rem` |
| `padding` | `1rem 1.5rem` (stats) | (inexistente) | `2rem` (manter padding atual do content) |
| `box-shadow` | (ausente nos stats, sem shadow explícito nos cards escuros) | (inexistente) | sem shadow — glass puro |

**Comparação com tokens atuais do projeto (`tokens.css`):**

| Token | Valor tokens.css | Valor mock | Diferença |
|---|---|---|---|
| `--glass` (background) | `rgba(255,255,255,0.52)` | `rgba(255,255,255,0.08)` | Muito mais escuro/transparente no mock |
| `--glass-blur` | `blur(2.4rem) saturate(170%)` | `blur(12px)` | Mock tem blur mais sutil, sem saturate |
| `--glass-brd` | `rgba(255,255,255,0.75)` | `rgba(255,255,255,0.12)` | Borda muito mais visível nos tokens do projeto |
| `--glass-shadow` | `0 0.8rem 3.2rem rgba(...), inset 0 0.1rem 0 rgba(...)` | (sem shadow) | Mock não usa shadow no glass |

> O mock usa glass "escuro" (rgba branco muito baixo) para superfícies sobre fundo preto.
> Os tokens do projeto (`--glass`, `--glass-blur`, `--glass-brd`) foram pensados para vidro "claro" sobre `#F8F5F2`, como na TopBar e BottomNav. Para superfícies escuras, o mock define valores diferentes.

---

## 4. Logo (drop + texto)

| Propriedade | Mock (Hero) | Implementação atual (`.authscreen__logo`) | De → Para |
|---|---|---|---|
| `gap` | `0.8rem` | `0.45rem` | `0.45rem` → `0.8rem` |
| **Drop** | `<svg>` 38×46px, path preenchido `#FF3CAC` | `<span>` 1.2rem×1.6rem, `background: var(--pk)`, `border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%` | OK — abordagens diferentes, resultado visual similar |
| **Texto** | `font-family:'Londrina Solid'; font-size:2rem; color:#fff; letter-spacing:0.03em` | `font-family: var(--ld); font-size:1.5rem; color: var(--wh); letter-spacing:-0.03em` | size: `1.5rem` → `2rem`. letter-spacing: `-0.03em` → `0.03em` |
| **"Clothes" (destaque)** | (mock não faz split) | `em` com `color: var(--pk)`, `font-style: normal` | OK — pattern de branding |
| **margin-top** | `margin-bottom:2.5rem` (abaixo do logo) | `margin-top:3.25rem; margin-bottom:3.5rem` | Margens diferentes; mock empurra o logo menos pra baixo |

---

## 5. Headline / título principal

| Propriedade | Mock (Hero `h1`) | Implementação atual (`.authscreen__title-line1` + `__title-line2`) | De → Para |
|---|---|---|---|
| Estrutura | 1 único `<h1>` com `<br>` + `<em>` para destaque | 2 elementos `<h1>` separados (line1 + line2) | Juntar em um único `<h1>` com `<br>` |
| `font-family` | `'Cormorant Garamond', serif` | `var(--sr)` = `'Cormorant Garamond', serif` | Igual |
| `font-size` | `4rem` | `1.9rem` | `1.9rem` → `4rem` (ou escala mobile menor, ~2.5rem) |
| `font-weight` | `300` | `300` | Igual |
| `color` (linha 1) | `#fff` | `var(--wh)` = `#FFFFFF` | Igual |
| `color` (destaque) | `<em style="color:#FF3CAC">` | line2 inteira em `var(--pk)`, italic | Mock: apenas a parte destacada (`v 1.0`) é pink. Atual: toda a segunda linha é pink. Separar — primeira linha toda branca, só a palavra final em pink |
| `font-style` (destaque) | `normal` (não itálico no mock hero) | `italic` na line2 | `italic` → `normal` |
| `line-height` | `1.06` | `1.1` | `1.1` → `1.06` |
| `margin-bottom` | `1.25rem` | (line2 tem `margin:0.25rem 0 0`) | Consolidar com margem única |

---

## 6. Subtitle / tagline

| Propriedade | Mock (Hero `<p>`) | Implementação atual (`.authscreen__subtitle`) | De → Para |
|---|---|---|---|
| `font-family` | `'Lato', sans-serif` (padrão body) | `var(--vd)` = `'Lato', sans-serif` | Igual |
| `font-size` | `1rem` | `0.85rem` | `0.85rem` → `1rem` |
| `color` | `rgba(255,255,255,.55)` | `rgba(255,255,255,0.55)` | Igual |
| `line-height` | `1.7` | (herdado ~1.4) | Adicionar `line-height: 1.7` |
| `max-width` | `460px` | (sem max-width) | Adicionar `max-width: 460px` |
| `margin-bottom` (mock) | `3rem` | `margin:0.75rem 0 0` | `0.75rem` → `3rem` |

---

## 7. Botão Google

| Propriedade | Mock (Button primitivo, variante outline/light) | Implementação atual (`.authscreen__google-btn`) | De → Para |
|---|---|---|---|
| `background` | `#fff` | `var(--wh)` | Igual |
| `border` | (Mock mostra `1.5px solid #D1D5DB` nos botões outline) | `none` | `none` → `1.5px solid #D1D5DB` |
| `padding` | `0.75rem 1rem` (referência button padrão) | `0.875rem 1.5rem` | Padding vertical OK, horizontal: `1.5rem` → `1rem` |
| `border-radius` | `0.5rem` (referência button) | `0.625rem` | Próximo, ambos aceitáveis |
| `font-family` | `'Lato', sans-serif` | `var(--vd)` | Igual |
| `font-size` | `0.875rem` | `0.875rem` | Igual |
| `font-weight` | `700` | `700` | Igual |
| hover effect | (sem referência mock no dark bg) | `opacity: 0.88` | Manter |

---

## 8. Link "Dev login"

| Propriedade | Mock (sem referência direta) | Implementação atual (`.authscreen__dev-link`) | Observação |
|---|---|---|---|
| `color` | — | `rgba(255,255,255,0.3)` | Muito apagado — mock usaria `rgba(255,255,255,0.5)` no mínimo |
| `font-size` | — | `0.75rem` | OK |
| hover | — | `color: rgba(255,255,255,0.6)` | OK |

---

## 9. Footer de termos

| Propriedade | Mock (sem referência direta) | Implementação atual (`.authscreen__terms`) | Observação |
|---|---|---|---|
| `color` | — | `rgba(255,255,255,0.35)` | OK para texto legal |
| `font-size` | — | `0.62rem` | OK |
| Link color | — | `var(--pk)` | OK |

---

## 10. Registration step (`.login-page--register`)

| Propriedade | Mock (surface de fundo claro) | Implementação atual (`.login-page--register`) | De → Para |
|---|---|---|---|
| `background` | `#F8F5F2` (em várias seções) | `#F8F5F2` | Igual |
| Card de registro | Mock não tem tela de registro explícita | `.registrationform` com cards brancos, borda `#EDE9E4`, `border-radius: 14px` | OK — segue padrão de card claro do mock |

---

## Resumo das divergências críticas

1. **Falta o card de vidro** — O mock envolve o conteúdo em uma superfície glass (`rgba(255,255,255,0.08)` + `blur(12px)`). A tela atual renderiza texto e botões diretamente no fundo escuro, sem card.

2. **Gradiente do fundo** — Ângulo (`140deg` vs `160deg`), mid-stop (`55%` vs `60%`), cor final (`#0A0A1A` vs `#0A0A0A`).

3. **Falta o segundo glow** — O mock tem um glow roxo (`rgba(176,62,255,.12)`) no canto inferior esquerdo. A tela atual só tem o glow pink superior direito.

4. **Headline** — Mock usa 1 único `<h1>` a `4rem` com destaque inline via `<em>`. Atual usa 2 `<h1>` separados a `1.9rem`, com a segunda linha inteira em pink + italic.

5. **Logo** — Tamanho `1.5rem` vs `2rem` do mock. Letter-spacing negativo vs positivo.

6. **Subtitle** — `0.85rem` sem max-width vs `1rem` com `max-width: 460px` + `line-height: 1.7` do mock.

7. **Tokens de glass do projeto não servem para tela escura** — `--glass`, `--glass-blur`, `--glass-brd` e `--glass-shadow` foram calibrados para vidro claro sobre `#F8F5F2`. O mock usa valores diferentes (muito mais transparentes) para superfícies sobre fundo preto.
