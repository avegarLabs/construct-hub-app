#!/bin/bash

################################################################################
# Construct Hub Frontend - Docker Build Environment Validator
#
# This script validates that all required files for Docker build are present
# and properly configured before attempting to build the Docker image.
#
# Usage: ./validate-build-env.sh
# Exit codes: 0 = success, 1 = validation failed
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0
CHECKS=0

# Print header
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Construct Hub - Docker Build Environment Validator${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Helper functions
print_section() {
    echo ""
    echo -e "${BLUE}▶ $1${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ERRORS=$((ERRORS + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

# Function to check file existence
check_file() {
    local file=$1
    local required=$2
    CHECKS=$((CHECKS + 1))

    if [ -f "$file" ]; then
        print_success "Found: $file"
        return 0
    else
        if [ "$required" = "true" ]; then
            print_error "Missing (REQUIRED): $file"
            return 1
        else
            print_warning "Missing (OPTIONAL): $file"
            return 0
        fi
    fi
}

# Function to check directory existence
check_directory() {
    local dir=$1
    local required=$2
    CHECKS=$((CHECKS + 1))

    if [ -d "$dir" ]; then
        print_success "Found directory: $dir"
        return 0
    else
        if [ "$required" = "true" ]; then
            print_error "Missing directory (REQUIRED): $dir"
            return 1
        else
            print_warning "Missing directory (OPTIONAL): $dir"
            return 0
        fi
    fi
}

# Function to check file NOT in dockerignore
check_not_dockerignored() {
    local file=$1
    CHECKS=$((CHECKS + 1))

    if [ ! -f ".dockerignore" ]; then
        return 0
    fi

    if grep -E "^${file}$" .dockerignore > /dev/null 2>&1; then
        print_error "CRITICAL: .dockerignore excludes $file (MUST NOT BE EXCLUDED)"
        return 1
    else
        print_success ".dockerignore does not exclude $file"
        return 0
    fi
}

print_section "1. Critical Build Files"

# Critical configuration files
check_file "package.json" "true"
check_file "package-lock.json" "true"
check_file "angular.json" "true"
check_file "tsconfig.json" "true"
check_file "tsconfig.app.json" "true"
check_file ".browserslistrc" "false"

# Tailwind CSS configuration (CRITICAL for styles)
check_file "tailwind.config.js" "true"
check_file "postcss.config.js" "true"

print_section "2. Docker Configuration"

# Docker files
check_file "Dockerfile" "true"
check_file ".dockerignore" "true"
check_file "nginx.conf" "true"

print_section "3. Source Code Structure"

# Source directories
check_directory "src" "true"
check_file "src/main.ts" "true"
check_file "src/index.html" "true"
check_directory "public" "false"

# Critical style files (MUST exist for CSS to work)
check_file "src/styles.scss" "true"
check_file "src/tailwind.css" "true"
check_directory "src/assets" "false"

print_section "4. JSON Syntax Validation"

CHECKS=$((CHECKS + 1))
if command -v node &> /dev/null; then
    if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
        print_success "package.json is valid JSON"
    else
        print_error "package.json is invalid JSON"
    fi
else
    print_warning "Node.js not found, skipping JSON validation"
fi

CHECKS=$((CHECKS + 1))
if command -v node &> /dev/null; then
    if node -e "JSON.parse(require('fs').readFileSync('angular.json', 'utf8'))" 2>/dev/null; then
        print_success "angular.json is valid JSON"
    else
        print_error "angular.json is invalid JSON"
    fi
fi

CHECKS=$((CHECKS + 1))
if command -v node &> /dev/null; then
    if node -e "JSON.parse(require('fs').readFileSync('tsconfig.json', 'utf8'))" 2>/dev/null; then
        print_success "tsconfig.json is valid JSON"
    else
        print_error "tsconfig.json is invalid JSON"
    fi
fi

print_section "5. Unwanted Files Check"

CHECKS=$((CHECKS + 1))
if [ -d "node_modules" ]; then
    print_warning "node_modules directory exists (should be in .dockerignore)"
else
    print_success "node_modules not present locally"
fi

CHECKS=$((CHECKS + 1))
if [ -d "dist" ]; then
    print_warning "dist directory exists (should be in .dockerignore)"
else
    print_success "dist not present locally"
fi

CHECKS=$((CHECKS + 1))
if [ -d ".angular" ]; then
    print_warning ".angular cache exists (should be in .dockerignore)"
else
    print_success ".angular cache not present"
fi

print_section "6. .dockerignore Critical Validation"

# Critical files that MUST NOT be excluded
check_not_dockerignored "tsconfig.app.json"
check_not_dockerignored "angular.json"
check_not_dockerignored "tsconfig.json"
check_not_dockerignored "package.json"
check_not_dockerignored "package-lock.json"
check_not_dockerignored "tailwind.config.js"
check_not_dockerignored "postcss.config.js"

print_section "7. Nginx Configuration Validation"

CHECKS=$((CHECKS + 1))
if [ -f "nginx.conf" ]; then
    if grep -q "try_files.*index.html" nginx.conf; then
        print_success "Nginx has Angular SPA routing fallback"
    else
        print_error "Nginx missing 'try_files' directive for Angular routing"
    fi
else
    print_error "nginx.conf not found"
fi

CHECKS=$((CHECKS + 1))
if [ -f "nginx.conf" ]; then
    if grep -q "location /health" nginx.conf; then
        print_success "Nginx has /health endpoint for healthcheck"
    else
        print_warning "Nginx missing /health endpoint (recommended)"
    fi
fi

CHECKS=$((CHECKS + 1))
if [ -f "nginx.conf" ]; then
    if grep -q "location /api/" nginx.conf; then
        print_success "Nginx has /api/ proxy configuration"
    else
        print_warning "Nginx missing /api/ proxy (may be intentional)"
    fi
fi

print_section "8. Environment Check"

CHECKS=$((CHECKS + 1))
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js detected: $NODE_VERSION"

    NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v\([0-9]*\).*/\1/')
    CHECKS=$((CHECKS + 1))
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js version >= 18 (compatible)"
    else
        print_warning "Node.js version < 18 (may have compatibility issues)"
    fi
else
    print_warning "Node.js not found (cannot verify version)"
fi

CHECKS=$((CHECKS + 1))
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    print_success "Docker detected: $DOCKER_VERSION"
else
    print_warning "Docker not found in PATH"
fi

CHECKS=$((CHECKS + 1))
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm detected: $NPM_VERSION"
else
    print_warning "npm not found in PATH"
fi

# Final Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Validation Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Total checks performed: $CHECKS"
echo -e "${RED}Errors: $ERRORS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  ✓ ALL CRITICAL CHECKS PASSED${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}Environment is ready for Docker build.${NC}"
    echo ""
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}Note: There are $WARNINGS warning(s) that should be reviewed.${NC}"
        echo ""
    fi
    echo "Next steps:"
    echo "  1. Build image:    docker build -t construct-hub-frontend:latest ."
    echo "  2. Test locally:   docker run -p 8080:80 construct-hub-frontend:latest"
    echo "  3. Check health:   curl http://localhost:8080/health"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}  ✗ VALIDATION FAILED - $ERRORS ERROR(S) FOUND${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the errors above before building Docker image.${NC}"
    echo ""
    echo "Common solutions:"
    echo "  • Ensure all required files are committed to git"
    echo "  • Check that .dockerignore doesn't exclude critical files"
    echo "  • Run 'npm install' to regenerate package-lock.json"
    echo "  • Validate JSON files syntax"
    echo ""
    exit 1
fi
