FROM n8nio/n8n

USER root

# Fix sharp platform binaries for this architecture (ARM64 Alpine/musl)
RUN cd /usr/local/lib/node_modules/n8n/node_modules/.pnpm/sharp@0.33.5/node_modules/sharp && \
    npm install --os=linux --libc=musl --cpu=arm64 sharp@0.33.5

# Install additional packages for n8n Code Node
RUN npm install -g \
    node-vibrant \
    svgo \
    @vercel/sdk \
    @googlemaps/google-maps-services-js

USER node
