# Etapa 1: Build Angular app
FROM node:18-bullseye AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

RUN npx ng build --configuration=production

# Etapa 2: Imagen final con Nginx
FROM nginx:1.25-alpine
COPY --from=build /usr/src/app/dist/construct-hub-app/browser /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

