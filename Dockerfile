FROM node:18-alpine
ENV PORT=3000

WORKDIR app
COPY . .

COPY package.json .
RUN npm install

#Build
FROM base
RUN npm run build

EXPOSE $PORT
CMD npm run start