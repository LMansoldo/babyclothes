FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/agents/package.json apps/agents/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/design-system/package.json packages/design-system/package.json
RUN corepack enable && yarn install
COPY apps/agents apps/agents
COPY proto /app/proto
EXPOSE 50051
CMD ["yarn", "workspace", "@babyclothes/agents", "dev"]
