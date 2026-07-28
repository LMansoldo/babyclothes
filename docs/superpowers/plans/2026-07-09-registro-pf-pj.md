# Rota de Registro PF/PJ — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a tela de registro PF/PJ (mock `data-dc-tpl="41"`, tela "02 · /login · registro") como rota dedicada `/register`, com componentes atômicos no design system, endpoint `POST /auth/register` na API e correção do schema `users.type` no banco.

**Architecture:** O registro deixa de ser um "step" embutido em `/login` e vira a rota `/register` (SvelteKit form action → `POST /auth/register`). No design system entram dois composites novos (`SelectionCard`, `SelectionCardGroup`) e o primitive `Input` ganha props `inputmode`/`maxlength`/`name`. Na API entra o contexto `Api.Users` (DDD — controller passa a delegar), validação de dígito verificador de CPF/CNPJ (`Api.Users.Document`) e migration que torna `users.type` nullable (hoje `NOT NULL DEFAULT 'pf'` quebra o fluxo que usa `type = null` como "precisa registrar" — e quebra o próprio primeiro login Google, porque o default `"pf"` do schema dispara `validate_required(:cpf)` na criação do usuário).

**Tech Stack:** SvelteKit 2 + Svelte 5 (runes), Elixir + Plug/Ecto, PostgreSQL 16, Vitest + @testing-library/svelte, ExUnit + ExMachina, Yarn 4 workspaces, Docker.

## Global Constraints

- **Docker first**: todo comando via scripts yarn da raiz (`yarn test:api`, `yarn test:ds`, `yarn test:web`, `yarn check`, `yarn api:migrate`, `yarn api:credo`, `yarn lint`). Nunca rodar mix/vite direto no host.
- **CSS**: nunca `px`, sempre `rem`. BEM estrito `.block__element--modifier`. Tokens de `packages/design-system/src/tokens/tokens.css` (`--pk`, `--wh`, `--bk`, `--of2`, `--color-pk-soft`, `--shadow-pk`, `--transition-fast`, `--font-lato`...).
- **TypeScript**: nunca `any`; usar `unknown` + narrowing.
- **Svelte 5**: runes (`$props()`, `$state()`, `$derived()`, `$bindable()`, `Snippet`), props tipadas inline.
- **i18n**: toda string visível em `apps/web/src/lib/i18n/en.json` **e** `pt.json`; usar `$t('key')`. Componentes do design system NÃO importam i18n — recebem strings por props.
- **Ícones**: sem emojis. No app web usar `lucide-svelte`; no design system, SVG inline ou `Snippet` recebido por prop.
- **Elixir**: lógica de negócio em contextos (`Api.Users`), controller só delega; `{:ok, _}/{:error, _}`; `@moduledoc`/`@doc`/`@spec` em módulos e funções públicas; credo sem warnings; migrations aplicadas são imutáveis (criar novas).
- **Commits semânticos**: `feat(scope):`, `fix(scope):`, `test(scope):`; um commit por task; terminar a mensagem com `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- **Documentos válidos** (dígito verificador OK, usar exatamente estes em seeds/testes):
  - CPFs: `52998224725`, `11144477735`, `76523910083`, `39053344705`, `12345678909`
  - CNPJs: `11222333000181`, `11444777000161`, `45399755000149`
  - Inválidos para testes negativos: `11111111111` (repetido), `12345678900` (DV errado), `11222333000180` (DV errado).

## Referência de layout — mock `data-dc-tpl="41"` (tela 02)

Fonte: `BabyClothes architecture diagrams/BabyClothes Mocks.dc.html` linhas 70–115. O app usa root `font-size: 125%` (1rem = 20px), então px do mock ÷ 20 = rem.

| Elemento | Mock | Implementação |
|---|---|---|
| Fundo da página | `#F8F5F2` | `var(--of)` |
| Header | botão voltar circular 32px branco borda `#EDE9E4` + título "Criar conta" serif 1.35rem | `IconButton icon="back" variant="glass" size={32}` + `<h1>` `var(--sr)` `1.35rem` peso 400 `var(--bk)` |
| Lead | "Como você vai usar o BabyClothes?" `.78rem #6B7280` | `$t('auth.registration.subtitle_top')` |
| Título | "Escolha o seu perfil" serif 1.5rem light | `$t('auth.registration.title')`, `var(--sr)` `1.5rem` peso 300 |
| Card de opção | branco, borda `1.5px #EDE9E4` raio 14px, padding 16px, gap 14px; selecionado: borda `2px #FF3CAC` + sombra rosa | `SelectionCard`: `var(--wh)`, borda `0.075rem var(--of2)` raio `0.7rem`, padding `0.8rem`, gap `0.7rem`; selecionado `0.1rem var(--pk)` + `box-shadow: 0 0.1rem 0.6rem rgba(255,60,172,.12)` |
| Ícone do card | 40px raio 10px; PF fundo `#FFE8F5` ícone rosa; PJ fundo `#F3F4F6` ícone cinza | `2rem`, raio `0.5rem`, tones `brand` = `var(--color-pk-soft)` / `neutral` = `#F3F4F6` |
| Checkmark | círculo 18px rosa com check branco | `0.9rem` `var(--pk)`, SVG inline |
| Label do documento | "Seu CPF" `.78rem` bold `#374151` | label do `Input` (`cpf_label`/`cnpj_label`) |
| Campo | branco borda `1.5px #D1D5DB` raio 10px, placeholder `000.000.000-00` | primitive `Input` (já é branco/borda `#D1D5DB`) |
| Botão | full-width rosa, bold, seta →, sombra rosa | `Button variant="pk" size="lg"` + `ArrowRight` do lucide via `children` |

Textos PF/PJ (já existem em i18n): "Pessoa Física (PF)" / "Venda roupas dos seus filhos. Requer CPF para verificação." e "Pessoa Jurídica (PJ)" / "Loja ou empresa. Requer CNPJ para verificação.".

## Estrutura de arquivos

**API (`apps/api`)**
- Create: `priv/repo/migrations/20260709000001_make_user_type_nullable.exs`
- Create: `lib/api/users/document.ex` (+ `test/api/users/document_test.exs`)
- Create: `lib/api/users/users.ex` — contexto `Api.Users` (+ `test/api/users_test.exs`)
- Create: `test/api/users/user_test.exs`
- Modify: `lib/api/users/user.ex` (split de changesets), `lib/api/router.ex` (+`POST /auth/register`, −`PATCH /auth/me`), `lib/api/controllers/auth_controller.ex` (+`register/1`, −`update_me/1`, dev user com CPF válido), `priv/repo/seeds.exs` (docs válidos, registro em 2 changesets), `test/support/factory.ex` (`type: "pf"`), `test/api/controllers/auth_controller_test.exs`

**Design system (`packages/design-system`)**
- Modify: `src/primitives/Input/Input.svelte` (+`inputmode`, `maxlength`, `name`), `src/primitives/Input/Input.test.ts`, `src/index.ts`
- Create: `src/composites/SelectionCard/{SelectionCard.svelte, SelectionCard.test.ts, SelectionCard.stories.ts, index.ts}`
- Create: `src/composites/SelectionCardGroup/{SelectionCardGroup.svelte, SelectionCardGroup.test.ts, SelectionCardGroup.stories.ts, index.ts}`

**Web (`apps/web`)**
- Create: `src/lib/domain/user/value-objects/Document.ts` (+ `Document.test.ts`)
- Create: `src/lib/presentation/components/RegisterScreen.svelte`
- Create: `src/routes/register/{+page.svelte, +page.server.ts, page.server.test.ts}`
- Modify: `src/lib/i18n/en.json`, `src/lib/i18n/pt.json`, `src/routes/login/+page.svelte`, `src/routes/login/+page.server.ts`, `src/routes/login/page.server.test.ts`, `src/hooks.server.ts`, `src/hooks.server.test.ts`, `apps/web/CLAUDE.md` (tabela de rotas)
- Delete: `src/lib/presentation/components/RegistrationForm.svelte`, `src/lib/presentation/components/RegistrationTypeSelector.svelte` (este segundo não tem nenhum import hoje)

---

### Task 1: Migration — `users.type` nullable e sem default

**Files:**
- Create: `apps/api/priv/repo/migrations/20260709000001_make_user_type_nullable.exs`

**Interfaces:**
- Produces: coluna `users.type` aceita `NULL`; usuários sem documento passam a ter `type = NULL` (sinal de "registro pendente" que o resto do plano consome).

- [ ] **Step 1: Escrever a migration**

```elixir
defmodule Api.Repo.Migrations.MakeUserTypeNullable do
  use Ecto.Migration

  def up do
    execute("ALTER TABLE users ALTER COLUMN type DROP NOT NULL")
    execute("ALTER TABLE users ALTER COLUMN type DROP DEFAULT")
    execute("UPDATE users SET type = NULL WHERE type = 'pf' AND cpf IS NULL")
  end

  def down do
    execute("UPDATE users SET type = 'pf' WHERE type IS NULL")
    execute("ALTER TABLE users ALTER COLUMN type SET DEFAULT 'pf'")
    execute("ALTER TABLE users ALTER COLUMN type SET NOT NULL")
  end
end
```

- [ ] **Step 2: Rodar a migration**

Run: `yarn api:migrate`
Expected: saída contendo `20260709000001 MakeUserTypeNullable: migrated`

- [ ] **Step 3: Rodar a suíte da API para garantir que nada quebrou**

Run: `yarn test:api`
Expected: todos os testes passam (a suíte recria o banco de teste e aplica migrations).

- [ ] **Step 4: Commit**

```bash
git add apps/api/priv/repo/migrations/20260709000001_make_user_type_nullable.exs
git commit -m "fix(db): make users.type nullable so unregistered users are detectable"
```

---

### Task 2: `Api.Users.Document` — validação de CPF/CNPJ com dígito verificador

**Files:**
- Create: `apps/api/lib/api/users/document.ex`
- Test: `apps/api/test/api/users/document_test.exs`

