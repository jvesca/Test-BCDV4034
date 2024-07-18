# Stage 1: Build the React application
FROM node:14 as build

# Set the working directory
WORKDIR /app

# Install dependencies
RUN npm install

# Copy the entire application
COPY . .

# Build the React app
RUN npm run build

# Stage 2: Serve the built React application with Nginx
FROM nginx

# Copy the built app from the build stage to serve it with Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Nginx container listens on port 80 by default
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
