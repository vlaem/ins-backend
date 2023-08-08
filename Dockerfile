FROM node:18-alpine as build

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install

COPY tsconfig.json ./tsconfig.json
COPY ./src ./src
COPY ./open-api ./open-api

RUN yarn build

FROM node:18-alpine as production

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/open-api ./open-api

EXPOSE 3000

CMD ["node", "dist/server.js"]


