FROM node:18-alpine

WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install dependencies
COPY package*.json ./
RUN npm install && \
    npm install react-scripts

# Copy application code
COPY . .

# Fix file permissions
RUN chown -R appuser:appgroup /app && \
    chmod -R 755 /app

# Switch to non-root user
USER appuser

# Add development server configuration
ENV WDS_SOCKET_PORT=0
ENV WDS_SOCKET_HOST=0.0.0.0
ENV CI=false

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "start"] 