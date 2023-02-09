FROM node:18-alpine as development
ENV PORT=3000

WORKDIR app
COPY . .

COPY package.json .
RUN npm install

EXPOSE $PORT
RUN npm run build