**Interfaces:**
- Produces: `Api.Users.Document.valid_cpf?(String.t()) :: boolean()` e `Api.Users.Document.valid_cnpj?(String.t()) :: boolean()`. Ambas recebem apenas dígitos (11 para CPF, 14 para CNPJ), rejeitam sequências de dígito repetido e conferem os dois dígitos verificadores.

- [ ] **Step 1: Escrever o teste que falha**

```elixir
defmodule Api.Users.DocumentTest do
  use ExUnit.Case, async: true

  alias Api.Users.Document

  describe "valid_cpf?/1" do
    test "accepts CPFs with correct verifier digits" do
      assert Document.valid_cpf?("52998224725")
      assert Document.valid_cpf?("11144477735")
      assert Document.valid_cpf?("12345678909")
    end

    test "rejects CPFs with wrong verifier digits" do
      refute Document.valid_cpf?("12345678900")
      refute Document.valid_cpf?("52998224726")
    end

    test "rejects repeated-digit sequences" do
      refute Document.valid_cpf?("11111111111")
      refute Document.valid_cpf?("00000000000")
    end

    test "rejects wrong length and non-digit input" do
      refute Document.valid_cpf?("5299822472")
      refute Document.valid_cpf?("529982247251")
      refute Document.valid_cpf?("529.982.247-25")
      refute Document.valid_cpf?("")
    end
  end

  describe "valid_cnpj?/1" do
    test "accepts CNPJs with correct verifier digits" do
      assert Document.valid_cnpj?("11222333000181")
      assert Document.valid_cnpj?("11444777000161")
      assert Document.valid_cnpj?("45399755000149")
    end

    test "rejects CNPJs with wrong verifier digits" do
      refute Document.valid_cnpj?("11222333000180")
    end

    test "rejects repeated-digit sequences" do
      refute Document.valid_cnpj?("11111111111111")
    end

    test "rejects wrong length and non-digit input" do
      refute Document.valid_cnpj?("1122233300018")
      refute Document.valid_cnpj?("11.222.333/0001-81")
      refute Document.valid_cnpj?("")
    end
  end
end
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:api`
Expected: FAIL com `module Api.Users.Document is not available`

- [ ] **Step 3: Implementar o módulo**

```elixir
defmodule Api.Users.Document do
  @moduledoc """
  Validation for Brazilian identity documents (CPF and CNPJ).

  Both functions expect digits only (no punctuation). They check length,
  reject repeated-digit sequences and verify both check digits.
  """

  @cnpj_weights_first [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  @cnpj_weights_second [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  @doc "Returns true when the string is a checksum-valid, 11-digit CPF."
  @spec valid_cpf?(String.t()) :: boolean()
  def valid_cpf?(value) when is_binary(value) do
    with {:ok, digits} <- parse_digits(value, 11) do
      not repeated?(digits) and cpf_verifiers_match?(digits)
    else
      _ -> false
    end
  end

  def valid_cpf?(_value), do: false

  @doc "Returns true when the string is a checksum-valid, 14-digit CNPJ."
  @spec valid_cnpj?(String.t()) :: boolean()
  def valid_cnpj?(value) when is_binary(value) do
    with {:ok, digits} <- parse_digits(value, 14) do
      not repeated?(digits) and cnpj_verifiers_match?(digits)
    else
      _ -> false
    end
  end

  def valid_cnpj?(_value), do: false

  defp parse_digits(value, expected_length) do
    case Regex.match?(~r/^\d{#{expected_length}}$/, value) do
      true -> {:ok, value |> String.graphemes() |> Enum.map(&String.to_integer/1)}
      false -> :error
    end
  end

  defp repeated?(digits) do
    digits |> Enum.uniq() |> length() == 1
  end

  defp cpf_verifiers_match?(digits) do
    {base, [first_dv, second_dv]} = Enum.split(digits, 9)
    first = cpf_digit(base, 10)
    second = cpf_digit(base ++ [first], 11)
    first == first_dv and second == second_dv
  end

  defp cpf_digit(digits, initial_weight) do
    digits
    |> Enum.with_index()
    |> Enum.reduce(0, fn {digit, index}, acc -> acc + digit * (initial_weight - index) end)
    |> verifier_from_sum()
  end

  defp cnpj_verifiers_match?(digits) do
    {base, [first_dv, second_dv]} = Enum.split(digits, 12)
    first = cnpj_digit(base, @cnpj_weights_first)
    second = cnpj_digit(base ++ [first], @cnpj_weights_second)
    first == first_dv and second == second_dv
  end

  defp cnpj_digit(digits, weights) do
    digits
    |> Enum.zip(weights)
    |> Enum.reduce(0, fn {digit, weight}, acc -> acc + digit * weight end)
    |> verifier_from_sum()
  end

  defp verifier_from_sum(sum) do
    case rem(sum, 11) do
      remainder when remainder < 2 -> 0
      remainder -> 11 - remainder
    end
  end
end
```

- [ ] **Step 4: Rodar e ver passar**

Run: `yarn test:api`
Expected: PASS (todos os testes de `DocumentTest` verdes).

- [ ] **Step 5: Credo**

Run: `yarn api:credo`
Expected: sem warnings novos.

- [ ] **Step 6: Commit**

```bash
git add apps/api/lib/api/users/document.ex apps/api/test/api/users/document_test.exs
git commit -m "feat(api): CPF/CNPJ checksum validation module"
```

---

### Task 3: `User` — split de changesets (`changeset` vs `registration_changeset`)

**Files:**
- Modify: `apps/api/lib/api/users/user.ex`
- Modify: `apps/api/test/support/factory.ex` (user_factory)
- Modify: `apps/api/priv/repo/seeds.exs` (linhas 23–41)
- Modify: `apps/api/lib/api/controllers/auth_controller.ex` (apenas `create_dev_user/0`)
- Test: `apps/api/test/api/users/user_test.exs` (novo)

**Interfaces:**
- Consumes: `Api.Users.Document.valid_cpf?/1`, `valid_cnpj?/1` (Task 2).
- Produces: `User.changeset(user, attrs)` — casta somente `[:email, :name, :avatar_url, :google_id, :is_seller]` (perfil Google; NÃO exige mais CPF). `User.registration_changeset(user, attrs)` — casta `[:type, :cpf, :cnpj]`, exige `type ∈ ["pf","pj"]`, exige e valida checksum do documento do tipo escolhido, zera o documento do outro tipo, `unique_constraint` em `:cpf`/`:cnpj`. Campo `:type` do schema perde o `default: "pf"`.

- [ ] **Step 1: Escrever os testes que falham**

`apps/api/test/api/users/user_test.exs`:

```elixir
defmodule Api.Users.UserTest do
  use Api.DataCase, async: true

  alias Api.Users.User

  @google_attrs %{
    "email" => "novo@example.com",
    "name" => "Novo Usuário",
    "avatar_url" => "https://example.com/a.png",
    "google_id" => "google-novo"
  }

  describe "changeset/2 (Google profile)" do
    test "is valid without type or document" do
      changeset = User.changeset(%User{}, @google_attrs)
      assert changeset.valid?
    end

    test "does not cast type, cpf or cnpj" do
      attrs = Map.merge(@google_attrs, %{"type" => "pf", "cpf" => "52998224725"})
      changeset = User.changeset(%User{}, attrs)
      refute Map.has_key?(changeset.changes, :type)
      refute Map.has_key?(changeset.changes, :cpf)
    end

    test "new user has nil type" do
      {:ok, user} = %User{} |> User.changeset(@google_attrs) |> Repo.insert()
      assert user.type == nil
    end
  end

  describe "registration_changeset/2" do
    setup do
      {:ok, user} = %User{} |> User.changeset(@google_attrs) |> Repo.insert()
      %{user: user}
    end

    test "registers a PF with a valid CPF", %{user: user} do
      {:ok, updated} =
        user
        |> User.registration_changeset(%{"type" => "pf", "cpf" => "52998224725"})
        |> Repo.update()

      assert updated.type == "pf"
      assert updated.cpf == "52998224725"
      assert updated.cnpj == nil
    end

    test "registers a PJ with a valid CNPJ", %{user: user} do
      {:ok, updated} =
        user
        |> User.registration_changeset(%{"type" => "pj", "cnpj" => "11222333000181"})
        |> Repo.update()

      assert updated.type == "pj"
      assert updated.cnpj == "11222333000181"
      assert updated.cpf == nil
    end

    test "rejects a CPF with bad checksum", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "pf", "cpf" => "12345678900"})
      refute changeset.valid?
      assert %{cpf: _} = errors_on(changeset)
    end

    test "rejects a CNPJ with bad checksum", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "pj", "cnpj" => "11222333000180"})
      refute changeset.valid?
      assert %{cnpj: _} = errors_on(changeset)
    end

    test "requires the document for the chosen type", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "pf"})
      refute changeset.valid?
      assert %{cpf: _} = errors_on(changeset)
    end

    test "rejects unknown type", %{user: user} do
      changeset = User.registration_changeset(user, %{"type" => "mei", "cpf" => "52998224725"})
      refute changeset.valid?
      assert %{type: _} = errors_on(changeset)
    end

    test "rejects duplicated CPF", %{user: user} do
      insert(:user, type: "pf", cpf: "11144477735")

      {:error, changeset} =
        user
        |> User.registration_changeset(%{"type" => "pf", "cpf" => "11144477735"})
        |> Repo.update()

      assert %{cpf: _} = errors_on(changeset)
    end
  end
end
```

Nota: se `Api.DataCase` não expuser `errors_on/1`, use o padrão dos outros testes do projeto (veja `test/api/children_test.exs`) ou adicione o helper clássico ao `data_case.ex`:

```elixir
def errors_on(changeset) do
  Ecto.Changeset.traverse_errors(changeset, fn {message, opts} ->
    Regex.replace(~r"%{(\w+)}", message, fn _, key ->
      opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
    end)
  end)
end
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:api`
Expected: FAIL — `registration_changeset/2 is undefined`, e o teste "does not cast type" falha porque o changeset atual ainda casta `type/cpf`.

- [ ] **Step 3: Reescrever `apps/api/lib/api/users/user.ex`**

Substituir o arquivo inteiro por:

