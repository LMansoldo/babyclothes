# Design — Registro/login por e-mail+senha e campos de perfil no registro

> Data: 2026-07-13 · Complementa: `2026-07-13-agent-focus-pf-registration-design.md` (spec WP0–WP8, "Chat com agente de bebês")
> Status: aprovado. O planejamento executável vive como WP9–WP11 + emendas de WP1/WP3/WP7/WP8 na spec WP.

## Problema

A spec do modo agente (WP0–WP8) será delegada a subagentes, mas:

1. A API só autentica via Google OAuth (`POST /auth/google`). Não existe coluna de senha, não há lib de hashing em `mix.exs` e `users.google_id` é `NOT NULL` — um usuário sem Google é impossível no schema atual. O WP3 admite isso com um `// TODO(api)` (a senha coletada na tela não é enviada).
2. O registro precisa coletar telefone, endereço, CEP, nacionalidade, cidade e estado — nada disso existe no banco (`users` não tem essas colunas) nem na spec do front (WP3 só tem cidade, e ela não é persistida).
3. Não existe tela nem endpoint de **login** por e-mail/senha.

## Decisões (validadas com o usuário)

| Decisão | Escolha |
|---|---|
| Obrigatoriedade dos campos de perfil no registro | **Todos obrigatórios** (no signup por e-mail) |
| UX do registro no front | **Wizard de 2 passos** (conta → contato/endereço) |
| Estrutura do endereço | **Linha única** (`address_line`) + CEP + cidade + estado (UF) |
| Autofill via ViaCEP | **Fora desta fase** |
| Abordagem da API | **Signup one-shot**: `POST /auth/signup` cria a conta já registrada como PF e devolve tokens |
| Hashing de senha | `bcrypt_elixir ~> 3.0` (com `Bcrypt.no_user_verify/0` contra timing attack) |

Abordagem descartada: signup em duas fases (conta mínima → `POST /auth/register`). Custa duas chamadas, deixa contas "pela metade" no banco e complica o tratamento de erro no front.

## API

- **Migration**: adiciona a `users`: `password_hash`, `phone`, `nationality`, `cep`, `address_line`, `city`, `state` (todas `:string`, nullable — usuários Google legados não têm perfil ainda); `google_id` vira nullable (o unique index continua válido, Postgres ignora NULLs).
- **`Api.Users.User`**: campo virtual `:password` (redact), `signup_changeset/2` (exige e-mail, nome, senha 8–72, CPF com checksum, e os 6 campos de perfil; `type` fixo `"pf"`; hasheia a senha), `registration_changeset/2` passa a **aceitar** os campos de perfil (valida formato quando presentes, sem exigir — o `RegisterScreen` do modo full não pode ser editado e não os envia). `changeset/2` (Google) fica intacto.
- **`Api.Users`** (contexto): `signup(attrs)` e `authenticate(email, password) → {:ok, user} | {:error, :invalid_credentials}` (usuário sem `password_hash` — ex. só Google — também recebe `invalid_credentials`, com `no_user_verify` para tempo constante).
- **Endpoints**:
  - `POST /auth/signup` → `201 {token, refresh_token, user}` | `422 {error: "validation_failed", details}` (inclui e-mail/CPF duplicado).
  - `POST /auth/login` → `200 {token, refresh_token, user}` | `401 {error: "invalid_credentials"}` | `400 {error: "missing_credentials"}`.
  - `user_json/1` passa a incluir os campos de perfil (nunca `password_hash`); `GET /auth/session` os expõe automaticamente.
- Validações de perfil: telefone 10–11 dígitos, CEP 8 dígitos, `state` ∈ 27 UFs, limites de tamanho nos textos. Wire sempre com dígitos puros (máscara é responsabilidade do front).

## Front (modo agent; modo full permanece pixel-idêntico)

- **WP3 emendado**: `RegisterPFScreen` vira wizard de 2 passos — passo 1 "Sua conta" (nome, e-mail, senha, CPF; botão Google só aqui), passo 2 "Contato e endereço" (telefone, nacionalidade pré-preenchida "Brasileira", CEP, endereço, cidade, estado via `Select` do DS). `RegisterPFInputSchema` = merge de `Step1Schema` + `Step2Schema` (Zod); máscaras de telefone/CEP em `value-objects/Contact.ts`. A action de `/register` chama `POST /auth/signup`, seta cookies com `setAuthCookies` (extraído do login para `$lib/server/auth-cookies.ts`) e redireciona a `/onboarding`. Erro de e-mail duplicado volta o wizard ao passo 1.
- **WP10 novo**: primitive `Select` no design system (não existe nenhum), espelhando a API do `Input` (label, error, hint, name), `<select>` nativo estilizado.
- **WP11 novo**: componente `EmailLoginForm` (a spec proíbe editar `LoginCard`) exibido em `/login` **somente em modo agent**, action `email` que chama `POST /auth/login`. Flag nova `emailLogin` em `FeatureFlags` (WP1 emendado).
- **WP7 emendado**: chaves i18n pt+en para passos do wizard, novos campos, login por e-mail e validações.
- **WP8 emendado**: QA cobre signup completo nos 2 passos, login e-mail/senha, senha errada, e-mail duplicado e persistência do perfil no `GET /auth/session`.

## Fora de escopo (registrado para depois)

- Rate limiting em `/auth/login` e `/auth/signup` (exigência do CLAUDE.md da API para rotas críticas — tratar em spec própria antes de produção).
- Recuperação de senha, verificação de e-mail, vincular senha a conta Google existente.
- ViaCEP / autofill de endereço.
- Coleta dos campos de perfil no fluxo Google do modo full (o `/auth/register` já os aceita; a UI do modo full fica para outra spec).

## Testes

- ExUnit: changesets (signup válido/inválido por campo), contexto (`signup`, `authenticate` ok/senha errada/usuário Google), controller (201/422/409-details, 200/401/400).
- Vitest: schemas Zod por passo, máscaras de `Contact.ts`, wizard (avança só com passo 1 válido, volta, submit final), `Select`, `EmailLoginForm`, actions de `/register` e `/login` (mock de fetch).
