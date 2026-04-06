FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY start.js ./

RUN addgroup -g 1001 -S relay \
    && adduser -u 1001 -S relay -G relay \
    && mkdir -p /app/data \
    && chown -R relay:relay /app

USER relay

ENV WS_PORT=7777
ENV STORAGE_PATH=/app/data
ENV SWARM_TOPIC=nostrbook

EXPOSE 7777

CMD ["node", "start.js"]
