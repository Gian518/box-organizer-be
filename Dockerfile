## Base - Get the repo
FROM node:alpine AS base
RUN apk add --no-cache git
RUN apk add --no-cache openssh
RUN apk add --no-cache dumb-init
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
RUN git clone https://github.com/Gian518/box-organizer-be.git .
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
COPY --chown=node:node ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE $PORT
CMD [ "dumb-init", "node", "server.js" ]