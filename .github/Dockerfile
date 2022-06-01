FROM node:16 as builder
WORKDIR /src
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/src/.yarn YARN_CACHE_FOLDER=/src/.yarn yarn install --frozen-lockfile
COPY . .
ARG APP_BASE_URL="http://localhost:80"
ARG ALCHEMY_ENDPOINT
ENV APP_BASE_URL=${APP_BASE_URL}
RUN echo "APP_BASE_URL=$APP_BASE_URL" >> .env
RUN echo "APP_NETWORK=local" >> .env
RUN echo "CHAIN_ID=42" >> .env
RUN echo "ALCHEMY_ENDPOINT=$ALCHEMY_ENDPOINT" >> .env
RUN yarn build
RUN yarn generate

FROM caddy:latest
WORKDIR /root
RUN apk add nss

# copy generated static files
COPY --from=builder /src/dist/ /root/dist

# copy svg assets that otherwise would point to a broken link
RUN unlink /root/dist/vendor/@injectivelabs/token-metadata
RUN mkdir -p /root/dist/vendor/@injectivelabs/token-metadata
COPY --from=builder /src/node_modules/@injectivelabs/token-metadata/dist/images/* /root/dist/vendor/@injectivelabs/token-metadata/

# copy Caddy config and start serving the website
COPY .github/Caddyfile /root/Caddyfile
CMD caddy run --config /root/Caddyfile