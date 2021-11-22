FROM node:lts

WORKDIR /app/pocket-backend

EXPOSE 4000

CMD ["npm", "start"]