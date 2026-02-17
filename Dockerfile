#Stage 1: Builder
FROM node:20.13.1 AS builder

WORKDIR /app


# Copy only package files first for better caching
COPY package*.json ./

# Install all dependencies (including dev for TypeScript build)
RUN npm install
# Clean npm cache and install deps
#ENV npm_config_cache=/tmp/.npm
#RUN npm cache clean --force && npm install

# Copy the rest of the app
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Runner
FROM node:20.13.1-alpine AS runner

# Create app directory
WORKDIR /home/node/app

# Copy only production files from builder
COPY --chown=node:node --from=builder /app/build ./
COPY --chown=node:node --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev 

USER node

# Expose the app port
EXPOSE 8021

# Run the app
CMD ["npm", "run", "dev","start:dev","start:prod"]
