FROM node:14.15.0-alpine AS builder

USER node
COPY --chown=node . /src
WORKDIR /src

RUN npm install               && \
    npm run build:pkg


FROM nginx:1.18.0-alpine

RUN echo "server { listen 80; root /build; location / { autoindex on; } }" > /etc/nginx/conf.d/default.conf
COPY --from=builder /src/build/ /build
