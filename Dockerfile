FROM node:14 AS base
WORKDIR /usr/src/app

FROM base AS development
ENV NODE_ENV=development
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install
COPY ./ ./
EXPOSE 7000
EXPOSE 3000
EXPOSE 3001
CMD [ "yarn", "develop"]

FROM base AS production
ENV NODE_ENV=production
COPY ./package.json ./
COPY ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY ./build ./build
COPY ./.env ./
COPY ./index.js ./
EXPOSE 3000
CMD [ "yarn", "start"]