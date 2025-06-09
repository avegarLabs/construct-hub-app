FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Etapa 2: Servidor Nginx
FROM nginx:1.25-alpine
COPY --from=builder /usr/src/app/dist/construct-hub-appt /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80


