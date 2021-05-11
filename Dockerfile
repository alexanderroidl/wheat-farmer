FROM node:14 AS development
ENV NODE_ENV=development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i -g yarn
RUN yarn install
COPY . .
EXPOSE 7000
CMD [ "yarn", "dev"]

FROM node:14 AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i -g yarn
RUN yarn install --frozen-lockfile
COPY build .
COPY index.js .
EXPOSE 3000
CMD [ "yarn", "start"]
