FROM n8nio/n8n

# 预装 n8n Code Node 需要的 npm 包
# NODE_FUNCTION_ALLOW_EXTERNAL 控制哪些包可被 Code node 调用
RUN npm install -g \
    node-vibrant \
    sharp \
    svgo \
    @vercel/sdk \
    @googlemaps/google-maps-services-js
