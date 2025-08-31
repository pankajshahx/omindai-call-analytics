# --- Backend Dockerfile ---

# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose API port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
