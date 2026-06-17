# apps/agents — AI Growth Prediction Agent

> **Before writing any code, read `RULES.md` at the project root.**

## Tech Stack

- **TypeScript 5** (strict, ES2022 target)
- **LangGraph** (`@langchain/langgraph`) — agent orchestration
- **Anthropic SDK** (`@anthropic-ai/sdk`, `@langchain/anthropic`) — LLM
- **gRPC** (`@grpc/grpc-js`, `@grpc/proto-loader`) — server interface
- **tsx** — dev runner
- **Vitest** — testing

## Commands

```bash
yarn workspace @babyclothes/agents dev      # Dev with tsx watch
yarn workspace @babyclothes/agents build    # Compile to dist/
yarn workspace @babyclothes/agents start    # Run compiled output
yarn workspace @babyclothes/agents test     # Run tests
```

## Structure

```
src/
└── index.ts          # gRPC server entry point (stub)
proto/
└── agent.proto       # gRPC contract (shared with API)
```

## gRPC Services

Defined in `proto/agent.proto`:

| Service | Type | Description |
|---------|------|-------------|
| `Chat` | Server streaming | AI conversation with streaming responses |
| `PredictGrowth` | Unary | Predict next clothing size and timeline |

## Current Status

**Stub implementation** — returns hardcoded responses. LangGraph integration is planned.

## Environment Variables

- `GRPC_PORT` — gRPC listen port (default: `50051`)
- `ANTHROPIC_API_KEY` — Anthropic API key (planned)

## Conventions

- Follow LangGraph patterns for agent graphs
- Use TypeScript strict mode
- gRPC contract changes require updating `proto/agent.proto` (shared with API)
