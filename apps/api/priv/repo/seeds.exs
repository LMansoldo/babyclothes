# Seed script — populates the database with mock data matching apps/web/src/lib/mocks/data.ts
#
# Usage: mix run priv/repo/seeds.exs
#
# Maps mock data to Ecto schemas:
#   - Mock string IDs → auto-increment integer IDs (ids are printed at the end)
#   - frontend 'new_match' notification type → backend ':new_message' enum value
#   - frontend MockChild.gender → omitted (backend children schema has no gender)

alias Api.Repo


IO.puts("═" <> String.duplicate("═", 60) <> "╗")
IO.puts("  BabyClothes Database Seed")
IO.puts("  Starting at: #{DateTime.utc_now() |> DateTime.to_string()}")
IO.puts("╚" <> String.duplicate("═", 60) <> "╝")
IO.puts("")

# ── Users (1 main user + 4 sellers) ──────────────────────────────────────────

IO.puts("── Users ──────────────────────────────────────────────")

users_data = [
  %{email: "ana@example.com", name: "Ana Silva", avatar_url: "", google_id: "google-ana", type: "pf", cpf: "12345678901", is_seller: false},
  %{email: "maria@example.com", name: "Maria Souza", avatar_url: "", google_id: "google-maria", type: "pf", cpf: "23456789012", is_seller: true},
  %{email: "juliana@example.com", name: "Juliana Costa", avatar_url: "", google_id: "google-juliana", type: "pj", cnpj: "12345678000190", is_seller: true},
  %{email: "carla@example.com", name: "Carla Santos", avatar_url: "", google_id: "google-carla", type: "pf", cpf: "34567890123", is_seller: true},
  %{email: "fernanda@example.com", name: "Fernanda Lima", avatar_url: "", google_id: "google-fernanda", type: "pj", cnpj: "23456789000101", is_seller: true},
]

users =
  Enum.map(users_data, fn attrs ->
    {:ok, user} =
      %Api.Users.User{}
      |> Api.Users.User.changeset(attrs)
      |> Repo.insert()

    IO.puts("  ✓ #{user.name} (#{user.email}) → id=#{user.id}")
    {attrs.email, user}
  end)
  |> Map.new()

main_user = users["ana@example.com"]
seller1  = users["maria@example.com"]
seller2  = users["juliana@example.com"]
seller3  = users["carla@example.com"]
seller4  = users["fernanda@example.com"]

IO.puts("")

# ── Children ──────────────────────────────────────────────────────────────────

IO.puts("── Children ────────────────────────────────────────────")

children_data = [
  %{name: "Sofia",   birth_date: ~D[2024-03-15], birth_weight_g: 3200, birth_height_cm: 49, user_id: main_user.id},
  %{name: "Miguel",  birth_date: ~D[2023-08-22], birth_weight_g: 3500, birth_height_cm: 51, user_id: main_user.id},
  %{name: "Laura",   birth_date: ~D[2025-01-10], birth_weight_g: 2900, birth_height_cm: 47, user_id: main_user.id},
]

children =
  Enum.map(children_data, fn attrs ->
    {:ok, child} =
      %Api.Children.Child{}
      |> Api.Children.Child.changeset(attrs)
      |> Repo.insert()

    IO.puts("  ✓ #{child.name} → id=#{child.id}")
    {child.name, child}
  end)
  |> Map.new()

sofia  = children["Sofia"]
miguel = children["Miguel"]
laura  = children["Laura"]

IO.puts("")

# ── Growth Records ────────────────────────────────────────────────────────────

IO.puts("── Growth Records ──────────────────────────────────────")

