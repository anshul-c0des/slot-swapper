# Use a lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the server code
COPY . .

# Expose backend port (adjust if needed)
EXPOSE 5000

# Set environment variable (Render usually provides PORT automatically)
ENV NODE_ENV=production

# Start your backend
CMD ["npm", "start"]
