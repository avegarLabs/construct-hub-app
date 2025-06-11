FROM node:20-bullseye AS build
WORKDIR /usr/src/app

# Copiar dependencias
COPY package*.json ./

RUN npm ci --prefer-offline --no-audit

# Copiar resto del proyecto
COPY . .

# Compilar app Angular
RUN npm run build --configuration=production

# Etapa final
FROM nginx:1.25-alpine
COPY --from=build /usr/src/app/dist/construct-hub-app /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