```elixir
defmodule Api.Users.User do
  @moduledoc """
  User schema. `changeset/2` handles the Google profile fields;
  `registration_changeset/2` handles the one-time PF/PJ registration.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias Api.Children.Child
  alias Api.Items.Item
  alias Api.Notifications.Notification
  alias Api.Users.Document

  schema "users" do
    field :email, :string
    field :name, :string
    field :avatar_url, :string
    field :google_id, :string
    field :type, :string
    field :cpf, :string
    field :cnpj, :string
    field :is_seller, :boolean, default: false

    has_many :children, Child
    has_many :items, Item, foreign_key: :seller_id
    has_many :notifications, Notification

    timestamps(type: :utc_datetime)
  end

  @doc "Changeset for creating/updating the Google profile fields."
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :name, :avatar_url, :google_id, :is_seller])
    |> validate_required([:email, :name, :google_id])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
    |> unique_constraint(:google_id)
  end

  @doc "Changeset for the one-time PF/PJ registration (type + document)."
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:type, :cpf, :cnpj])
    |> validate_required([:type])
    |> validate_inclusion(:type, ["pf", "pj"])
    |> validate_document_for_type()
  end

  defp validate_document_for_type(changeset) do
    case get_field(changeset, :type) do
      "pf" -> validate_pf_document(changeset)
      "pj" -> validate_pj_document(changeset)
      _other -> changeset
    end
  end

  defp validate_pf_document(changeset) do
    changeset
    |> put_change(:cnpj, nil)
    |> validate_required([:cpf])
    |> validate_change(:cpf, &cpf_checksum/2)
    |> unique_constraint(:cpf)
  end

  defp validate_pj_document(changeset) do
    changeset
    |> put_change(:cpf, nil)
    |> validate_required([:cnpj])
    |> validate_change(:cnpj, &cnpj_checksum/2)
    |> unique_constraint(:cnpj)
  end

  defp cpf_checksum(:cpf, cpf) do
    case Document.valid_cpf?(cpf) do
      true -> []
      false -> [cpf: "is not a valid CPF"]
    end
  end

  defp cnpj_checksum(:cnpj, cnpj) do
    case Document.valid_cnpj?(cnpj) do
      true -> []
      false -> [cnpj: "is not a valid CNPJ"]
    end
  end
end
```

- [ ] **Step 4: Atualizar a factory** (`apps/api/test/support/factory.ex`)

O `user_factory` hoje depende do default `"pf"` do schema (que foi removido). Tornar o tipo explícito — trocar o `user_factory` por:

```elixir
def user_factory do
  %User{
    email: sequence(:email, &"user#{&1}@example.com"),
    name: sequence(:name, &"User #{&1}"),
    avatar_url: "https://example.com/avatar.png",
    google_id: sequence(:google_id, &"google_#{&1}"),
    type: "pf",
    cpf: sequence(:cpf, &String.pad_leading("#{&1}", 11, "0"))
  }
end
```

(ExMachina insere o struct direto, sem changeset, então o CPF sequencial não precisa de checksum válido.)

- [ ] **Step 5: Atualizar seeds** (`apps/api/priv/repo/seeds.exs`)

Trocar `users_data` (linhas 23–29) para documentos com checksum válido:

```elixir
users_data = [
  %{email: "ana@example.com", name: "Ana Silva", avatar_url: "", google_id: "google-ana", type: "pf", cpf: "52998224725", is_seller: false},
  %{email: "maria@example.com", name: "Maria Souza", avatar_url: "", google_id: "google-maria", type: "pf", cpf: "11144477735", is_seller: true},
  %{email: "juliana@example.com", name: "Juliana Costa", avatar_url: "", google_id: "google-juliana", type: "pj", cnpj: "11222333000181", is_seller: true},
  %{email: "carla@example.com", name: "Carla Santos", avatar_url: "", google_id: "google-carla", type: "pf", cpf: "76523910083", is_seller: true},
  %{email: "fernanda@example.com", name: "Fernanda Lima", avatar_url: "", google_id: "google-fernanda", type: "pj", cnpj: "45399755000149", is_seller: true},
]
```

E trocar o insert (linhas 31–41) para os dois changesets encadeados:

```elixir
users =
  Enum.map(users_data, fn attrs ->
    {:ok, base} =
      %Api.Users.User{}
      |> Api.Users.User.changeset(attrs)
      |> Repo.insert()

    {:ok, user} =
      base
      |> Api.Users.User.registration_changeset(attrs)
      |> Repo.update()

    IO.puts("  ✓ #{user.name} (#{user.email}) → id=#{user.id}")
    {attrs.email, user}
  end)
  |> Map.new()
```

- [ ] **Step 6: Atualizar `create_dev_user/0`** em `apps/api/lib/api/controllers/auth_controller.ex`

Substituir a função privada `create_dev_user/0` (o CPF antigo `99999999999` é inválido sob checksum):

```elixir
defp create_dev_user do
  base_attrs = %{
    email: @dev_user_email,
    name: "Dev User",
    avatar_url: "",
    google_id: "dev-login-local",
    is_seller: true
  }

  with {:ok, base} <- %User{} |> User.changeset(base_attrs) |> Repo.insert(),
       {:ok, user} <-
         base |> User.registration_changeset(%{type: "pf", cpf: "39053344705"}) |> Repo.update() do
    {:ok, user}
  end
end
```

- [ ] **Step 7: Rodar tudo e ver passar**

Run: `yarn test:api`
Expected: PASS. Se algum teste existente quebrar por assumir `type` default, corrigir o teste passando `type: "pf"` explícito na factory call.

Run: `yarn api:credo`
Expected: sem warnings.

- [ ] **Step 8: Rodar seeds no banco dev para validar**

Run: `yarn api:seed`
Expected: 5 usuários criados com `✓`.

- [ ] **Step 9: Commit**

```bash
git add apps/api/lib/api/users/user.ex apps/api/test/api/users/user_test.exs apps/api/test/support/factory.ex apps/api/priv/repo/seeds.exs apps/api/lib/api/controllers/auth_controller.ex apps/api/test/support/data_case.ex
git commit -m "feat(api): split user changesets and validate document checksums"
```

---

### Task 4: Contexto `Api.Users` com `register_account/2`

**Files:**
- Create: `apps/api/lib/api/users/users.ex`
- Test: `apps/api/test/api/users_test.exs`

**Interfaces:**
- Consumes: `User.registration_changeset/2` (Task 3).
- Produces:
  - `Api.Users.get_user(id) :: {:ok, %User{}} | {:error, :not_found}`
  - `Api.Users.register_account(%User{}, map()) :: {:ok, %User{}} | {:error, :already_registered} | {:error, %Ecto.Changeset{}}` — só registra usuário com `type == nil` (registro é única vez).

- [ ] **Step 1: Escrever os testes que falham**

`apps/api/test/api/users_test.exs`:

```elixir
defmodule Api.UsersTest do
  use Api.DataCase, async: true

  alias Api.Users
  alias Api.Users.User

  defp insert_unregistered_user do
    {:ok, user} =
      %User{}
      |> User.changeset(%{
        "email" => "pending@example.com",
        "name" => "Pending",
        "google_id" => "google-pending"
      })
      |> Repo.insert()

    user
  end

  describe "get_user/1" do
    test "returns the user when it exists" do
      user = insert(:user)
      assert {:ok, %User{}} = Users.get_user(user.id)
    end

    test "returns not_found otherwise" do
      assert {:error, :not_found} = Users.get_user(0)
    end
  end

  describe "register_account/2" do
    test "registers an unregistered user as PF" do
      user = insert_unregistered_user()

      assert {:ok, %User{type: "pf", cpf: "52998224725"}} =
               Users.register_account(user, %{"type" => "pf", "cpf" => "52998224725"})
    end

    test "registers an unregistered user as PJ" do
      user = insert_unregistered_user()

      assert {:ok, %User{type: "pj", cnpj: "11222333000181"}} =
               Users.register_account(user, %{"type" => "pj", "cnpj" => "11222333000181"})
    end

    test "refuses to register twice" do
      user = insert(:user, type: "pf", cpf: "11144477735")

      assert {:error, :already_registered} =
               Users.register_account(user, %{"type" => "pj", "cnpj" => "11222333000181"})
    end

    test "returns the changeset on invalid input" do
      user = insert_unregistered_user()

      assert {:error, %Ecto.Changeset{}} =
               Users.register_account(user, %{"type" => "pf", "cpf" => "12345678900"})
    end
  end
end
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:api`
Expected: FAIL com `module Api.Users is not available`.

- [ ] **Step 3: Implementar o contexto**

`apps/api/lib/api/users/users.ex`:

```elixir
defmodule Api.Users do
  @moduledoc """
  Context for user accounts: lookup and one-time PF/PJ registration.
  """

  alias Api.Repo
  alias Api.Users.User

  @doc "Fetches a user by id."
  @spec get_user(term()) :: {:ok, User.t()} | {:error, :not_found}
  def get_user(id) do
    case Repo.get(User, id) do
      %User{} = user -> {:ok, user}
      nil -> {:error, :not_found}
    end
  end

  @doc """
  Completes the one-time PF/PJ registration for a user.

  Returns `{:error, :already_registered}` when the user already has a type.
  """
  @spec register_account(User.t(), map()) ::
          {:ok, User.t()} | {:error, :already_registered} | {:error, Ecto.Changeset.t()}
  def register_account(%User{type: nil} = user, attrs) do
    user
    |> User.registration_changeset(attrs)
    |> Repo.update()
  end

  def register_account(%User{}, _attrs), do: {:error, :already_registered}
end
```

Nota: `User.t()` precisa existir — se o schema não tiver `@type t`, adicionar em `user.ex` dentro do módulo: `@type t :: %__MODULE__{}`.

- [ ] **Step 4: Rodar e ver passar**

Run: `yarn test:api` → PASS. `yarn api:credo` → sem warnings.

- [ ] **Step 5: Commit**

```bash
git add apps/api/lib/api/users/users.ex apps/api/test/api/users_test.exs apps/api/lib/api/users/user.ex
git commit -m "feat(api): Api.Users context with one-time account registration"
```

---

