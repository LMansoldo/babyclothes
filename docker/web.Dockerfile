FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN corepack enable && yarn install
COPY apps/web apps/web
COPY packages/ui packages/ui
EXPOSE 5173
CMD ["yarn", "workspace", "@babyclothes/web", "dev", "--host"]
