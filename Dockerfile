FROM node:10-alpine

# Add OS-level dependencies
RUN apk add --no-cache --virtual build-dependencies python make nginx git g++ && \
    npm install -g grunt-cli

# Switch to regular user
USER node

# Install npm dependencies
COPY --chown=node package.json /app/package.json
WORKDIR /app
RUN npm install

# Build
COPY --chown=node . /app
RUN grunt

# Annotate directory as a Docker volume (used by host, if desired) 
VOLUME ["/app"]

# Serve static assets
CMD ["nginx", "-g", "daemon off;"]
