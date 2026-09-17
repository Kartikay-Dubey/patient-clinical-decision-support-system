# ==============================================================================
# Dockerfile for Clinical Decision Support System - Frontend (React + Nginx)
# ==============================================================================

# Stage 1: Build the React static assets with Vite
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build production bundle
RUN npm run build

# Stage 2: Serve static bundle via Nginx
FROM nginx:alpine

# Copy custom Nginx SPA configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx default html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
