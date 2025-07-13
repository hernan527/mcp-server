FROM node:20.9.0-alpine

WORKDIR /app

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia archivos base de dependencias
COPY package.json pnpm-lock.yaml ./

# Instala dependencias del proyecto
RUN pnpm install

# Instala PM2 globalmente
RUN npm install -g pm2

# Copia todo el proyecto
COPY . .

# Compila el proyecto TypeScript
RUN pnpm run build

# Expone el puerto (ajusta si tu app usa otro)
EXPOSE 3000

# Ejecuta la app con PM2
CMD ["pm2-runtime", "dist/main.js"]
