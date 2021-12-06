FROM node:14-buster AS builder

WORKDIR /usr/src/app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci --production
COPY src /usr/src/app/src
COPY db /usr/src/app/db


FROM node:14-buster AS production

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .

EXPOSE 3000


CMD ["node", "app.js"]


FROM node:14-buster as development

# Create app directory
WORKDIR /usr/src/app

RUN npm i -g nodemon

COPY --from=builder /usr/src/app .

COPY start-prod.sh start-prod.sh

EXPOSE 3000

CMD ["node", "app.js"]