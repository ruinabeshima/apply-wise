# Build stage

FROM node:20-alpine AS builder

WORKDIR /app 

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install 

COPY . .

ARG VITE_SERVER_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
RUN echo "VITE_SERVER_URL=$VITE_SERVER_URL" > .env
RUN echo "VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY" >> .env

RUN pnpm run build 

# Production Stage

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Changes Nginx to listen on port 8080
RUN sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

