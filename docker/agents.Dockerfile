FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/agents/package.json apps/agents/package.json
RUN corepack enable && yarn install
COPY apps/agents apps/agents
COPY proto /proto
EXPOSE 50051
CMD ["yarn", "workspace", "@babyclothes/agents", "dev"]
