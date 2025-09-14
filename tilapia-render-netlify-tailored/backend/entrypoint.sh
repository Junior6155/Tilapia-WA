#!/usr/bin/env bash
set -e
echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Starting server..."
node src/index.js
