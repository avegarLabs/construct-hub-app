# ================================
# Stage 1: Build Angular Application
# ================================
FROM node:18-bullseye-slim AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies with npm ci for reproducible builds
# --omit=dev is not used here because Angular build needs dev dependencies
RUN npm ci --prefer-offline --no-audit

# Copy all configuration files required for Angular + Tailwind build
COPY tsconfig.json tsconfig.app.json angular.json ./
COPY .browserslistrc* ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Verify critical files exist before proceeding
RUN echo "Verifying critical build files..." && \
    test -f tsconfig.app.json || (echo "ERROR: tsconfig.app.json not found!" && exit 1) && \
    test -f angular.json || (echo "ERROR: angular.json not found!" && exit 1) && \
    test -f tailwind.config.js || (echo "ERROR: tailwind.config.js not found!" && exit 1) && \
    test -f postcss.config.js || (echo "ERROR: postcss.config.js not found!" && exit 1) && \
    echo "All critical files verified successfully."

# Copy source code and assets
# IMPORTANT: Must copy entire src directory to include all styles, assets, and component files
COPY src ./src

# Copy public directory (static assets like favicon, images, etc.)
COPY public ./public

# Build Angular application for production
RUN npx ng build --configuration=production

# Verify build output exists
RUN echo "Verifying build output..." && \
    test -d dist/construct-hub-app/browser || (echo "ERROR: Build output not found!" && exit 1) && \
    echo "Build completed successfully."

# ================================
# Stage 2: Production Nginx Server
# ================================
FROM nginx:1.25-alpine

# Add metadata labels
LABEL maintainer="Avegar Labs"
LABEL description="Construct Hub Frontend - Angular Application"
LABEL version="1.0"

# Copy built application from build stage
COPY --from=build /usr/src/app/dist/construct-hub-app/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Expose port 80
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
