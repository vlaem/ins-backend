FROM node:18-alpine as build

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install

COPY tsconfig.json ./tsconfig.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY ./src ./src
COPY ./tools ./tools

RUN yarn build

FROM node:18-alpine as production

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install --prod && yarn cache clean

COPY --from=build /app/dist ./dist

EXPOSE 80

CMD ["node", "dist/server.js"]


