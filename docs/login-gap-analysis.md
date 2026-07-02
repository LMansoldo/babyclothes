# Analise de Viabilidade — Rota `/login` vs Mockup Spec

> Comparacao entre `docs/login-route-elements.md` (mockup spec) e a implementacao atual em `apps/web/src/routes/login/`.

---

## Resumo

A estrutura geral e a logica de fluxo (3-step state machine: `login` → `register` → `redirecting`) estao **alinhadas** com o mockup. Porem, ha discrepancias visuais e estruturais importantes que precisam ser corrigidas para atingir o pixel-perfect especificado.

### Score de aderencia atual

| Tela | Aderencia visual estimada | Problemas |
|------|--------------------------|-----------|
| `/login` (dark) | ~70% | Faltam status bar, glow desproporcional, fontes inconsistentes, botoes divergentes |
| `/login · registro` | ~80% | Fluxo em 2 sub-steps em vez de tela unica, mockup nao divide select/document |

---

## 1. Tela 01 — `/login` (Dark Screen)

### 1.1 O que esta correto (manter)

| Elemento | Status |
|----------|--------|
| Background gradiente escuro (`.login-page`) | `linear-gradient(160deg, #0F0F0F 0%, #1A0814 60%, #0A0A0A 100%)` — identico ao mockup |
| Fonte do headline line 1 e 2 | `var(--sr)` = Cormorant Garamond, 1.9rem, weight 300 ✓ |
| Headline line 2 rosa italico | `color: var(--pk); font-style: italic` ✓ |
| Fonte do logo | `var(--ld)` = Londrina Solid ✓ |
| Margens do logo | `margin-top: 3.25rem` (52px), `margin-bottom: 3.5rem` (56px) ✓ |
| Spacer para empurrar termos | `flex: 1` ✓ |
| Fonte corpo/botoes | `var(--vd)` = Lato ✓ |
| Layout flex column | ✓ |

### 1.2 O que precisa ser modificado

#### A. Status Bar (ausente — CRIAR)

O mockup tem uma status bar de 22px com hora e icone de bateria. **Nao existe no codigo atual.**

```css
/* NOVO — mockup spec */
height: 22px;
padding: 0 16px;
display: flex;
align-items: center;
justify-content: space-between;
font-size: 0.6rem;
font-weight: 700;
color: rgba(255,255,255,0.6);
```

**Acao**: Adicionar `div` de status bar dentro do `AuthScreen` ou no `+page.svelte`.

#### B. Glow decorativo (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| position | `absolute` | `fixed` | Deve ser absolute |
| top | `-60px` | `-15rem` | Escala errada |
| right | `-40px` | `-15rem` | Escala errada |
| width | `260px` | `40rem` | Muito grande |
| height | `260px` | `40rem` | Muito grande |
| opacity | `0.22` | `0.15` | Muito fraco |
| gradient stop | `65%` | `60%` | Spread diferente |

#### C. Logo (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| Drop icon | SVG 26x32 | CSS pseudo-elemento 1.2rem x 1.6rem | SVG vs CSS. Mockup usa SVG pink droplet |
| Cor do texto | `#fff` ("BabyClothes" todo branco) | "Baby" branco + "Clothes" rosa (`var(--pk)`) | Mockup NÃO tem "Clothes" em rosa |
| Gap logo-texto | `10px` | `0.45rem` (7.2px) | Muito pequeno |

**Acao**:
- Substituir CSS drop por SVG inline do droplet (o mesmo usado no mockup e no design system hero)
- Remover `<em>` rosa em "Clothes" — texto inteiro da logo deve ser branco
- Ajustar gap para 10px

#### D. Headline font style (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| letter-spacing | `-0.01em` (mockup nao especifica; herdado) | `-0.01em` | OK |
| text-align center | ok | ok | OK |

**Mockup nao usa `letter-spacing: -0.01em`**. Confirmar se deve manter ou remover.

#### E. Subtitulo (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| font-size | `0.8rem` | `0.85rem` | Levemente maior que mockup |
| font-family | Lato | `var(--vd)` = Lato ✓ | OK |
| color opacity | `rgba(255,255,255,0.45)` | `rgba(255,255,255,0.55)` | Mais claro que mockup |
| margin-bottom | `52px` | `0.75rem 0 0` (~12px de margem superior ao titulo) | Estruturalmente diferente. Mockup: headline → margin-bottom: 10px na ultima linha → subtitle → margin-bottom: 52px antes do botao. Atual: subtitle com margin-top ao titulo |

**Acao**: Ajustar margins para o ritmo do mockup: `10px` entre headline e subtitle, `52px` entre subtitle e botao.

#### F. Google Sign-In Button (MODIFICAR)

