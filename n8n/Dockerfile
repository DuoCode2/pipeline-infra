# Pin version to avoid surprise breakage on pull
ARG N8N_VERSION=1.76.1
FROM n8nio/n8n:${N8N_VERSION}

USER root

# Fix sharp platform binaries for this architecture (ARM64 Alpine/musl)
RUN cd /usr/local/lib/node_modules/n8n/node_modules/.pnpm/sharp@0.33.5/node_modules/sharp && \
    npm install --os=linux --libc=musl --cpu=arm64 sharp@0.33.5

# Install additional packages for n8n Code Node (separate layer for caching)
RUN npm install -g --prefer-offline \
    node-vibrant \
    svgo \
    @vercel/sdk \
    @googlemaps/google-maps-services-js && \
    npm cache clean --force

USER node
