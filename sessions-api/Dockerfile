FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 6023

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npx tsx watch src/app.ts"]
