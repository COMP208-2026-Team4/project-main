FROM node:22-alpine

WORKDIR /app

# Copy prisma schema first so the postinstall `prisma generate` can run
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 6024

# Regenerate Prisma client (handles schema changes from volume mount),
# deploy any pending migrations, then start the dev server.
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npx tsx watch src/app.ts"]