O maior problema aqui: **o mockup mostra um botao customizado com G logo + texto**, mas o codigo atual renderiza o GSI (Google Identity Services) `renderButton` que gera um iframe com estilo padrao Google.

| Propriedade | Mockup | Atual (fallback) | Atual (GSI) |
|-------------|--------|-------------------|-------------|
| border-radius | `10px` | `0.625rem` (10px) | renderButton padrao |
| padding | `14px` | `0.875rem 1.5rem` | renderButton |
| gap | `10px` | `0.6rem` (9.6px) | N/A |
| border | none | none | renderButton |
| font | Lato 0.875rem 700 | `var(--vd)` 0.875rem 700 | font Google |
| margin-bottom | `12px` | N/A | N/A |
| Dev button margin-top | N/A | N/A | 0.85rem gap via flex |
| width | `100%` | `100%` | renderButton |

**Decisao arquitetural**: Manter GSI para login real (seguranca/compliance), mas garantir que o fallback visual (quando GSI nao carregou) corresponda exatamente ao mockup. Quando GSI estiver ativo, aceitar o estilo renderizado pelo Google como variacao toleravel.

**Acoes**:
- Garantir que o botao fallback (nao-GSI) corresponda ao mockup: padding 14px, gap 10px, border-radius: 10px, Lato
- Remover `margin-top` inline, usar `margin-bottom: 12px` no botao Google e gap 0 no dev button

#### G. Dev Link Button (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| cor | `rgba(255,255,255,0.3)` | `rgba(255,255,255,0.3)` ✓ | OK |
| font | Lato | `var(--vd)` = Lato ✓ | OK |
| texto | "Entrar sem autenticacao (dev)" | `$t('auth.dev_login')` → "Dev Login" (en) | i18n — precisa ter traducao pt-BR compativel |
| padding | `4px` | `0.25rem` (4px) ✓ | OK |

#### H. Legal / Terms Text (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| cor | `rgba(255,255,255,0.28)` | `rgba(255,255,255,0.35)` | Mais claro que mockup |
| links | `underline` na cor do texto | `var(--pk)` rosa | Mockup nao usa rosa nos links legais |
| font | Lato | `var(--vd)` = Lato ✓ | OK |
| font-size | `0.62rem` ✓ | `0.62rem` ✓ | OK |

**Acao**: Alterar links de termos para branco com underline (nao rosa), ajustar opacidade para 0.28.

#### I. Dimensoes do container (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| max-width | `360px` (frame fixo) | `max-width: 40rem` (640px) | Muito largo. Mockup e mobile-first com 360px fixo |
| border-radius | `14px` no frame | sem border-radius | A `.login-page` nao tem border-radius |
| box-shadow | `0 4px 24px rgba(0,0,0,.2)` | sem shadow | Mockup tem shadow no frame |

**Analise**: O mockup foi desenhado como frame de dispositivo movel (360x760px). Em producao responsiva, o ideal e:
- Manter o fundo full-width (como atual)
- Centralizar o conteudo com `max-width: 360px` para telas maiores
- Nao aplicar border-radius/shadow na page (apenas no mockup simulando dispositivo)

**Acao**: Reduzir `max-width` do AuthScreen para ~360px e centralizar.

---

## 2. Tela 02 — `/login · registro` (Light Screen)

### 2.1 O que esta correto (manter)

| Elemento | Status |
|----------|--------|
| Background off-white | `#F8F5F2` (via `.login-page--register`) ✓ |
| Back button (circulo branco, borda `#EDE9E4`) | ✓ |
| Fonte titulo "Criar conta" | Cormorant Garamond 1.35rem ✓ |
| Fonte titulo "Escolha o seu perfil" | Cormorant Garamond 1.5rem, weight 300 ✓ |
| PF/PJ cards layout, icones, checkmark | ✓ |
| Card selecionado com borda rosa 2px + shadow | ✓ |
| CPF input styling | ✓ |
| Botao submit rosa com shadow | ✓ |

### 2.2 O que precisa ser modificado

#### A. Fluxo de sub-steps (MODIFICAR estrutura)

**Mockup**: Tela unica com todos os elementos visiveis simultaneamente:
- Header (back + "Criar conta")
- Texto "Como voce vai usar..."
- Titulo "Escolha o seu perfil"
- Card PF (selecionado por default)
- Card PJ
- Label "Seu CPF"
- Input CPF
- Botao "Continuar"

**Atual**: Fluxo em 2 sub-steps:
1. `step === 'select'`: mostra os cards PF/PJ
2. `step === 'document'`: mostra o campo CPF/CNPJ

**Decisao**: Manter o fluxo em 2 steps e uma boa UX (progressivo, evita scroll). Porem, o comportamento do back button esta estranho:
- No step `select`, o `goBack()` reseta para `select` (nop efetivo). O mockup mostra back button que deveria voltar para a tela de login.
- Corrigir: no step `select`, back button deve voltar para `step = 'login'` (nao implementado — precisa de callback `onBack`).

