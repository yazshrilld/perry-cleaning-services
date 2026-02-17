# nodeTemplate

backend service for nodeTemplate

### to create your controller and model router call the below

npm run mvc -- serviceName

🛠️ Tech Stack

Node.js

TypeScript

Express.js

PM2 (for process management)

npm (package manager)

📦 Installation

Clone the repository

git clone

Navigate into the project root folder

cd

⚙️ Environment Configuration

The project uses environment variables to manage configuration for different
stages (development, staging, production).

Create a .env file in the project root.

Application environment NODE_ENV=staging or production

Additional auth env vars SEED_ADMIN_PASSWORD=your_admin_password
ADMIN_KEY=optional_admin_key

****\*\*\***** Install dependencies run the below command

npm install

⚙️ Build the Project

Before running the application, build the TypeScript source files into
JavaScript:

npm run build

This command uses the TypeScript compiler (tsc) to convert all .ts files in the
src directory into .js files in the dist folder.

▶️ Run the Application

You can run the project in development mode using:

npm run dev

🌱 Seed a super admin user

npm run seed:users

🚀 Run with PM2 for (Production Mode)

For production environments, use PM2 for process management:

pm2 start pm2system.config.js

This will start the app using the configuration defined in the
pm2system.config.js file (e.g., script path, environment variables, instances,
and log settings).

To monitor or manage the process:

pm2 list pm2 logs pm2 restart or pm2 stop or

Useful PM2 Commands:

pm2 list # View all running apps pm2 logs # View logs pm2 stop all # Stop all
apps pm2 restart all # Restart all apps pm2 delete all # Delete all apps pm2
monit # Monitor apps live pm2 save # Save current process list for auto-start on
reboot pm2 startup # Generate startup script for server reboot After configuring
your environment, don’t forget to run: pm2 save # This ensures your apps persist
after a system restart.

## Dockerfile config

# Stage 1: Builder

FROM node:20.13.1 AS builder

WORKDIR /app

# Copy only package files first for better caching

COPY package\*.json ./

# Install all dependencies (including dev for TypeScript build)

RUN npm install

# Clean npm cache and install deps

#ENV npm_config_cache=/tmp/.npm #RUN npm cache clean --force && npm install

# Copy the rest of the app

COPY . .

# Build the TypeScript code

RUN npm run build

# Stage 2: Runner

FROM node:20.13.1-alpine AS runner

# Create app directory

WORKDIR /home/node/app

# Copy only production files from builder

COPY --chown=node:node --from=builder /app/build ./ COPY --chown=node:node
--from=builder /app/package\*.json ./

# Install only production dependencies (optional if needed)

RUN npm install

USER node

# Expose the app port

EXPOSE 8021

# Run the app

CMD ["npm", "run", "dev","start:dev","start:prod"]

📦 Notes: build/ is the default output of tsc. If your dist output is dist/,
update the Dockerfile accordingly.

If your entry file is not dist/index.js, replace it with the correct path (e.g.,
dist/server.js, dist/main.js, dist/app.js, etc.).

You no longer need to run npm cache clean, which would slow builds.

The --omit=dev flag ensures only production dependencies are included in the
final image.

🧪 To Test It:

docker build -t sdk-backend . docker run -p 8021:8021 sdk-backend
