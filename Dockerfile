FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://photo_admin:photo_password@postgres:5432/photo_albums"

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]