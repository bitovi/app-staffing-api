FROM node:14-buster

WORKDIR /usr/src/app

COPY . /usr/src/app
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --production

EXPOSE 3000

CMD ["node", "app.js"]