FROM node:12-slim


WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile && yarn cache clean

COPY . ./

RUN yarn build

CMD [ "yarn", "start:prod" ]
