FROM node:22-alpine
WORKDIR /app
COPY apps/web/package.json ./
COPY package.json /root-package.json
COPY packages/ui/package.json /packages/ui/package.json
RUN corepack enable && yarn install
COPY apps/web .
COPY packages/ui /packages/ui
EXPOSE 5173
CMD ["yarn", "dev", "--host"]
