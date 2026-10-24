# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve the static frontend
FROM nginx:alpine

LABEL org.opencontainers.image.title="Cropin" \
      org.opencontainers.image.description="Ferramenta frontend para recortar imagens e GIFs animados" \
      org.opencontainers.image.source="https://github.com/coelhomarcus/cropin"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]
