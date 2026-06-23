FROM node:20-alpine

WORKDIR /app

# Install bun (project uses bun-style workflow but npm works fine for vite dev)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

EXPOSE 8080

ENV HOST=0.0.0.0
ENV PORT=8080

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]
