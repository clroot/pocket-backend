FROM node:lts

WORKDIR /app/pocket-backend

COPY package*.json ./
RUN npm install

EXPOSE 4000

COPY . .

CMD ["npm", "start"]