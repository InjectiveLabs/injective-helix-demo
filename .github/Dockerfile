FROM node:16 as builder
WORKDIR /src
COPY . .
ARG APP_BASE_URL="https://localhost"
ARG APP_ALCHEMY_KOVAN_KEY
ARG APP_ALCHEMY_GOERLI_KEY
ARG HELIX_FEE_RECIPIENT
ENV APP_BASE_URL=${APP_BASE_URL}
RUN echo "APP_BASE_URL=$APP_BASE_URL" >> .env
RUN echo "APP_NETWORK=local" >> .env
RUN echo "APP_CHAIN_ID=injective-777" >> .env
RUN echo "APP_ETHEREUM_CHAIN_ID=5" >> .env
RUN echo "APP_ALCHEMY_KOVAN_KEY=$APP_ALCHEMY_KOVAN_KEY" >> .env
RUN echo "APP_ALCHEMY_GOERLI_KEY=$APP_ALCHEMY_GOERLI_KEY" >> .env
RUN echo "APP_FEE_RECIPIENT=$HELIX_FEE_RECIPIENT" >> .env
RUN echo "GAS_FREE_DEPOSIT_REBATE_ENABLED=true" >> .env
RUN echo "META_TAGS_ENABLED=true" >> .env
RUN echo "MAINTENANCE_ENABLED=false" >> .env
RUN echo "METRICS_ENABLED=false" >> .env
RUN echo "GEO_IP_RESTRICTIONS_ENABLED=false" >> .env
RUN echo "SHOW_AUCTION_COUNTDOWN=false" >> .env
RUN echo "ORDERBOOK_POLLING_ENABLED=false" >> .env
RUN echo "REFERRALS_ENABLED=false" >> .env

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/src/.yarn YARN_CACHE_FOLDER=/src/.yarn yarn install --frozen-lockfile

COPY .github/vue/chart.vue components/trading-view/chart.vue

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