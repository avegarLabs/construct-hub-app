# Etapa de construcción
FROM node:20-alpine AS build

WORKDIR /usr/src/app

# 1. Copia solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# 2. Instalación limpia de dependencias (asegura compatibilidad con Linux)
RUN npm ci

# 3. Copiar el resto del proyecto (después de instalar)
COPY . .

# 4. Construir la app Angular
RUN npm run build --configuration=production

# Etapa final - Servidor Nginx
FROM nginx:1.25-alpine

# Copiar artefactos de build a la raíz de Nginx
COPY --from=build /usr/src/app/dist/construct-hub-app /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80


