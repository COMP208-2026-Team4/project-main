FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 6054

CMD ["npx", "docusaurus", "start", "--port", "6054", "--host", "0.0.0.0"]
