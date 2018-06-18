FROM node:10-alpine

WORKDIR /app
COPY --chown=node . /app

RUN apk add --no-cache --virtual build-dependencies python make nginx git g++ && \
    npm install -g grunt-cli && \
    chown node:node /app

USER node
RUN npm install && grunt

VOLUME ["/app"]

CMD ["nginx", "-g", "daemon off;"]