measurements_data = [
  # Sofia (4 records)
  %{child_id: sofia.id,  recorded_at: ~U[2024-03-15 12:00:00Z], weight_g: 3200, height_cm: 49, clothing_size: "RN"},
  %{child_id: sofia.id,  recorded_at: ~U[2024-05-15 12:00:00Z], weight_g: 4500, height_cm: 55, clothing_size: "P"},
  %{child_id: sofia.id,  recorded_at: ~U[2024-08-15 12:00:00Z], weight_g: 6200, height_cm: 62, clothing_size: "M"},
  %{child_id: sofia.id,  recorded_at: ~U[2024-11-15 12:00:00Z], weight_g: 7800, height_cm: 68, clothing_size: "M"},
  %{child_id: sofia.id,  recorded_at: ~U[2025-03-15 12:00:00Z], weight_g: 9100, height_cm: 73, clothing_size: "G"},
  # Miguel (5 records)
  %{child_id: miguel.id, recorded_at: ~U[2023-08-22 12:00:00Z], weight_g: 3500, height_cm: 51, clothing_size: "RN"},
  %{child_id: miguel.id, recorded_at: ~U[2023-11-22 12:00:00Z], weight_g: 5800, height_cm: 60, clothing_size: "P"},
  %{child_id: miguel.id, recorded_at: ~U[2024-04-22 12:00:00Z], weight_g: 8200, height_cm: 70, clothing_size: "M"},
  %{child_id: miguel.id, recorded_at: ~U[2024-08-22 12:00:00Z], weight_g: 10500, height_cm: 78, clothing_size: "G"},
  %{child_id: miguel.id, recorded_at: ~U[2025-02-22 12:00:00Z], weight_g: 12000, height_cm: 84, clothing_size: "GG"},
  # Laura (2 records)
  %{child_id: laura.id,  recorded_at: ~U[2025-01-10 12:00:00Z], weight_g: 2900, height_cm: 47, clothing_size: "RN"},
  %{child_id: laura.id,  recorded_at: ~U[2025-04-10 12:00:00Z], weight_g: 4100, height_cm: 53, clothing_size: "P"},
]

Enum.each(measurements_data, fn attrs ->
  {:ok, m} =
    %Api.Children.Measurement{}
    |> Api.Children.Measurement.changeset(attrs)
    |> Repo.insert()

  IO.puts("  ✓ child=#{m.child_id} #{m.clothing_size} @ #{m.recorded_at |> DateTime.to_date()}")
end)

IO.puts("")

# ── Items ─────────────────────────────────────────────────────────────────────

IO.puts("── Items ───────────────────────────────────────────────")

items_data = [
  %{seller_id: seller1.id, title: "Macacão floral com laço",        description: "Lindo macacão floral com laço na cintura. Tecido leve e respirável, perfeito para o verão.",              category: "romper",    gender: :female, clothing_size: "P",  condition: :new,      price_cents: 8900,  status: :active},
  %{seller_id: seller2.id, title: "Body manga longa estrelas",      description: "Body de manga longa com estampado de estrelas. Algodão orgânico, super macio.",                           category: "bodysuit",  gender: :unisex, clothing_size: "M",  condition: :like_new, price_cents: 4500,  status: :active},
  %{seller_id: seller1.id, title: "Vestido tutu rosa",              description: "Vestido com saia tutu rosa e top de algodão. Ideal para festas e ocasiões especiais.",                     category: "dress",     gender: :female, clothing_size: "G",  condition: :new,      price_cents: 12900, status: :active},
  %{seller_id: seller3.id, title: "Jaqueta jeans forrada",          description: "Jaqueta jeans forrada com pelúcia. Perfeita para dias mais frios.",                                         category: "coat",      gender: :male,   clothing_size: "2",  condition: :used,     price_cents: 3500,  status: :active},
  %{seller_id: seller2.id, title: "Conjunto listrado marinho",      description: "Conjunto de camiseta e calça listrada. Algodão premium, cores que não desbotam.",                           category: "set",       gender: :male,   clothing_size: "M",  condition: :like_new, price_cents: 6700,  status: :active},
  %{seller_id: seller4.id, title: "Laço de cabelo artesanal",       description: "Laço de cabelo feito à mão com tecido de algodão. Hipoalergênico.",                                        category: "accessory", gender: :female, clothing_size: "RN", condition: :new,      price_cents: 1800,  status: :active},
  %{seller_id: seller1.id, title: "Macacão dinossauro verde",       description: "Macacão divertido com estampa de dinossauro. Tem capuz com chifres.",                                      category: "romper",    gender: :male,   clothing_size: "G",  condition: :new,      price_cents: 9500,  status: :active},
  %{seller_id: seller3.id, title: "Body manga curta frutas",        description: "Body com estampa de frutas coloridas. Algodão macio e elástico.",                                          category: "bodysuit",  gender: :unisex, clothing_size: "P",  condition: :used,     price_cents: 2500,  status: :active},
  %{seller_id: seller4.id, title: "Vestido princesa azul",          description: "Vestido de princesa azul com glitter e saia volumosa. Perfeito para fantasias.",                             category: "dress",     gender: :female, clothing_size: "1",  condition: :like_new, price_cents: 15000, status: :active},
  %{seller_id: seller2.id, title: "Conjunto inverno urso",          description: "Conjunto de inverno com estampa de urso. Inclui blusa de lã e calça forrada.",                              category: "set",       gender: :unisex, clothing_size: "GG", condition: :new,      price_cents: 11000, status: :active},
]

