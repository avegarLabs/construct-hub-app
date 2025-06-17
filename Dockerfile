FROM node:20-bullseye AS build
WORKDIR /usr/src/app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala TODAS las dependencias, incluyendo devDependencies
# No establezcas NODE_ENV=production aquí
RUN npm install

# Copia el resto de la app
COPY . .

# Compila usando Angular CLI desde node_modules (evita usar global)
RUN npx ng build --configuration=production

# Etapa final: contenedor pequeño y liviano con NGINX
FROM nginx:1.25-alpine

# Copia los archivos compilados de Angular
COPY --from=build /usr/src/app/dist/construct-hub-app /usr/share/nginx/html

# Copia configuración personalizada de NGINX (si la tienes)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80