### Task 5: Endpoint `POST /auth/register` (e remoção do `PATCH /auth/me`)

**Files:**
- Modify: `apps/api/lib/api/router.ex` (trocar o bloco `patch "/auth/me"` por `post "/auth/register"`)
- Modify: `apps/api/lib/api/controllers/auth_controller.ex` (adicionar `register/1`, remover `update_me/1` e o helper `update_user/2`)
- Modify: `apps/api/test/api/controllers/auth_controller_test.exs` (novo describe)

**Interfaces:**
- Consumes: `Api.Users.register_account/2`, `Api.Users.get_user/1` (Task 4).
- Produces: contrato HTTP consumido pela Task 11:
  - `POST /auth/register`, header `Authorization: Bearer <access token>`, body `{"type":"pf","cpf":"52998224725"}` ou `{"type":"pj","cnpj":"11222333000181"}`
  - `200` → `{"user": {id, email, name, avatar_url, type, cpf, cnpj, is_seller}}`
  - `401` `{"error":"invalid_token"}` · `404` `{"error":"user_not_found"}` · `409` `{"error":"already_registered"}` · `422` `{"error":"validation_failed","details":{campo:[msg]}}`

- [ ] **Step 1: Escrever os testes que falham** (adicionar ao `auth_controller_test.exs`)

```elixir
describe "POST /auth/register" do
  defp insert_unregistered_user do
    {:ok, user} =
      %Api.Users.User{}
      |> Api.Users.User.changeset(%{
        "email" => "pending@example.com",
        "name" => "Pending",
        "google_id" => "google-pending"
      })
      |> Api.Repo.insert()

    user
  end

  defp register_conn(token, body) do
    conn(:post, "/auth/register", body)
    |> put_req_header("content-type", "application/json")
    |> put_req_header("authorization", "Bearer #{token}")
    |> Api.Router.call([])
  end

  test "registers a PF user and returns the updated user" do
    user = insert_unregistered_user()
    token = Api.Auth.generate_access_token(user)

    conn = register_conn(token, %{"type" => "pf", "cpf" => "52998224725"})

    assert conn.status == 200
    body = Jason.decode!(conn.resp_body)
    assert body["user"]["type"] == "pf"
    assert body["user"]["cpf"] == "52998224725"
  end

  test "returns 409 when the user is already registered" do
    user = insert(:user, type: "pf", cpf: "11144477735")
    token = Api.Auth.generate_access_token(user)

    conn = register_conn(token, %{"type" => "pj", "cnpj" => "11222333000181"})

    assert conn.status == 409
    assert Jason.decode!(conn.resp_body)["error"] == "already_registered"
  end

  test "returns 422 for an invalid document" do
    user = insert_unregistered_user()
    token = Api.Auth.generate_access_token(user)

    conn = register_conn(token, %{"type" => "pf", "cpf" => "12345678900"})

    assert conn.status == 422
    body = Jason.decode!(conn.resp_body)
    assert body["error"] == "validation_failed"
    assert Map.has_key?(body["details"], "cpf")
  end

  test "returns 401 without a valid token" do
    conn =
      conn(:post, "/auth/register", %{"type" => "pf", "cpf" => "52998224725"})
      |> put_req_header("content-type", "application/json")
      |> Api.Router.call([])

    assert conn.status == 401
  end
end
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:api`
Expected: FAIL — a rota não existe (404) / `register/1` indefinida.

- [ ] **Step 3: Router** — em `apps/api/lib/api/router.ex`, substituir:

```elixir
  patch "/auth/me" do
    Api.Controllers.AuthController.update_me(conn)
  end
```

por:

```elixir
  post "/auth/register" do
    Api.Controllers.AuthController.register(conn)
  end
```

- [ ] **Step 4: Controller** — em `auth_controller.ex`:

1. Adicionar `alias Api.Users` no topo (junto dos outros aliases).
2. Remover `update_me/1` e o helper privado `update_user/2` (o `user_json/1`, `authenticate/1` e `get_user/1` privado continuam; trocar o corpo do `get_user/1` privado por delegação ao contexto: `defp get_user(id), do: Users.get_user(id)`).
3. Adicionar:

```elixir
@doc """
POST /auth/register
Completes the one-time PF/PJ registration for the authenticated user.
"""
def register(conn) do
  with {:ok, claims} <- authenticate(conn),
       {:ok, user} <- get_user(claims["sub"]),
       {:ok, registered} <- Users.register_account(user, conn.body_params) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{user: user_json(registered)}))
  else
    {:error, :unauthorized} -> register_error(conn, 401, %{error: "invalid_token"})
    {:error, :not_found} -> register_error(conn, 404, %{error: "user_not_found"})
    {:error, :already_registered} -> register_error(conn, 409, %{error: "already_registered"})
    {:error, %Ecto.Changeset{} = changeset} ->
      register_error(conn, 422, %{error: "validation_failed", details: changeset_errors(changeset)})
    {:error, _} -> register_error(conn, 401, %{error: "invalid_token"})
  end
end

defp register_error(conn, status, payload) do
  conn
  |> put_resp_content_type("application/json")
  |> send_resp(status, Jason.encode!(payload))
end

defp changeset_errors(changeset) do
  Ecto.Changeset.traverse_errors(changeset, fn {message, _opts} -> message end)
end
```

(Atenção: o antigo `update_me` serializava `changeset.errors` direto no Jason — tuplas não são serializáveis; `traverse_errors` resolve.)

- [ ] **Step 5: Rodar e ver passar**

Run: `yarn test:api` → PASS. `yarn api:credo` → limpo.

- [ ] **Step 6: Conferir que nada mais chama PATCH /auth/me**

Run: `grep -rn "auth/me" apps/ --include="*.ts" --include="*.svelte" --include="*.ex" --include="*.exs" | grep -v node_modules`
Expected: única ocorrência em `apps/web/src/routes/login/+page.server.ts` (será removida na Task 12). Se aparecer outra, atualizá-la para o novo endpoint.

- [ ] **Step 7: Commit**

```bash
git add apps/api/lib/api/router.ex apps/api/lib/api/controllers/auth_controller.ex apps/api/test/api/controllers/auth_controller_test.exs
git commit -m "feat(api): POST /auth/register endpoint replacing PATCH /auth/me"
```

---

### Task 6: DS — estender primitive `Input` (`inputmode`, `maxlength`, `name`)

**Files:**
- Modify: `packages/design-system/src/primitives/Input/Input.svelte`
- Test: `packages/design-system/src/primitives/Input/Input.test.ts` (adicionar casos)

**Interfaces:**
- Produces: `Input` aceita as props opcionais `inputmode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel'`, `maxlength?: number`, `name?: string`, repassadas ao `<input>` interno. API existente intocada.

- [ ] **Step 1: Testes que falham** (adicionar ao `Input.test.ts` existente)

```ts
it('applies inputmode, maxlength and name to the native input', () => {
  const { container } = render(Input, {
    props: { id: 'doc', inputmode: 'numeric', maxlength: 14, name: 'document' },
  });
  const input = container.querySelector('input');
  expect(input).toHaveAttribute('inputmode', 'numeric');
  expect(input).toHaveAttribute('maxlength', '14');
  expect(input).toHaveAttribute('name', 'document');
});

it('omits inputmode, maxlength and name when not provided', () => {
  const { container } = render(Input, { props: { id: 'plain' } });
  const input = container.querySelector('input');
  expect(input).not.toHaveAttribute('inputmode');
  expect(input).not.toHaveAttribute('maxlength');
  expect(input).not.toHaveAttribute('name');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:ds`
Expected: FAIL nos dois casos novos.

- [ ] **Step 3: Implementar** em `Input.svelte`

Na tipagem/destructuring de `$props()` adicionar:

```ts
    inputmode,
    maxlength,
    name,
```

e nos tipos:

```ts
    inputmode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel'
    maxlength?: number
    name?: string
```

No `<input>` (linha ~53) adicionar os atributos:

```svelte
    <input
      {id}
      {name}
      type={inputType}
      {placeholder}
      bind:value
      {disabled}
      {oninput}
      {inputmode}
      {maxlength}
      class="input-el"
    />
```

(Svelte omite atributos `undefined` automaticamente.)

- [ ] **Step 4: Rodar e ver passar**

Run: `yarn test:ds` → PASS. Run: `yarn check:ds` → sem erros.

- [ ] **Step 5: Commit**

```bash
git add packages/design-system/src/primitives/Input/Input.svelte packages/design-system/src/primitives/Input/Input.test.ts
git commit -m "feat(ds): Input accepts inputmode, maxlength and name"
```

---

### Task 7: DS — composite `SelectionCard`

**Files:**
- Create: `packages/design-system/src/composites/SelectionCard/SelectionCard.svelte`
- Create: `packages/design-system/src/composites/SelectionCard/index.ts`
- Create: `packages/design-system/src/composites/SelectionCard/SelectionCard.stories.ts`
- Test: `packages/design-system/src/composites/SelectionCard/SelectionCard.test.ts`
- Modify: `packages/design-system/src/index.ts`

**Interfaces:**
- Produces (consumido pela Task 8):

```ts
// SelectionCard props
{
  title: string
  description?: string
  selected?: boolean
  iconTone?: 'brand' | 'neutral'   // brand = fundo rosa claro, neutral = cinza
  icon?: Snippet                    // SVG/ícone injetado pelo consumidor
  tabindex?: number                 // roving tabindex, controlado pelo grupo
  onclick?: () => void
  onkeydown?: (event: KeyboardEvent) => void
}
```

Renderiza `<button type="button" role="radio" aria-checked={selected}>` com classes BEM `selectioncard`, `selectioncard--selected`, `selectioncard__icon--brand|--neutral`, `selectioncard__title`, `selectioncard__description`, `selectioncard__check`.

- [ ] **Step 1: Testes que falham**

