FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S crafty -u 1001
RUN chown -R crafty:nodejs /app
USER crafty

# Start the bot - changez "server.js" par votre fichier principal si différent
CMD ["node", "server.js"]