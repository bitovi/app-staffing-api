FROM node:14-buster

WORKDIR /usr/src/app

COPY src /usr/src/app/src
COPY db /usr/src/app/db
COPY package.json package.json
COPY package-lock.json package-lock.json

# TODO: dev only target
COPY start-dev.sh start-dev.sh

RUN npm ci --production

EXPOSE 3000

CMD ["node", "app.js"]
