# STAGE 1: BUILDER
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# STAGE 2: Production - Serve with Nginx
FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .

# SECURITY - REMOVE ROOT USER
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]