FROM node:14-buster

WORKDIR /usr/src/app

COPY src /usr/src/app/build
COPY db /usr/src/app/db
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm ci --production

EXPOSE 3000

CMD ["node", "app.js"]
