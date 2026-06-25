#!/bin/sh
set -e

echo "==> Installing hex + rebar..."
mix local.hex --force && mix local.rebar --force

echo "==> Installing dependencies..."
mix deps.get

echo "==> Creating database (if not exists)..."
mix ecto.create

echo "==> Running migrations..."
mix ecto.migrate

echo "==> Starting API server..."
exec mix run --no-halt
