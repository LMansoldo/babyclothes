FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/agents/package.json apps/agents/package.json
COPY packages/design-system/package.json packages/design-system/package.json
RUN corepack enable && yarn install
COPY apps/web apps/web
COPY packages/design-system packages/design-system
EXPOSE 5173
CMD ["yarn", "workspace", "@babyclothes/web", "dev", "--host"]
