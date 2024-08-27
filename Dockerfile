# syntax=docker/dockerfile:1

FROM --platform=linux/amd64  node:18-alpine
ENV NODE_ENV=production

EXPOSE 80

WORKDIR /app

RUN npm install -g nodemon

COPY ["package.json", "package-lock.json*", "./"]

COPY ["*.js", "./"]

RUN npm install --production

CMD [ "node", "index.js" ]