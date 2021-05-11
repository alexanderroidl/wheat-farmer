FROM node:14 AS base
WORKDIR /usr/src/app

FROM base AS development
ENV NODE_ENV=development
RUN yarn install
EXPOSE 7000
EXPOSE 3000
EXPOSE 3001
CMD [ "yarn", "develop"]

FROM base AS production
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile
EXPOSE 3000
CMD [ "yarn", "start"]