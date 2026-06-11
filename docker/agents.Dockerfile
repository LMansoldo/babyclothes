FROM node:22-alpine
WORKDIR /app
COPY apps/agents/package.json ./
RUN corepack enable && yarn install
COPY apps/agents .
COPY proto /proto
EXPOSE 50051
CMD ["yarn", "dev"]
