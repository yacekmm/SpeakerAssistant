FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Fix file permissions and ensure case sensitivity
RUN chmod -R 755 /app && \
    find /app -type f -exec chmod 644 {} \;

# Add development server configuration
ENV WDS_SOCKET_PORT=0
ENV WDS_SOCKET_HOST=0.0.0.0
ENV CI=false

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "start"] 