FROM node:20.9.0-alpine

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and pnpm-lock.yaml (DO NOT COPY OTHER FILES YET)
COPY package.json pnpm-lock.yaml ./

# Install project dependencies
RUN pnpm install @modelcontextprotocol/sdk zod

# Instala pm2 globalmente
RUN npm install -g pm2

COPY . /app

EXPOSE 3000

# Inicia la aplicación usando pm2
CMD ["pm2-runtime", "main.ts"]

