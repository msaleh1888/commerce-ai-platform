FROM node:24-alpine

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/web

RUN chown -R node:node /app
USER node

COPY --chown=node:node apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

COPY --chown=node:node apps/web ./

EXPOSE 3000
