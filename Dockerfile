FROM node:14-alpine
ENV NPM_CONFIG_LOGLEVEL info
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
VOLUME /usr/src/app/data