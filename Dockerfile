FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build --if-present

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
# server/proxy.mjs serves the built frontend + the /api proxy on PORT (default 8080).
# Pass your key at runtime:  docker run -e GEMINI_API_KEY=... -p 8080:8080 ...
EXPOSE 8080
CMD ["npm", "start"]
