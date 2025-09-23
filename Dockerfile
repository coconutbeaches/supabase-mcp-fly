# syntax=docker/dockerfile:1

# Small and predictable
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install only what we need to run
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Add app code
COPY server.js ./

# Fly will route to this
EXPOSE 3000

# Run the bridge
CMD ["node", "server.js"]