Enum.each(items_data, fn attrs ->
  {:ok, item} =
    %Api.Items.Item{}
    |> Api.Items.Item.changeset(attrs)
    |> Repo.insert()

  IO.puts("  ✓ #{item.title} — R$#{Float.round(item.price_cents / 100, 2)} → id=#{item.id}")
end)

IO.puts("")

# ── Notifications ─────────────────────────────────────────────────────────────
# IMPORTANT: frontend mock data uses 'new_match' type, but backend Ecto enum only
# has: :growth_prediction, :new_message, :item_sold, :system.
# Map 'new_match' → 'new_message' (the closest semantic match).

IO.puts("── Notifications ───────────────────────────────────────")

notifications_data = [
  %{user_id: main_user.id, type: :growth_prediction, title: "Previsão de tamanho",         body: "Sofia vai precisar de roupas tamanho G em breve!",                                                              read_at: nil},
  %{user_id: main_user.id, type: :new_message,       title: "Novo item compatível",         body: "Maria Souza listou um macacão no tamanho M que combina com Miguel.",                                              read_at: ~U[2025-06-14 12:00:00Z]},
  %{user_id: main_user.id, type: :system,             title: "Bem-vinda!",                   body: "Complete o perfil da Sofia para receber recomendações personalizadas.",                                          read_at: nil},
  %{user_id: main_user.id, type: :growth_prediction, title: "Hora de comprar!",             body: "Laura está crescendo rápido. Considere comprar roupas tamanho P.",                                               read_at: ~U[2025-06-13 12:00:00Z]},
  %{user_id: main_user.id, type: :new_message,       title: "Preço reduzido",               body: "O Vestido tutu rosa que você favoritou teve o preço reduzido!",                                                read_at: nil},
  %{user_id: main_user.id, type: :system,             title: "Atualização do app",           body: "Nova funcionalidade: agora você pode acompanhar o crescimento dos seus filhos!",                                 read_at: ~U[2025-06-10 12:00:00Z]},
]

Enum.each(notifications_data, fn attrs ->
  {:ok, notif} =
    %Api.Notifications.Notification{}
    |> Api.Notifications.Notification.changeset(attrs)
    |> Repo.insert()

  IO.puts("  ✓ #{notif.title} (#{notif.type}) → id=#{notif.id}")
end)

IO.puts("")
IO.puts("═" <> String.duplicate("═", 60) <> "╗")
IO.puts("  Seed complete!")
IO.puts("")
IO.puts("  ── Main User ──")
IO.puts("  ana@example.com / google_id: google-ana")
IO.puts("  User ID: #{main_user.id}")
IO.puts("")
IO.puts("  ── How to use with the frontend ──")
IO.puts("  Since there's no Google OAuth in dev mode, set localStorage manually:")
IO.puts("")
IO.puts("  localStorage.setItem('babyclothes_token', '<see below>')")
IO.puts("  localStorage.setItem('babyclothes_user_id', '#{main_user.id}')")
IO.puts("")
IO.puts("  To generate a JWT token, run in IEx:")
IO.puts("    iex> Api.Auth.generate_token(%{user_id: #{main_user.id}})")
IO.puts("╚" <> String.duplicate("═", 60) <> "╝")
