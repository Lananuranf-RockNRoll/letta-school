FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
RUN apk update && apk upgrade libpng && rm -rf /var/cache/apk/*
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Tambahin non-root user
RUN adduser -D -s /bin/sh appuser && \
    chown -R appuser:appuser /usr/share/nginx/html && \
    chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown appuser:appuser /var/run/nginx.pid
USER appuser

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]