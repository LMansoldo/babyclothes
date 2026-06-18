defmodule Api.Factory do
  @moduledoc "ExMachina factory for test data."

  use ExMachina.Ecto, repo: Api.Repo

  alias Api.Users.User
  alias Api.Children.Child
  alias Api.Children.Measurement
  alias Api.Items.Item
  alias Api.Items.Photo
  alias Api.Notifications.Notification
  alias Api.FeatureFlags.FeatureFlag

  def user_factory do
    %User{
      email: sequence(:email, &"user#{&1}@example.com"),
      name: sequence(:name, &"User #{&1}"),
      avatar_url: "https://example.com/avatar.png",
      google_id: sequence(:google_id, &"google_#{&1}")
    }
  end

  def child_factory do
    %Child{
      user: build(:user),
      name: sequence(:name, &"Child #{&1}"),
      birth_date: ~D[2023-01-15],
      birth_weight_g: 3200,
      birth_height_cm: 50
    }
  end

  def measurement_factory do
    %Measurement{
      child: build(:child),
      recorded_at: DateTime.utc_now(),
      weight_g: 5000,
      height_cm: 60,
      clothing_size: "P"
    }
  end

  def item_factory do
    %Item{
      seller: build(:user),
      title: sequence(:title, &"Item #{&1}"),
      description: "Great piece in good condition",
      category: "body",
      gender: :unisex,
      clothing_size: "M",
      condition: :like_new,
      price_cents: 3500,
      status: :active
    }
  end

  def photo_factory do
    %Photo{
      item: build(:item),
      url: sequence(:url, &"https://cdn.example.com/photo#{&1}.jpg"),
      position: 0
    }
  end

  def notification_factory do
    %Notification{
      user: build(:user),
      type: :growth_prediction,
      title: "Your baby is growing!",
      body: "Sofia will need size M soon.",
      metadata: %{},
      read_at: nil
    }
  end

  def feature_flag_factory do
    %FeatureFlag{
      key: sequence(:key, &"feature_#{&1}"),
      enabled: false,
      description: "A feature flag"
    }
  end
end