**Acoes**:
- Adicionar prop `onBack` no `RegistrationForm` para voltar a tela de login
- No step `select`: back button chama `onBack?.()` (volta ao login)
- No step `document`: back button chama `goBack()` (volta ao select) — ja funciona ✓

#### B. Fonte nos cards (MODIFICAR)

| Propriedade | Mockup | Atual | Issue |
|-------------|--------|-------|-------|
| Option label font | Lato, weight 700 | `var(--vd)` = Lato ✓ | OK |
| Option desc font | Lato | `var(--vd)` = Lato ✓ | OK |

#### C. Ajustes finos de espacamento (MODIFICAR)

| Local | Mockup | Atual | Issue |
|-------|--------|-------|-------|
| PF card margin-bottom | `12px` | flex gap `12px` ✓ | OK |
| PJ card margin-bottom | `32px` | flex gap `12px` | Deveria ser 32px abaixo do ultimo card antes do input |
| Input margin-bottom | `20px` | `20px` ✓ | OK |

**Acao**: Adicionar `margin-bottom: 32px` no ultimo card (ou no container dos cards) ANTES do input section.

#### D. Back button na tela de select (CORRIGIR)

No mockup, o back button esta presente na tela de registro e deve retornar ao login. Atualmente:
- `AuthScreen` nao expoe callback de navegacao
- `+page.svelte` nao gerencia navegacao "back to login" a partir do `RegistrationForm`
- `RegistrationForm` aceita `onComplete` mas nao tem `onBack`

**Acao**: Adicionar prop `onBack` em `RegistrationForm`, propaga-la ao `+page.svelte` para setar `step = 'login'`.

---

## 3. Problemas transversais

### 3.1 Spinner custom vs Design System Spinner

| Local | Usa DS Spinner? | Deveria? |
|-------|-----------------|----------|
| `AuthScreen` (loading) | Nao — custom CSS | Sim |
| `RegistrationForm` (loading) | Nao — custom CSS | Sim |
| `LoginCard` (loading) | Sim ✓ | Sim |
| `+page.svelte` (redirecting) | Nao — custom CSS | Sim |

**Acao**: Substituir todos os spinners custom pelo `Spinner` do design system.

### 3.2 Design System Button nao utilizado

Todos os botoes usam `<button>` nativo com BEM styling. O DS tem `Button` primitivo e `IconButton`.

**Decisao**: Manter botoes nativos com BEM para maior controle visual (os botoes do mockup nao seguem exatamente as variantes do DS Button). Nao usar DS Button na rota de login.

### 3.3 Hardcoded strings (portugues)

```svelte
<!-- RegistrationForm.svelte linha 71 -->
aria-label="Voltar"
<!-- linha 76 e 141 -->
<span class="registrationform__header-title">Criar conta</span>
```

**Acao**: Usar `$t()` para "Criar conta" e `aria-label`. Adicionar chaves faltantes ao i18n:
- `auth.registration.title_header` → "Criar conta" (pt) / "Create account" (en)
- `auth.registration.back_aria` → "Voltar" (pt) / "Back" (en)

### 3.4 Variaveis CSS — aliases vs nomes semanticos

O codigo atual usa os aliases curtos (`--pk`, `--wh`, `--bk`, `--of`, `--sr`, `--vd`, `--ld`). O mockup referencia os nomes semanticos (`#FF3CAC`, `#111`, `#fff`, `#F8F5F2`).

**Estado**: OK. Os aliases mapeiam corretamente. Nao mudar.

### 3.5 Fontes

| Alias | Fonte | Uso mockup | Uso atual |
|-------|-------|-----------|-----------|
| `--ld` | Londrina Solid | Logo "BabyClothes" | Logo "BabyClothes" ✓ |
| `--sr` | Cormorant Garamond | Headlines, titulos | Headlines, titulos ✓ |
| `--vd` | Lato | Corpo, botoes, inputs | Corpo, botoes, inputs ✓ |

**Conclusao**: Mapeamento de fontes correto. Manter.

### 3.6 `LoginCard.svelte` — Componente nao utilizado

`LoginCard` existe mas nao e usado pela rota `/login`. E uma alternativa visual com glass card centralizado.

**Acao**: Nenhuma necessaria agora. Manter como componente disponivel. Se for decidido remove-lo, fazer em PR separado.

---

## 4. Tabela de acoes necessarias

### Acoes CRITICAS (bloqueiam aderencia ao mockup)

