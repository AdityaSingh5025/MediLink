

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose ports
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]