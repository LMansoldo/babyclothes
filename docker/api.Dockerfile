FROM elixir:1.17-alpine
RUN apk add --no-cache build-base git postgresql-client protobuf-dev
WORKDIR /app
COPY apps/api/mix.exs apps/api/mix.lock* ./
RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get
COPY apps/api .
COPY proto /proto
EXPOSE 4000
CMD ["mix", "run", "--no-halt"]
