# Backend Dockerfile
FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json* backend/npm-shrinkwrap.json* ./backend/ 2>/dev/null || true
RUN cd backend && npm install --omit=dev

# Copy source
COPY backend ./backend
WORKDIR /app/backend

# Generate Prisma client at build time
RUN npx prisma generate

# Entrypoint will handle migrations then start server
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4000
CMD ["/entrypoint.sh"]
