FROM node:10-alpine AS builder

# Add OS-level dependencies
RUN apk add --no-cache python make git g++

# Switch to regular user
USER node

# Install npm dependencies
COPY --chown=node package.json /app/package.json
WORKDIR /app
RUN npm install

# Build
COPY --chown=node . /app
RUN $(npm bin)/grunt

# Annotate directory as a Docker volume (used by host, if desired) 
VOLUME ["/app"]

# Build final image to serve static assets
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/products/*.zip .
RUN unzip -o -d . infusion-*.zip