| # | Arquivo | Acao | Tipo |
|---|---------|------|------|
| 1 | `AuthScreen.svelte` | Adicionar status bar (22px, hora + bateria) | Novo elemento |
| 2 | `AuthScreen.svelte` | Corrigir glow: position absolute, dimensoes 260px, opacity 0.22 | Modificar CSS |
| 3 | `AuthScreen.svelte` | Substituir CSS drop por SVG droplet inline (26x32) | Modificar HTML |
| 4 | `AuthScreen.svelte` | Logo texto todo branco — remover `<em>` rosa | Modificar HTML |
| 5 | `AuthScreen.svelte` | Ajustar gap logo para 10px | Modificar CSS |
| 6 | `AuthScreen.svelte` | Corrigir margins subtitle: headline +10px → subtitle +52px → botao | Modificar CSS |
| 7 | `AuthScreen.svelte` | Ajustar opacidades: subtitle=0.45, terms=0.28, links=white underline | Modificar CSS |
| 8 | `AuthScreen.svelte` | Botao Google fallback: padding 14px, gap 10px, Lato, border-radius: 10px | Modificar CSS |
| 9 | `AuthScreen.svelte` | Reduzir max-width para 360px | Modificar CSS |
| 10 | `RegistrationForm.svelte` | Adicionar prop `onBack` + back button no step select chama `onBack` | Modificar logica |
| 11 | `RegistrationForm.svelte` | Margin-bottom de 32px entre cards e input section | Modificar CSS |
| 12 | `+page.svelte` | Passar `onBack` callback ao RegistrationForm para voltar ao login | Modificar logica |

### Acoes IMPORTANTES (qualidade e consistencia)

| # | Arquivo | Acao | Tipo |
|---|---------|------|------|
| 13 | `AuthScreen.svelte` | Substituir spinner custom por DS `Spinner` | Refactor |
| 14 | `RegistrationForm.svelte` | Substituir spinner custom por DS `Spinner` | Refactor |
| 15 | `+page.svelte` | Substituir spinner custom por DS `Spinner` | Refactor |
| 16 | `RegistrationForm.svelte` | Usar `$t()` para "Criar conta" e aria-label | i18n |
| 17 | `en.json` | Adicionar chaves `auth.registration.title_header`, `auth.registration.back_aria` | i18n |
| 18 | `pt.json` | Adicionar chaves `auth.registration.title_header`, `auth.registration.back_aria` | i18n |

### Acoes OPCIONAIS (nice-to-have)

| # | Arquivo | Acao | Tipo |
|---|---------|------|------|
| 19 | `AuthScreen.svelte` | Adicionar `margin-top: 52px` no logo, `margin-bottom: 56px` | Refinar CSS |
| 20 | `AuthScreen.svelte` | Adicionar transicoes entre steps (fade) | UX |
| 21 | `LoginCard.svelte` | Avaliar remocao (componente nao utilizado) | Cleanup |

---

## 5. O que NAO modificar

| Elemento | Motivo |
|----------|--------|
| Estrutura de pastas (Clean Architecture) | Correta e conforme RULES.md |
| Svelte 5 runes ($props, $state, $derived) | Padrao do projeto |
| BEM naming convention | Padrao do projeto |
| CSS tokens/variaveis | Corretamente mapeados |
| Sistema de i18n com `$t()` | Funcionando |
| Logica de autenticacao (Google OAuth + GSI) | Funcional — alterar apenas o visual |
| Fluxo em 2 sub-steps no registro | Boa UX — manter a divisao select → document |
| Uso de `<button>` nativo em vez de DS Button | Da mais controle sobre o estilo exato do mockup |
| `LoginCard` (mesmo nao usado) | Remover em cleanup separado se necessario |

---

## 6. Ordem de implementacao recomendada

```
Fase 1 — AuthScreen visual (acoes 1-9)
  → Ajustar glow, logo, status bar, margins, opacidades, max-width

Fase 2 — RegistrationForm (acoes 10-12, 11)
  → onBack prop, margin cards→input, back button behaviour

Fase 3 — i18n e Spinners (acoes 13-18)
  → DS Spinner, chaves i18n, strings hardcoded

Fase 4 — Refinamentos (acoes 19-21)
  → Margens precisas, transicoes, cleanup
```

---

## 7. Estimativa de esforco

| Fase | Arquivos tocados | Esforco |
|------|-----------------|---------|
| Fase 1 | 1 arquivo (AuthScreen.svelte) | Medio — ~50 linhas de CSS/HTML |
| Fase 2 | 2 arquivos (RegistrationForm, +page.svelte) | Baixo — ~15 linhas de logica |
| Fase 3 | 4 arquivos (2 components, 2 i18n, +page) | Baixo — troca de componentes |
| Fase 4 | 1-2 arquivos | Baixo |

**Total**: ~3-4 horas de trabalho focado.
