# Rota `/login` — Elementos, Classnames e Estilos CSS

> Extraido de `BabyClothes Mocks.dc.html` (2026-06-26)
> Nota: Os mockups usam apenas estilos inline. Nao ha classnames CSS — os elementos sao identificados pela estrutura e hierarquia.

---

## Estilos globais (helmet)

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Lato', sans-serif; -webkit-font-smoothing: antialiased; }
```

Fontes carregadas: **Lato** (300, 400, 700, 900), **Cormorant Garamond** (300, 400, 600, italicos), **Londrina Solid**

---

## 01 — `/login` (Tela inicial)

Moldura: `360x760px`, fundo escuro com gradiente, cantos arredondados.

### Estrutura de elementos

```
div.frame (360x760, border-radius:14px, overflow:hidden, box-shadow, bg gradient)
├── div.glow-top-right (pos:absolute, radial-gradient rosa, pointer-events:none)
├── div.status-bar (height:22px)
│   ├── span (hora "10:30")
│   └── div.battery-icon
├── div.content-wrapper (flex, flex-direction:column, align-items:center)
│   ├── div.logo-row (flex, align-items:center, gap:10px)
│   │   ├── svg logo (pk droplet, 26x32)
│   │   └── span (BabyClothes, fonte Londrina)
│   ├── div.headline (text-align:center)
│   │   ├── div "Compre e venda"
│   │   ├── div "roupas inteligentes" (rosa, italico)
│   ├── div.subheadline "para bebes e criancas · com IA"
│   ├── button.google-signin
│   │   ├── svg Google G logo (18x18)
│   │   └── text "Continuar com Google"
│   ├── button.dev-skip "Entrar sem autenticacao (dev)"
│   ├── div.spacer (flex:1)
│   └── div.legal-text (Termos de Uso / Politica de Privacidade)
```

### Estilos por elemento

#### `.frame` (container principal)
```css
width: 360px;
height: 760px;
border-radius: 14px;
overflow: hidden;
position: relative;
box-shadow: 0 4px 24px rgba(0,0,0,0.2);
background: linear-gradient(160deg, #0F0F0F 0%, #1A0814 60%, #0A0A1A 100%);
```

#### `.glow-top-right`
```css
position: absolute;
top: -60px;
right: -40px;
width: 260px;
height: 260px;
background: radial-gradient(circle, rgba(255,60,172,0.22) 0%, transparent 65%);
pointer-events: none;
```

#### `.status-bar`
```css
height: 22px;
padding: 0 16px;
display: flex;
align-items: center;
justify-content: space-between;
font-size: 0.6rem;
font-weight: 700;
color: rgba(255,255,255,0.6);
```

#### `.status-bar span` (hora)
```css
/* herda status-bar font styles */
```

#### `.battery-icon`
```css
width: 14px;
height: 7px;
border: 1.5px solid rgba(255,255,255,0.5);
border-radius: 2px;
padding: 1px;
```
Filho interno (preenchimento bateria):
```css
width: 80%;
height: 100%;
background: rgba(255,255,255,0.5);
border-radius: 1px;
```

#### `.content-wrapper`
```css
display: flex;
flex-direction: column;
align-items: center;
padding: 0 28px 28px;
height: calc(100% - 22px);
```

#### `.logo-row`
```css
display: flex;
align-items: center;
gap: 10px;
margin-top: 52px;
margin-bottom: 56px;
```

#### `.logo-row span` (BabyClothes)
```css
font-family: 'Londrina Solid', cursive;
font-size: 1.6rem;
color: #fff;
letter-spacing: 0.02em;
```

#### `.headline`
```css
text-align: center;
margin-bottom: 10px;
```

#### `.headline div:first-child` ("Compre e venda")
```css
font-family: 'Cormorant Garamond', serif;
font-size: 1.9rem;
font-weight: 300;
color: #fff;
line-height: 1.1;
```

#### `.headline div:last-child` ("roupas inteligentes")
```css
font-family: 'Cormorant Garamond', serif;
font-size: 1.9rem;
font-weight: 300;
color: #FF3CAC;
font-style: italic;
line-height: 1.1;
```

#### `.subheadline` ("para bebes e criancas · com IA")
```css
font-size: 0.8rem;
color: rgba(255,255,255,0.45);
margin-bottom: 52px;
```

#### `button.google-signin`
```css
width: 100%;
display: flex;
align-items: center;
justify-content: center;
gap: 10px;
padding: 14px;
border-radius: 10px;
background: #fff;
border: none;
cursor: pointer;
font-family: 'Lato', sans-serif;
font-size: 0.875rem;
font-weight: 700;
color: #111;
margin-bottom: 12px;
```

#### `button.dev-skip`
```css
font-size: 0.75rem;
color: rgba(255,255,255,0.3);
background: none;
border: none;
cursor: pointer;
padding: 4px;
font-family: 'Lato', sans-serif;
```

#### `.legal-text`
```css
font-size: 0.62rem;
color: rgba(255,255,255,0.28);
text-align: center;
line-height: 1.6;
```
Links internos (Termos de Uso, Politica de Privacidade):
```css
text-decoration: underline;
/* inherit .legal-text styles */
```

---

## 02 — `/login · registro` (Criar conta)

Moldura: `360x760px`, fundo claro `#F8F5F2`, sombra suave.

### Estrutura de elementos

```
div.frame (360x760, border-radius:14px, overflow:hidden, box-shadow, bg #F8F5F2)
├── div.status-bar (light version)
│   ├── span (hora "10:30")
│   └── div.battery-icon (dark)
├── div.content (padding:16px 20px, flex column)
│   ├── div.header-row (flex, align-items:center, gap:8px)
│   │   ├── button.back (circle, border 1.5px #EDE9E4)
│   │   │   └── svg arrow-left
│   │   └── span "Criar conta" (Cormorant Garamond)
│   ├── div.helper-text "Como voce vai usar o BabyClothes?"
│   ├── div.title "Escolha o seu perfil" (Cormorant Garamond)
│   ├── div.card-pf (selected — border 2px #FF3CAC, shadow rosa)
│   │   ├── div.icon-pf (40x40, bg #FFE8F5)
│   │   │   └── svg user icon
│   │   ├── div.text-area (flex:1)
│   │   │   ├── div.label "Pessoa Fisica"
│   │   │   └── div.description "Venda roupas dos seus filhos..."
│   │   └── div.checkmark (18x18 circle, bg #FF3CAC)
│   │       └── svg check
│   ├── div.card-pj (unselected — border 1.5px #EDE9E4)
│   │   ├── div.icon-pj (40x40, bg #F3F4F6)
│   │   │   └── svg building icon
│   │   ├── div.text-area (flex:1)
│   │   │   ├── div.label "Pessoa Juridica"
│   │   │   └── div.description "Loja ou empresa..."
│   ├── div.input-label "Seu CPF"
│   ├── div.input-field (CPF placeholder)
│   └── button.submit "Continuar" (→ arrow icon)
```

### Estilos por elemento

#### `.frame` (container principal)
```css
width: 360px;
height: 760px;
border-radius: 14px;
overflow: hidden;
position: relative;
box-shadow: 0 4px 24px rgba(0,0,0,0.12);
background: #F8F5F2;
```

#### `.status-bar` (light)
```css
height: 22px;
padding: 0 16px;
display: flex;
align-items: center;
justify-content: space-between;
font-size: 0.6rem;
font-weight: 700;
color: #111;
```
Battery (dark):
```css
width: 14px;
height: 7px;
border: 1.5px solid #111;
border-radius: 2px;
padding: 1px;
```
Battery fill:
```css
width: 80%;
height: 100%;
background: #111;
border-radius: 1px;
```

#### `.content`
```css
padding: 16px 20px;
height: calc(100% - 22px);
display: flex;
flex-direction: column;
```

#### `.header-row`
```css
display: flex;
align-items: center;
gap: 8px;
margin-bottom: 28px;
```

#### `button.back`
```css
width: 32px;
height: 32px;
border-radius: 50%;
background: #fff;
border: 1.5px solid #EDE9E4;
display: flex;
align-items: center;
justify-content: center;
cursor: pointer;
```

#### `.header-row span` ("Criar conta")
```css
font-family: 'Cormorant Garamond', serif;
font-size: 1.35rem;
font-weight: 400;
color: #111;
```

#### `.helper-text` ("Como voce vai usar o BabyClothes?")
```css
margin-bottom: 6px;
font-size: 0.78rem;
color: #6B7280;
```

#### `.title` ("Escolha o seu perfil")
```css
font-family: 'Cormorant Garamond', serif;
font-size: 1.5rem;
font-weight: 300;
color: #111;
margin-bottom: 24px;
```

#### `.card-pf` (Pessoa Fisica — selecionado)
```css
background: #fff;
border: 2px solid #FF3CAC;
border-radius: 14px;
padding: 16px;
margin-bottom: 12px;
display: flex;
align-items: flex-start;
gap: 14px;
box-shadow: 0 2px 12px rgba(255,60,172,0.12);
```

#### `.icon-pf`
```css
width: 40px;
height: 40px;
border-radius: 10px;
background: #FFE8F5;
display: flex;
align-items: center;
justify-content: center;
flex-shrink: 0;
```

#### `.card-pf .label` ("Pessoa Fisica")
```css
font-size: 0.9rem;
font-weight: 700;
color: #111;
margin-bottom: 2px;
```

#### `.card-pf .description`
```css
font-size: 0.75rem;
color: #6B7280;
line-height: 1.5;
```

#### `.checkmark` (indicador selecionado)
```css
width: 18px;
height: 18px;
border-radius: 50%;
background: #FF3CAC;
display: flex;
align-items: center;
justify-content: center;
flex-shrink: 0;
margin-top: 2px;
```

#### `.card-pj` (Pessoa Juridica — nao selecionado)
```css
background: #fff;
border: 1.5px solid #EDE9E4;
border-radius: 14px;
padding: 16px;
margin-bottom: 32px;
display: flex;
align-items: flex-start;
gap: 14px;
```
> Mesma estrutura interna que `.card-pf`, sem `box-shadow`

#### `.icon-pj`
```css
width: 40px;
height: 40px;
border-radius: 10px;
background: #F3F4F6;
display: flex;
align-items: center;
justify-content: center;
flex-shrink: 0;
```

#### `.input-label` ("Seu CPF")
```css
margin-bottom: 8px;
font-size: 0.78rem;
font-weight: 700;
color: #374151;
```

#### `.input-field` (CPF)
```css
background: #fff;
border: 1.5px solid #D1D5DB;
border-radius: 10px;
padding: 14px 16px;
font-size: 0.9rem;
color: #111;
margin-bottom: 20px;
```

#### `button.submit` ("Continuar")
```css
width: 100%;
padding: 14px;
border-radius: 10px;
background: #FF3CAC;
border: none;
cursor: pointer;
font-family: 'Lato', sans-serif;
font-size: 0.9rem;
font-weight: 700;
color: #fff;
display: flex;
align-items: center;
justify-content: center;
gap: 8px;
box-shadow: 0 4px 16px rgba(255,60,172,0.3);
```

---

## Variaveis CSS referenciadas

| Variavel | Valor | Uso |
|---|---|---|
| `--color-pk` | `#FF3CAC` | Cor primaria rosa |
| `--color-pk-soft` | `#FFE8F5` | Fundo de icone selecionado |
| `--color-bk` | `#111111` | Preto / texto escuro |
| `--color-wh` | `#FFFFFF` | Branco |
| `--color-of` | `#F8F5F2` | Off-white / fundo claro |
| Google Blue | `#4285F4` | SVG do botao Google |
| Google Green | `#34A853` | SVG do botao Google |
| Google Yellow | `#FBBC05` | SVG do botao Google |
| Google Red | `#EA4335` | SVG do botao Google |

## Fontes utilizadas

| Fonte | Uso na rota |
|---|---|
| `'Londrina Solid', cursive` | Logo "BabyClothes" |
| `'Cormorant Garamond', serif` | Headlines, titulo "Criar conta", "Escolha o seu perfil" |
| `'Lato', sans-serif` | Corpo, botoes, inputs, labels, texto legal |
