# Build React frontend
FROM node:20-bookworm-slim AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY public ./public
COPY src ./src
COPY executeCode.js localExecute.js ./

ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=true
RUN npm run build

# Production image with Node + Python for local code execution
FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 bash g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY server.js executeCode.js localExecute.js ./
COPY src/actions ./src/actions
COPY --from=builder /app/build ./build

ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

CMD ["node", "server.js"]