`SelectionCard.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SelectionCard from './SelectionCard.svelte';

describe('SelectionCard', () => {
  it('renders title and description', () => {
    render(SelectionCard, {
      props: { title: 'Pessoa Física', description: 'Requer CPF.' },
    });
    expect(screen.getByText('Pessoa Física')).toBeInTheDocument();
    expect(screen.getByText('Requer CPF.')).toBeInTheDocument();
  });

  it('is a radio button reflecting the selected state', () => {
    render(SelectionCard, { props: { title: 'PF', selected: true } });
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });

  it('shows the checkmark only when selected', () => {
    const { container, rerender } = render(SelectionCard, {
      props: { title: 'PF', selected: false },
    });
    expect(container.querySelector('.selectioncard__check')).not.toBeInTheDocument();
    rerender({ title: 'PF', selected: true });
    expect(container.querySelector('.selectioncard__check')).toBeInTheDocument();
  });

  it('applies the icon tone modifier', () => {
    const { container } = render(SelectionCard, {
      props: { title: 'PF', iconTone: 'brand' },
    });
    expect(container.querySelector('.selectioncard__icon--brand')).toBeInTheDocument();
  });

  it('calls onclick when clicked', async () => {
    const onclick = vi.fn();
    render(SelectionCard, { props: { title: 'PF', onclick } });
    await fireEvent.click(screen.getByRole('radio'));
    expect(onclick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:ds` → FAIL (arquivo não existe).

- [ ] **Step 3: Implementar `SelectionCard.svelte`**

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    description,
    selected = false,
    iconTone = 'neutral',
    icon,
    tabindex = 0,
    onclick,
    onkeydown,
  }: {
    title: string
    description?: string
    selected?: boolean
    iconTone?: 'brand' | 'neutral'
    icon?: Snippet
    tabindex?: number
    onclick?: () => void
    onkeydown?: (event: KeyboardEvent) => void
  } = $props()
</script>

<button
  type="button"
  class="selectioncard"
  class:selectioncard--selected={selected}
  role="radio"
  aria-checked={selected}
  {tabindex}
  {onclick}
  {onkeydown}
