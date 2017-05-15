FROM node:7.9.0-alpine

ENV APPLICATION /usr/lib/lumin
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_ENV production
ENV PORT 3002

WORKDIR $APPLICATION

COPY package.json $APPLICATION/

RUN apk add --no-cache build-base python tzdata libjpeg-turbo-dev libpng-dev ffmpeg
RUN apk add --no-cache --repository http://nl.alpinelinux.org/alpine/v3.5/community graphicsmagick
RUN npm install

COPY data/ $APPLICATION/data/
COPY source/ $APPLICATION/source/
COPY .babelrc $APPLICATION/
COPY googleCloud.secret.json $APPLICATION/

RUN npm run build

EXPOSE $PORT

CMD ["npm", "run", "start"]
