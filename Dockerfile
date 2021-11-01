FROM node:14-buster

WORKDIR /usr/src/app

COPY src /usr/src/app/src
COPY package.json package.json
COPY package-lock.json package-lock.json
COPY knexfile.js knexfile.js
COPY migrations /usr/src/app/migrations
COPY seeds /usr/src/app/seeds

RUN npm ci --production

EXPOSE 3000

CMD ["node", "app.js"]