>
  {#if icon}
    <span class="selectioncard__icon selectioncard__icon--{iconTone}" aria-hidden="true">
      {@render icon()}
    </span>
  {/if}

  <span class="selectioncard__text">
    <span class="selectioncard__title">{title}</span>
    {#if description}
      <span class="selectioncard__description">{description}</span>
    {/if}
  </span>

  {#if selected}
    <span class="selectioncard__check" aria-hidden="true">
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  {/if}
</button>

<style>
  .selectioncard {
    display: flex;
    align-items: flex-start;
    gap: 0.7rem;
    width: 100%;
    padding: 0.8rem;
    background: var(--wh);
    border: 0.075rem solid var(--of2);
    border-radius: 0.7rem;
    cursor: pointer;
    font-family: var(--font-lato);
    text-align: left;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .selectioncard:hover {
    border-color: var(--pk);
  }

  .selectioncard:focus-visible {
    outline: none;
    box-shadow: 0 0 0 0.2rem var(--pk);
  }

  .selectioncard--selected {
    border: 0.1rem solid var(--pk);
    box-shadow: 0 0.1rem 0.6rem rgba(255, 60, 172, 0.12);
  }

  .selectioncard__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    flex-shrink: 0;
  }

  .selectioncard__icon--brand {
    background: var(--color-pk-soft);
    color: var(--pk);
  }

  .selectioncard__icon--neutral {
    background: #F3F4F6;
    color: #6B7280;
  }

  .selectioncard__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  .selectioncard__title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--bk);
  }

  .selectioncard__description {
    font-size: 0.75rem;
    color: #6B7280;
    line-height: 1.5;
  }

  .selectioncard__check {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 50%;
    background: var(--pk);
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
</style>
```

- [ ] **Step 4: `index.ts` do componente**

```ts
export { default as SelectionCard } from './SelectionCard.svelte';
```

(Conferir o padrão nos outros composites — ex.: `composites/Card/index.ts` — e replicar exatamente.)

- [ ] **Step 5: Export no barrel** — em `packages/design-system/src/index.ts`, seção Composites, ordem alfabética:

```ts
export { SelectionCard } from './composites/SelectionCard/index.js';
```

- [ ] **Step 6: Story**

`SelectionCard.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/svelte'
import SelectionCard from './SelectionCard.svelte'

const meta = {
  title: 'Composites/SelectionCard',
  component: SelectionCard,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
    iconTone: { control: 'select', options: ['brand', 'neutral'] },
  },
  render: (args: Record<string, unknown>) => ({
    Component: SelectionCard,
    props: args,
  }),
} satisfies Meta<SelectionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Selected: Story = {
  args: {
    title: 'Pessoa Física',
    description: 'Venda roupas dos seus filhos. Requer CPF para verificação.',
    selected: true,
    iconTone: 'brand',
  },
}

export const Unselected: Story = {
  args: {
    title: 'Pessoa Jurídica',
    description: 'Loja ou empresa. Requer CNPJ para verificação.',
    selected: false,
    iconTone: 'neutral',
  },
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `yarn test:ds` → PASS. `yarn check:ds` e `yarn stylelint:ds` → limpos.

- [ ] **Step 8: Commit**

```bash
git add packages/design-system/src/composites/SelectionCard packages/design-system/src/index.ts
git commit -m "feat(ds): SelectionCard composite"
```

---

### Task 8: DS — composite `SelectionCardGroup` (radiogroup + teclado)

**Files:**
- Create: `packages/design-system/src/composites/SelectionCardGroup/SelectionCardGroup.svelte`
- Create: `packages/design-system/src/composites/SelectionCardGroup/index.ts`
- Create: `packages/design-system/src/composites/SelectionCardGroup/SelectionCardGroup.stories.ts`
- Test: `packages/design-system/src/composites/SelectionCardGroup/SelectionCardGroup.test.ts`
- Modify: `packages/design-system/src/index.ts`

**Interfaces:**
- Consumes: `SelectionCard` (Task 7).
- Produces (consumido pela Task 10):

```ts
export type SelectionOption = {
  value: string
  label: string
  description?: string
  iconTone?: 'brand' | 'neutral'
}

// SelectionCardGroup props
{
  options: SelectionOption[]
  value?: string                     // $bindable — value da opção selecionada
  ariaLabel: string
  icon?: Snippet<[string]>           // recebe option.value, renderiza o ícone
  onchange?: (value: string) => void
}
```

Semântica: container `role="radiogroup"` com `aria-label`; cards empilhados em coluna (gap `0.6rem`); setas ↑/↓/←/→ movem a seleção (com wrap), Home/End vão para a primeira/última; roving tabindex (selecionado — ou primeiro, se nada selecionado — tem `tabindex=0`, demais `-1`).

- [ ] **Step 1: Testes que falham**

`SelectionCardGroup.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import SelectionCardGroup from './SelectionCardGroup.svelte';

const options = [
  { value: 'pf', label: 'Pessoa Física', description: 'Requer CPF.' },
  { value: 'pj', label: 'Pessoa Jurídica', description: 'Requer CNPJ.' },
];

describe('SelectionCardGroup', () => {
  it('renders a labelled radiogroup with one radio per option', () => {
    render(SelectionCardGroup, { props: { options, ariaLabel: 'Escolha o seu perfil' } });
    expect(screen.getByRole('radiogroup', { name: 'Escolha o seu perfil' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('marks the option matching value as checked', () => {
    render(SelectionCardGroup, { props: { options, value: 'pj', ariaLabel: 'Perfil' } });
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
  });

  it('selects on click and notifies onchange', async () => {
    const onchange = vi.fn();
    render(SelectionCardGroup, { props: { options, ariaLabel: 'Perfil', onchange } });
    await fireEvent.click(screen.getByRole('radio', { name: /Pessoa Jurídica/ }));
    expect(onchange).toHaveBeenCalledWith('pj');
  });

  it('moves selection with arrow keys, wrapping around', async () => {
    const onchange = vi.fn();
    render(SelectionCardGroup, { props: { options, value: 'pj', ariaLabel: 'Perfil', onchange } });
    const radios = screen.getAllByRole('radio');
    await fireEvent.keyDown(radios[1], { key: 'ArrowDown' });
    expect(onchange).toHaveBeenCalledWith('pf');
  });

  it('applies roving tabindex', () => {
    render(SelectionCardGroup, { props: { options, value: 'pj', ariaLabel: 'Perfil' } });
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
    expect(radios[1]).toHaveAttribute('tabindex', '0');
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:ds` → FAIL (arquivo não existe).

- [ ] **Step 3: Implementar `SelectionCardGroup.svelte`**

```svelte
<script lang="ts" module>
  export type SelectionOption = {
    value: string
    label: string
    description?: string
    iconTone?: 'brand' | 'neutral'
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import SelectionCard from '../SelectionCard/SelectionCard.svelte'

  let {
    options,
    value = $bindable(undefined),
    ariaLabel,
    icon,
    onchange,
  }: {
    options: SelectionOption[]
    value?: string
    ariaLabel: string
    icon?: Snippet<[string]>
    onchange?: (value: string) => void
  } = $props()

  const selectedIndex = $derived(options.findIndex((option) => option.value === value))

  function select(optionValue: string) {
    value = optionValue
    onchange?.(optionValue)
  }

  function tabindexFor(index: number): number {
    if (selectedIndex === -1) return index === 0 ? 0 : -1
    return index === selectedIndex ? 0 : -1
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const target = targetIndex(event.key, index)
    if (target === null) return
    event.preventDefault()
    select(options[target].value)
  }

  function targetIndex(key: string, index: number): number | null {
    if (key === 'ArrowDown' || key === 'ArrowRight') return (index + 1) % options.length
    if (key === 'ArrowUp' || key === 'ArrowLeft') return (index - 1 + options.length) % options.length
    if (key === 'Home') return 0
    if (key === 'End') return options.length - 1
    return null
  }
</script>

<div class="selectioncardgroup" role="radiogroup" aria-label={ariaLabel}>
  {#each options as option, index (option.value)}
    {#snippet optionIcon()}
      {#if icon}
        {@render icon(option.value)}
      {/if}
    {/snippet}
    <SelectionCard
      title={option.label}
      description={option.description}
      selected={option.value === value}
      iconTone={option.iconTone}
      tabindex={tabindexFor(index)}
      onclick={() => select(option.value)}
      onkeydown={(event: KeyboardEvent) => handleKeydown(event, index)}
      icon={icon ? optionIcon : undefined}
    />
  {/each}
</div>

<style>
  .selectioncardgroup {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
  }
</style>
```

**Notas (Svelte 5):**
- O snippet `optionIcon` é declarado *dentro* do `{#each}` de propósito: ele captura `option.value` do escopo e é passado como prop `icon` (tipo `Snippet`) do `SelectionCard`. Snippets parametrizados não podem ser "curried" — esta é a forma correta.
- O tipo `SelectionOption` fica no bloco `<script lang="ts" module>` para poder ser exportado do componente. Se o `svelte-check` reclamar, mover o tipo para `packages/design-system/src/composites/SelectionCardGroup/types.ts` e reexportar no `index.ts`.

- [ ] **Step 4: `index.ts` do componente**

```ts
export { default as SelectionCardGroup } from './SelectionCardGroup.svelte';
export type { SelectionOption } from './SelectionCardGroup.svelte';
```

- [ ] **Step 5: Export no barrel** — em `packages/design-system/src/index.ts`:

```ts
export { SelectionCardGroup } from './composites/SelectionCardGroup/index.js';
export type { SelectionOption } from './composites/SelectionCardGroup/index.js';
```

- [ ] **Step 6: Story**

```ts
import type { Meta, StoryObj } from '@storybook/svelte'
import SelectionCardGroup from './SelectionCardGroup.svelte'

const meta = {
  title: 'Composites/SelectionCardGroup',
  component: SelectionCardGroup,
  tags: ['autodocs'],
  render: (args: Record<string, unknown>) => ({
    Component: SelectionCardGroup,
    props: args,
  }),
} satisfies Meta<SelectionCardGroup>

export default meta
type Story = StoryObj<typeof meta>

export const ProfileChoice: Story = {
  args: {
    ariaLabel: 'Escolha o seu perfil',
    value: 'pf',
    options: [
      {
        value: 'pf',
        label: 'Pessoa Física',
        description: 'Venda roupas dos seus filhos. Requer CPF para verificação.',
        iconTone: 'brand',
      },
      {
        value: 'pj',
        label: 'Pessoa Jurídica',
        description: 'Loja ou empresa. Requer CNPJ para verificação.',
        iconTone: 'neutral',
      },
    ],
  },
}
```

- [ ] **Step 7: Rodar e ver passar**

Run: `yarn test:ds` → PASS. `yarn check:ds`, `yarn lint:ds`, `yarn stylelint:ds` → limpos.

- [ ] **Step 8: Commit**

```bash
git add packages/design-system/src/composites/SelectionCardGroup packages/design-system/src/index.ts
git commit -m "feat(ds): SelectionCardGroup composite with radiogroup semantics"
```

---

### Task 9: Web — value object `Document` (máscara + checksum em TS)

**Files:**
- Create: `apps/web/src/lib/domain/user/value-objects/Document.ts`
- Test: `apps/web/src/lib/domain/user/value-objects/Document.test.ts`

**Interfaces:**
- Produces (consumido pela Task 10):

```ts
export function stripDocument(value: string): string          // remove tudo que não é dígito
export function formatCpf(value: string): string              // "52998224725" → "529.982.247-25" (aceita parcial)
export function formatCnpj(value: string): string             // "11222333000181" → "11.222.333/0001-81" (aceita parcial)
export function isValidCpf(digits: string): boolean           // checksum, 11 dígitos, rejeita repetidos
export function isValidCnpj(digits: string): boolean          // checksum, 14 dígitos, rejeita repetidos
```

- [ ] **Step 1: Testes que falham**

`Document.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  stripDocument,
  formatCpf,
  formatCnpj,
  isValidCpf,
  isValidCnpj,
} from './Document';

describe('stripDocument', () => {
  it('keeps only digits', () => {
    expect(stripDocument('529.982.247-25')).toBe('52998224725');
    expect(stripDocument('abc')).toBe('');
  });
});

describe('formatCpf', () => {
  it('formats a full CPF', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
  });

  it('formats partial input progressively', () => {
    expect(formatCpf('529')).toBe('529');
    expect(formatCpf('5299')).toBe('529.9');
    expect(formatCpf('5299822479')).toBe('529.982.247-9');
  });

  it('caps at 11 digits', () => {
    expect(formatCpf('529982247251234')).toBe('529.982.247-25');
  });
});

describe('formatCnpj', () => {
  it('formats a full CNPJ', () => {
    expect(formatCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('formats partial input progressively', () => {
    expect(formatCnpj('112223')).toBe('11.222.3');
  });

  it('caps at 14 digits', () => {
    expect(formatCnpj('112223330001819')).toBe('11.222.333/0001-81');
  });
});

describe('isValidCpf', () => {
  it('accepts checksum-valid CPFs', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('11144477735')).toBe(true);
  });

  it('rejects bad checksum, repeats and wrong length', () => {
    expect(isValidCpf('12345678900')).toBe(false);
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('5299822472')).toBe(false);
  });
});

describe('isValidCnpj', () => {
  it('accepts checksum-valid CNPJs', () => {
    expect(isValidCnpj('11222333000181')).toBe(true);
    expect(isValidCnpj('11444777000161')).toBe(true);
  });

  it('rejects bad checksum, repeats and wrong length', () => {
    expect(isValidCnpj('11222333000180')).toBe(false);
    expect(isValidCnpj('11111111111111')).toBe(false);
    expect(isValidCnpj('1122233300018')).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:web` → FAIL (módulo não existe).

- [ ] **Step 3: Implementar `Document.ts`**

```ts
const CPF_LENGTH = 11;
const CNPJ_LENGTH = 14;

export function stripDocument(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCpf(value: string): string {
  const digits = stripDocument(value).slice(0, CPF_LENGTH);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export function formatCnpj(value: string): string {
  const digits = stripDocument(value).slice(0, CNPJ_LENGTH);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || allSameDigit(digits)) return false;
  const numbers = digits.split('').map(Number);
  const first = cpfDigit(numbers.slice(0, 9), 10);
  const second = cpfDigit([...numbers.slice(0, 9), first], 11);
  return first === numbers[9] && second === numbers[10];
}

export function isValidCnpj(digits: string): boolean {
  if (!/^\d{14}$/.test(digits) || allSameDigit(digits)) return false;
  const numbers = digits.split('').map(Number);
  const first = cnpjDigit(numbers.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = cnpjDigit([...numbers.slice(0, 12), first], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return first === numbers[12] && second === numbers[13];
}

function allSameDigit(digits: string): boolean {
  return digits.split('').every((digit) => digit === digits[0]);
}

function cpfDigit(numbers: number[], initialWeight: number): number {
  const sum = numbers.reduce((acc, digit, index) => acc + digit * (initialWeight - index), 0);
  return verifierFromSum(sum);
}

function cnpjDigit(numbers: number[], weights: number[]): number {
  const sum = numbers.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  return verifierFromSum(sum);
}

function verifierFromSum(sum: number): number {
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `yarn test:web` → PASS. `yarn check:web` → limpo.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/domain/user/value-objects/Document.ts apps/web/src/lib/domain/user/value-objects/Document.test.ts
git commit -m "feat(web): CPF/CNPJ document value object with mask and checksum"
```

---

### Task 10: Web — i18n + componente `RegisterScreen`

**Files:**
- Modify: `apps/web/src/lib/i18n/en.json`, `apps/web/src/lib/i18n/pt.json`
- Create: `apps/web/src/lib/presentation/components/RegisterScreen.svelte`

**Interfaces:**
- Consumes: `SelectionCardGroup`, `Input`, `Button`, `IconButton` de `@babyclothes/design-system`; `formatCpf`, `formatCnpj`, `stripDocument`, `isValidCpf`, `isValidCnpj` (Task 9); `lucide-svelte` (`User`, `Store`, `ArrowRight`).
- Produces: componente de página:

```ts
// RegisterScreen props
{
  onSubmit: (data: { type: 'pf' | 'pj'; document: string }) => void  // document = só dígitos
  onBack: () => void
  loading?: boolean
  error?: string           // chave já traduzida (texto pronto), exibida abaixo do botão
}
```

Comportamento (fiel ao mock tpl41, tela única progressiva): header (voltar + "Criar conta") → lead → título → `SelectionCardGroup` (PF/PJ) → quando um tipo está selecionado, aparecem o campo de documento (label/placeholder/máscara conforme o tipo, valor limpo ao trocar de tipo) e o botão "Continuar" (desabilitado até o documento passar no checksum local).

- [ ] **Step 1: Adicionar chaves i18n**

Em `pt.json`, dentro de `auth.registration`, adicionar (manter as existentes):

```json
"create_account": "Criar conta",
"back": "Voltar",
"error_invalid_document": "Documento inválido. Confira os dígitos.",
"error_document_taken": "Este documento já está cadastrado.",
"error_generic": "Não foi possível concluir o cadastro. Tente novamente."
```

Em `en.json`:

```json
"create_account": "Create account",
"back": "Back",
"error_invalid_document": "Invalid document. Check the digits.",
"error_document_taken": "This document is already registered.",
"error_generic": "Could not complete the registration. Try again."
```

- [ ] **Step 2: Implementar `RegisterScreen.svelte`**

```svelte
<script lang="ts">
  import { Button, IconButton, Input, SelectionCardGroup } from '@babyclothes/design-system'
  import { ArrowRight, Store, User } from 'lucide-svelte'
  import { t } from '$lib/i18n'
  import {
    formatCpf,
    formatCnpj,
    isValidCpf,
    isValidCnpj,
    stripDocument,
  } from '$lib/domain/user/value-objects/Document'

  let {
    onSubmit,
    onBack,
    loading = false,
    error,
  }: {
    onSubmit: (data: { type: 'pf' | 'pj'; document: string }) => void
    onBack: () => void
    loading?: boolean
    error?: string
  } = $props()

  let selectedType = $state<string | undefined>(undefined)
  let documentValue = $state('')

  const options = $derived([
    {
      value: 'pf',
      label: $t('auth.registration.pf'),
      description: $t('auth.registration.pf_description'),
      iconTone: 'brand' as const,
    },
    {
      value: 'pj',
      label: $t('auth.registration.pj'),
      description: $t('auth.registration.pj_description'),
      iconTone: 'neutral' as const,
    },
  ])

  const isPf = $derived(selectedType === 'pf')

  const documentDigits = $derived(stripDocument(documentValue))

  const isDocumentValid = $derived.by(() => {
    if (selectedType === 'pf') return isValidCpf(documentDigits)
    if (selectedType === 'pj') return isValidCnpj(documentDigits)
    return false
  })

  function handleTypeChange() {
    documentValue = ''
  }

  function handleDocumentInput() {
    documentValue = isPf ? formatCpf(documentValue) : formatCnpj(documentValue)
  }

  function handleSubmit() {
    if (!selectedType || !isDocumentValid) return
    onSubmit({ type: selectedType as 'pf' | 'pj', document: documentDigits })
  }
</script>

<div class="registerscreen">
  <header class="registerscreen__header">
    <IconButton icon="back" variant="glass" size={32} ariaLabel={$t('auth.registration.back')} onclick={onBack} />
    <h1 class="registerscreen__heading">{$t('auth.registration.create_account')}</h1>
  </header>

  <p class="registerscreen__lead">{$t('auth.registration.subtitle_top')}</p>
  <h2 class="registerscreen__title">{$t('auth.registration.title')}</h2>

  <SelectionCardGroup
    {options}
    bind:value={selectedType}
    ariaLabel={$t('auth.registration.title')}
    onchange={handleTypeChange}
  >
    {#snippet icon(optionValue: string)}
      {#if optionValue === 'pf'}
        <User size={20} aria-hidden="true" />
      {:else}
        <Store size={20} aria-hidden="true" />
      {/if}
    {/snippet}
  </SelectionCardGroup>

  {#if selectedType}
    <div class="registerscreen__document">
      <Input
        id="register-document"
        name="document"
        label={isPf ? $t('auth.registration.cpf_label') : $t('auth.registration.cnpj_label')}
        placeholder={isPf ? $t('auth.registration.cpf_placeholder') : $t('auth.registration.cnpj_placeholder')}
        inputmode="numeric"
        maxlength={isPf ? 14 : 18}
        bind:value={documentValue}
        oninput={handleDocumentInput}
        disabled={loading}
      />
    </div>

    <Button
      variant="pk"
      size="lg"
      loading={loading}
      disabled={!isDocumentValid}
      onclick={handleSubmit}
    >
      {$t('auth.registration.submit')}
      <ArrowRight size={14} aria-hidden="true" />
    </Button>

    {#if error}
      <p class="registerscreen__error" role="alert">{error}</p>
    {/if}
  {/if}
</div>

<style>
  .registerscreen {
    width: 100%;
    max-width: 40rem;
    display: flex;
    flex-direction: column;
    padding: 0.8rem 1rem;
  }

  .registerscreen__header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 1.4rem;
  }

  .registerscreen__heading {
    font-family: var(--sr);
    font-size: 1.35rem;
    font-weight: 400;
    color: var(--bk);
    margin: 0;
  }

  .registerscreen__lead {
    font-family: var(--font-lato);
    font-size: 0.78rem;
    color: #6B7280;
    line-height: 1.4;
    margin: 0 0 0.3rem;
  }

  .registerscreen__title {
    font-family: var(--sr);
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--bk);
    line-height: 1.3;
    margin: 0 0 1.2rem;
  }

  .registerscreen__document {
    margin: 1.6rem 0 1rem;
  }

  .registerscreen__error {
    font-family: var(--font-lato);
    font-size: 0.75rem;
    color: var(--color-error);
    margin: 0.6rem 0 0;
    text-align: center;
  }
</style>
```

Notas para o executor:
- O `Button` do DS aplica `width` pelo conteúdo (`inline-flex`); o mock pede full-width. Se o botão não ocupar 100%, envolver em um wrapper `.registerscreen__submit { display: flex; } .registerscreen__submit :global(.btn) { flex: 1; }` — preferir o wrapper a alterar o `Button`.
- `maxlength` conta a string mascarada (14 chars para CPF `000.000.000-00`, 18 para CNPJ).

- [ ] **Step 3: Type check e lint**

Run: `yarn check:web` e `yarn lint:web`
Expected: limpos (o componente ainda não é usado por nenhuma rota; isso é aceitável até a Task 11).

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/i18n/en.json apps/web/src/lib/i18n/pt.json apps/web/src/lib/presentation/components/RegisterScreen.svelte
git commit -m "feat(web): RegisterScreen component and registration i18n keys"
```

---

### Task 11: Web — rota `/register`

**Files:**
- Create: `apps/web/src/routes/register/+page.server.ts`
- Create: `apps/web/src/routes/register/+page.svelte`
- Test: `apps/web/src/routes/register/page.server.test.ts`

**Interfaces:**
- Consumes: `RegisterScreen` (Task 10); `POST /auth/register` (Task 5); cookie `babyclothes_token`.
- Produces: rota `/register` — `load` redireciona para `/login` sem sessão e para `/catalog` se já registrado; action `default` chama a API e redireciona para `/catalog` no sucesso.

- [ ] **Step 1: Testes que falham**

`page.server.test.ts` (seguir o padrão de mocks de `routes/login/page.server.test.ts`):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUBLIC_API_URL as API } from '$lib/env';

function makeCookies(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    set: vi.fn((k: string, v: string) => store.set(k, v)),
    get: vi.fn((k: string) => store.get(k)),
    delete: vi.fn((k: string) => store.delete(k)),
    _store: store,
  };
}

function makeRequest(fields: Record<string, string>) {
  return new Request('http://x', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
}

describe('register load', () => {
  it('redirects to /login without a session', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: undefined } } as never),
    ).rejects.toMatchObject({ status: 303, location: '/login' });
  });

  it('redirects to /catalog when already registered', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: { type: 'pf' } } } as never),
    ).rejects.toMatchObject({ status: 303, location: '/catalog' });
  });

  it('renders for an unregistered session', async () => {
    const { load } = await import('./+page.server');
    await expect(
      load({ locals: { session: { type: null } } } as never),
    ).resolves.toEqual({});
  });
});

describe('register action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('posts to the API and redirects to /catalog on success', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: '1', type: 'pf' } }), { status: 200 }),
    );
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    await expect(
      actions.default({
        request: makeRequest({ type: 'pf', document: '52998224725' }),
        cookies,
        fetch,
      } as never),
    ).rejects.toMatchObject({ status: 303, location: '/catalog' });

    expect(fetch).toHaveBeenCalledWith(
      `${API}/auth/register`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ authorization: 'Bearer tok' }),
        body: JSON.stringify({ type: 'pf', cpf: '52998224725' }),
      }),
    );
  });

  it('sends cnpj for PJ registrations', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ user: { id: '1', type: 'pj' } }), { status: 200 }),
    );
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    await expect(
      actions.default({
        request: makeRequest({ type: 'pj', document: '11222333000181' }),
        cookies,
        fetch,
      } as never),
    ).rejects.toMatchObject({ status: 303 });

    expect(fetch).toHaveBeenCalledWith(
      `${API}/auth/register`,
      expect.objectContaining({ body: JSON.stringify({ type: 'pj', cnpj: '11222333000181' }) }),
    );
  });

  it('fails with invalid_document on 422', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 422 }));
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    const result = await actions.default({
      request: makeRequest({ type: 'pf', document: '12345678900' }),
      cookies,
      fetch,
    } as never);

    expect(result).toMatchObject({ status: 422, data: { error: 'invalid_document' } });
  });

  it('redirects to /catalog on 409 already_registered', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 409 }));
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    await expect(
      actions.default({
        request: makeRequest({ type: 'pf', document: '52998224725' }),
        cookies,
        fetch,
      } as never),
    ).rejects.toMatchObject({ status: 303, location: '/catalog' });
  });

  it('fails 401 without a token cookie', async () => {
    const { actions } = await import('./+page.server');
    const fetch = vi.fn();
    const cookies = makeCookies();

    const result = await actions.default({
      request: makeRequest({ type: 'pf', document: '52998224725' }),
      cookies,
      fetch,
    } as never);

    expect(result).toMatchObject({ status: 401 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fails 400 for an invalid type', async () => {
    const { actions } = await import('./+page.server');
    const cookies = makeCookies({ babyclothes_token: 'tok' });

    const result = await actions.default({
      request: makeRequest({ type: 'mei', document: '52998224725' }),
      cookies,
      fetch: vi.fn(),
    } as never);

    expect(result).toMatchObject({ status: 400 });
  });
});
```

(Se o matcher `rejects.toMatchObject` não casar com o objeto de redirect do SvelteKit neste projeto, seguir o padrão que `login/page.server.test.ts` usa para o `logout` — que também dá `throw redirect(303, ...)` — e replicá-lo.)

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:web` → FAIL (módulo `./+page.server` não existe).

- [ ] **Step 3: Implementar `+page.server.ts`**

```ts
import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$lib/env';
import type { Actions, PageServerLoad } from './$types';

const ACCESS_COOKIE = 'babyclothes_token';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.session) throw redirect(303, '/login');
  if (locals.session.type) throw redirect(303, '/catalog');
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, fetch }) => {
    const form = await request.formData();
    const type = form.get('type');
    const document = form.get('document');
    const token = cookies.get(ACCESS_COOKIE);

    if (!token) return fail(401, { error: 'not_authenticated' });
    if (type !== 'pf' && type !== 'pj') return fail(400, { error: 'invalid_type' });
    if (typeof document !== 'string' || !document) return fail(400, { error: 'missing_document' });

    const body = type === 'pf' ? { type, cpf: document } : { type, cnpj: document };

    const res = await fetch(`${PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (res.status === 409) throw redirect(303, '/catalog');
    if (res.status === 422) return fail(422, { error: 'invalid_document' });
    if (!res.ok) return fail(res.status === 401 ? 401 : 500, { error: 'register_failed' });

    throw redirect(303, '/catalog');
  },
};
```

- [ ] **Step 4: Implementar `+page.svelte`**

```svelte
<script lang="ts">
  import { enhance } from '$app/forms'
  import { goto } from '$app/navigation'
  import RegisterScreen from '$lib/presentation/components/RegisterScreen.svelte'
  import { t } from '$lib/i18n'

  let loading = $state(false)
  let errorKey = $state('')

  let form = $state<HTMLFormElement | undefined>(undefined)
  let registerType = $state('')
  let registerDocument = $state('')

  const errorMessage = $derived(errorKey ? $t(errorKey) : undefined)

  function handleSubmit(data: { type: 'pf' | 'pj'; document: string }) {
    registerType = data.type
    registerDocument = data.document
    form?.requestSubmit()
  }
</script>

<svelte:head>
  <title>{$t('auth.registration.create_account')} | BabyClothes</title>
</svelte:head>

<div class="register-page">
  <form
    method="POST"
    bind:this={form}
    use:enhance={() => {
      loading = true
      errorKey = ''
      return async ({ result, update }) => {
        loading = false
        if (result.type === 'redirect') {
          await goto(result.location)
          return
        }
        if (result.type === 'failure') {
          const failure = result.data as { error?: string } | undefined
          errorKey =
            failure?.error === 'invalid_document'
              ? 'auth.registration.error_invalid_document'
              : 'auth.registration.error_generic'
          return
        }
        await update()
      }
    }}
    hidden
  >
    <input type="hidden" name="type" value={registerType} />
    <input type="hidden" name="document" value={registerDocument} />
  </form>

  <RegisterScreen
    onSubmit={handleSubmit}
    onBack={() => goto('/login')}
    {loading}
    error={errorMessage}
  />
</div>

<style>
  .register-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    background: var(--of);
    padding: 1rem;
  }
</style>
```

- [ ] **Step 5: Rodar e ver passar**

Run: `yarn test:web` → PASS. `yarn check:web` → limpo.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/routes/register
git commit -m "feat(web): /register route backed by POST /auth/register"
```

---

### Task 12: Web — rewire de `/login`, guard em hooks e limpeza

**Files:**
- Modify: `apps/web/src/routes/login/+page.svelte` (remover step register)
- Modify: `apps/web/src/routes/login/+page.server.ts` (remover action `register`)
- Modify: `apps/web/src/routes/login/page.server.test.ts` (remover testes da action `register`, se existirem)
- Modify: `apps/web/src/hooks.server.ts` (+ guard de registro pendente)
- Modify: `apps/web/src/hooks.server.test.ts` (novos casos)
- Delete: `apps/web/src/lib/presentation/components/RegistrationForm.svelte`, `apps/web/src/lib/presentation/components/RegistrationTypeSelector.svelte`
- Modify: `apps/web/CLAUDE.md` (tabela de rotas)

**Interfaces:**
- Consumes: rota `/register` (Task 11).
- Produces: `/login` redireciona para `/register` quando `session.type === null`; qualquer rota protegida redireciona sessão não-registrada para `/register`.

- [ ] **Step 1: Testes do hook que falham** — adicionar ao `hooks.server.test.ts` (seguindo os mocks existentes do arquivo; a sessão mockada deve ter `type: null`):

```ts
it('redirects an unregistered session to /register', async () => {
  // montar event com locals.session = { ...mockSession, type: null } e pathname '/catalog'
  // esperar redirect 303 para '/register'
});

it('lets an unregistered session access /register', async () => {
  // event com session type null e pathname '/register' → resolve normalmente
});

it('does not redirect a registered session to /register', async () => {
  // session type 'pf' e pathname '/catalog' → resolve normalmente
});
```

Implementar os três seguindo exatamente o helper/estilo de mock que o `hooks.server.test.ts` atual usa para simular `event` e `resolve` (ver os testes de redirect para `/login` já existentes no arquivo e copiar a infraestrutura).

- [ ] **Step 2: Rodar e ver falhar**

Run: `yarn test:web` → FAIL nos casos novos.

- [ ] **Step 3: Guard em `hooks.server.ts`** — após o bloco que redireciona para `/login` (linhas 79–82), adicionar:

```ts
  const needsRegistration = event.locals.session && !event.locals.session.type;
  const isRegisterRoute = event.url.pathname.startsWith('/register');
  if (needsRegistration && !isRegisterRoute && !isPublicRoute) {
    throw redirect(303, '/register');
  }
```

(`/register` fica fora de `publicRoutes` — sem sessão, o guard anterior já manda para `/login`.)

- [ ] **Step 4: Simplificar `/login`**

Em `routes/login/+page.svelte`:
1. Remover o import de `RegistrationForm` e todo o form escondido de `?/register` (variáveis `registerForm`, `registerType`, `registerDocument`, função `handleRegistrationComplete`).
2. Tipo `Step` vira `'login' | 'redirecting'`.
3. `onLoginResult` passa a ser:

```ts
function onLoginResult(session: { type: string | null } | undefined) {
  loading = false
  if (!session) {
    error = 'login_failed'
    return
  }
  step = 'redirecting'
  goto(session.type ? '/catalog' : '/register')
}
```

4. Remover o bloco `{:else if step === 'register'}` do template e a classe `login-page--register` (e seu CSS).

Em `routes/login/+page.server.ts`: remover a action `register` inteira (login, devLogin e logout ficam).

Em `routes/login/page.server.test.ts`: remover qualquer `describe`/teste da action `register` (rodar `yarn test:web` aponta os que quebraram).

- [ ] **Step 5: Deletar componentes órfãos**

```bash
rm apps/web/src/lib/presentation/components/RegistrationForm.svelte apps/web/src/lib/presentation/components/RegistrationTypeSelector.svelte
grep -rn "RegistrationForm\|RegistrationTypeSelector" apps/web/src
```

Expected: grep sem resultados.

- [ ] **Step 6: Documentar a rota** — em `apps/web/CLAUDE.md`, adicionar à tabela de rotas, logo após a linha de `/login`:

```markdown
| `/register` | `routes/register/+page.svelte` | PF/PJ registration (post-login) |
```

- [ ] **Step 7: Rodar tudo e ver passar**

Run: `yarn test:web` → PASS. `yarn check:web`, `yarn lint:web` → limpos.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/routes/login apps/web/src/hooks.server.ts apps/web/src/hooks.server.test.ts apps/web/CLAUDE.md
git rm apps/web/src/lib/presentation/components/RegistrationForm.svelte apps/web/src/lib/presentation/components/RegistrationTypeSelector.svelte 2>/dev/null || git add -A apps/web/src/lib/presentation/components
git commit -m "feat(web): route unregistered sessions to /register and retire inline flow"
```

---

### Task 13: Verificação end-to-end

**Files:** nenhum (verificação).

- [ ] **Step 1: Suíte completa**

Run: `yarn test && yarn check && yarn lint && yarn api:credo`
Expected: tudo verde, sem warnings.

- [ ] **Step 2: Fluxo real via Docker**

```bash
yarn dev          # sobe postgres + api + agents + web
```

Depois, em outro terminal, simular o fluxo de um usuário novo (o dev user é criado já registrado; para exercitar o registro, criar um usuário pendente direto na API):

```bash
# 1. dev-login para obter um token de referência do formato
curl -s -X POST http://localhost:4000/auth/dev-login -H 'content-type: application/json' -d '{}' | head -c 300

# 2. validar o endpoint de registro com um usuário pendente:
docker compose exec api mix run -e '
{:ok, u} = %Api.Users.User{} |> Api.Users.User.changeset(%{email: "e2e@example.com", name: "E2E", google_id: "g-e2e"}) |> Api.Repo.insert()
IO.puts(Api.Auth.generate_access_token(u))
'
# copiar o token impresso:
curl -s -X POST http://localhost:4000/auth/register \
  -H 'content-type: application/json' -H "Authorization: Bearer <TOKEN>" \
  -d '{"type":"pf","cpf":"12345678909"}'
```

Expected: `{"user":{...,"type":"pf","cpf":"12345678909",...}}`; repetir a mesma chamada → `{"error":"already_registered"}` com status 409.

- [ ] **Step 3: Fluxo no browser**

Abrir `http://localhost:5173/register` sem sessão → deve cair em `/login`. Verificar em `http://localhost:5173/login` que o step de registro embutido sumiu. (Fluxo completo de registro no browser exige um usuário Google novo ou apagar o `type` do dev user: `docker compose exec postgres psql -U postgres -d babyclothes_dev -c "UPDATE users SET type=NULL, cpf=NULL WHERE email='dev@babyclothes.app'"` — depois dev-login → deve aterrissar em `/register`, selecionar PF, digitar `123.456.789-09`, Continuar → `/catalog`.)

- [ ] **Step 4: Conferir layout contra o mock**

Abrir a tela `/register` e comparar com `BabyClothes architecture diagrams/BabyClothes Mocks.dc.html` (tela 02): header, cards, campo e botão na ordem e nas proporções da tabela de referência deste plano.

- [ ] **Step 5: Commit final (se houve ajustes)**

```bash
git add -A
git commit -m "fix(web): registration flow polish after e2e verification"
```

---

## Self-review (feito na escrita do plano)

- **Cobertura do mock tpl41**: header ✓ (Task 10), lead/título ✓, cards PF/PJ com seleção ✓ (Tasks 7–8), campo documento com máscara ✓ (Tasks 6, 9, 10), botão Continuar com seta ✓ (Task 10), fundo/espacamentos ✓ (tabela de referência).
- **Atomicidade**: átomo estendido (`Input`), molécula (`SelectionCard`), organismo de seleção (`SelectionCardGroup`); composição de página fica no app (`RegisterScreen`), seguindo o padrão existente (AuthScreen).
- **Tipos consistentes**: `SelectionOption.value: string` (Task 8) ↔ `options` da Task 10; `onSubmit({type, document})` (Task 10) ↔ form fields `type/document` (Task 11) ↔ body `{type, cpf|cnpj}` (Task 11) ↔ `Users.register_account` (Tasks 4–5).
- **Riscos sinalizados no próprio plano**: snippet parametrizado no `{#each}` (Task 8), largura do Button (Task 10), matcher de redirect nos testes (Task 11), helper `errors_on` (Task 3).
