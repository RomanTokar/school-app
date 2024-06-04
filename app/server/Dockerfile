FROM node:18-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

CMD [ "node", "dist/main.js" ]
EXPOSE 4000
