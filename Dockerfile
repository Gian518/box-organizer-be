## Base
FROM node:alpine AS base
RUN npm install pm2 -g
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

## Dependencies
FROM base AS dependencies
COPY --chown=node:node ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile
COPY --chown=node:node . .

## Build
FROM dependencies AS build
RUN node ace build --production

## Production
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DOMAIN=yourdomain.com
COPY --chown=node:node ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "pm2-runtime", "server.js" ]