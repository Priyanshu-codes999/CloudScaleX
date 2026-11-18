
# Stage 1: Build React application
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Empty API base URL makes the browser use the same public origin.
ENV VITE_API_BASE_URL=

RUN npm run build

# Stage 2: Serve frontend using Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
