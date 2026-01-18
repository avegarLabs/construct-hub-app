# Docker Build Guide for Construct Hub Frontend

## Overview

This document provides instructions for building and deploying the Construct Hub frontend using Docker.

## Prerequisites

- Docker 20.10+ or later
- Docker Compose 2.0+ (optional, for full stack deployment)

## Build Instructions

### 1. Validate Build Environment (Recommended)

Before building, run the validation script to ensure all required files are present:

```bash
# Make script executable (Linux/Mac)
chmod +x validate-build-env.sh

# Run validation
./validate-build-env.sh
```

For Windows (Git Bash or WSL):
```bash
bash validate-build-env.sh
```

### 2. Build Docker Image

From the `front/construct-hub-app/` directory:

```bash
# Build the image
docker build -t construct-hub-frontend:latest .

# Build with specific tag
docker build -t construct-hub-frontend:1.0.0 .

# Build with no cache (clean build)
docker build --no-cache -t construct-hub-frontend:latest .
```

### 3. Run the Container

#### Standalone (Frontend only)

```bash
docker run -d \
  --name construct-hub-frontend \
  -p 8080:80 \
  construct-hub-frontend:latest
```

Access the application at: `http://localhost:8080`

#### With Custom Nginx Configuration

```bash
docker run -d \
  --name construct-hub-frontend \
  -p 8080:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  construct-hub-frontend:latest
```

#### With Backend (Docker Compose)

From the project root:

```bash
docker-compose up -d
```

## Build Stages Explained

### Stage 1: Build (node:18-bullseye-slim)

1. **Dependency Installation**: Uses `npm ci` for reproducible builds
2. **File Verification**: Validates critical files exist before build
3. **Angular Build**: Compiles TypeScript and bundles the application
4. **Output Verification**: Ensures build artifacts were created successfully

### Stage 2: Production (nginx:1.25-alpine)

1. **Copy Build Artifacts**: Only the compiled application is copied
2. **Nginx Configuration**: Custom config with security headers and caching
3. **Health Check**: Built-in endpoint at `/health` for monitoring
4. **Minimal Size**: Alpine-based image for smaller footprint

## Build Optimization Features

### Multi-Stage Build
- Separates build environment from runtime
- Final image only contains necessary files
- Reduces image size by ~90%

### Layer Caching
- Dependencies installed before source code copy
- Leverages Docker cache for faster rebuilds
- Only rebuilds when package.json changes

### Security
- Non-root user (nginx)
- Security headers configured
- No sensitive files included
- Minimal attack surface

## Troubleshooting

### Build Fails with "tsconfig.app.json not found"

**Cause**: The `.dockerignore` file is excluding critical configuration files.

**Solution**: Ensure `.dockerignore` does NOT contain:
- `tsconfig.app.json`
- `tsconfig.json`
- `angular.json`
- `.browserslistrc`

Run `./validate-build-env.sh` to check.

### Build Fails with "Cannot find module"

**Cause**: Missing dependencies or corrupted package-lock.json

**Solution**:
```bash
# Locally regenerate package-lock.json
rm package-lock.json
npm install

# Rebuild image with no cache
docker build --no-cache -t construct-hub-frontend:latest .
```

### Nginx Returns 404 for Routes

**Cause**: Angular routing not configured in Nginx

**Solution**: Ensure `nginx.conf` contains:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

This is already configured in the provided nginx.conf.

### Health Check Failing

**Cause**: `/health` endpoint not configured

**Solution**: Verify nginx.conf contains:
```nginx
location /health {
  access_log off;
  return 200 "healthy\n";
  add_header Content-Type text/plain;
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Frontend

on:
  push:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Validate build environment
        working-directory: front/construct-hub-app
        run: bash validate-build-env.sh

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build Docker image
        working-directory: front/construct-hub-app
        run: |
          docker build \
            --tag construct-hub-frontend:${{ github.sha }} \
            --tag construct-hub-frontend:latest \
            .

      - name: Test image health
        run: |
          docker run -d --name test-container -p 8080:80 construct-hub-frontend:latest
          sleep 5
          curl -f http://localhost:8080/health || exit 1
          docker stop test-container

      # Add your push to registry step here
```

## Best Practices

1. **Always run validation before build** in CI/CD pipelines
2. **Use specific tags** for production deployments, not `latest`
3. **Monitor build times** - should be <3 minutes with cache
4. **Test health endpoint** after deployment
5. **Use `.dockerignore`** to exclude unnecessary files
6. **Keep nginx.conf in version control** - don't mount in production

## Image Size

Expected image sizes:
- Build stage: ~1.2 GB (discarded)
- Final image: ~25-35 MB (Alpine-based)

If your image is larger, check:
- `.dockerignore` is properly configured
- No unnecessary files in `dist/` directory
- Multi-stage build is working correctly

## Environment Variables

The frontend image doesn't require environment variables at runtime. Backend URL is configured via Nginx proxy.

To change backend URL, modify `nginx.conf`:
```nginx
location /api/ {
  proxy_pass http://your-backend-host:8080;
}
```

## Health Monitoring

The container includes a health check that runs every 30 seconds:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' construct-hub-frontend

# View health check logs
docker inspect --format='{{json .State.Health}}' construct-hub-frontend | jq
```

## Support

For issues related to:
- **Docker build**: Check this document and run validation script
- **Angular build**: Check Angular 19 documentation
- **Nginx configuration**: Check nginx.conf and Nginx docs
- **Application errors**: Check browser console and backend logs
