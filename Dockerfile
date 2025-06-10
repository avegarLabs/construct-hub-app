# Etapa de construcción - Optimizada
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# 1. Copia solo archivos de dependencias primero (aprovecha caché de Docker)
COPY package.json package-lock.json ./

# 2. Instalación eficiente de dependencias
RUN npm ci --silent

# 3. Copia el resto del código fuente
COPY . .

# 4. Build de Angular con optimizaciones
RUN npm run build --configuration=production

# Etapa final - Servidor Nginx
FROM nginx:1.25-alpine

# 5. Configuración optimizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 6. Copia solo los archivos construidos
COPY --from=build /usr/src/app/dist/construct-hub-app /usr/share/nginx/html

EXPOSE 80


