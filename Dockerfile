# ============================================
# STAGE 1: Build the Angular application
# ============================================
FROM node:lts-alpine3.19 AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# This layer is cached unless package.json changes
COPY ./src/package*.json ./

# Install dependencies with clean install for reproducible builds
RUN npm ci

# Copy the rest of the application source code
COPY ./src .

# Build the Angular application for production
RUN npx ng build --configuration=production

# ============================================
# STAGE 2: Serve the application with Nginx
# ============================================
FROM nginx:1.24-alpine

# Copy custom nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
COPY --from=build /app/dist/src/browser /usr/share/nginx/html

# Copy entrypoint script for runtime configuration
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80 for HTTP traffic
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Use entrypoint script to generate config from environment variables
ENTRYPOINT ["/docker-entrypoint.sh"]