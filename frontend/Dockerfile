# stage 1: Build the React app
FROM node:20 AS build

WORKDIR /frontend

COPY package*.json ./

RUN npm install

COPY . .

# Build the React app for production
RUN npm run build

#  Stage 2: Nginx
FROM nginx:alpine

# Copy the production build from Stage 1
COPY --from=build /frontend/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Start NGINX web server
CMD ["nginx", "-g", "daemon off;"]
