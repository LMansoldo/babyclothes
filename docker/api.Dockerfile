FROM elixir:1.17-alpine
RUN apk add --no-cache build-base git postgresql-client protobuf-dev
WORKDIR /app
COPY apps/api/mix.exs apps/api/mix.lock* ./
RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get
COPY apps/api .
COPY proto /proto
COPY docker/api.entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["/entrypoint.sh"]
