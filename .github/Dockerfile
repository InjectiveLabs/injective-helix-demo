FROM node:16 as builder
WORKDIR /src
COPY . .
ARG VITE_BASE_URL="https://localhost"
ARG VITE_ALCHEMY_KOVAN_KEY
ARG VITE_ALCHEMY_SEPOLIA_KEY
ARG HELIX_FEE_RECIPIENT
ENV VITE_BASE_URL=${VITE_BASE_URL}
RUN echo "VITE_BASE_URL=$VITE_BASE_URL" >> .env
RUN echo "VITE_NETWORK=local" >> .env
RUN echo "VITE_CHAIN_ID=injective-777" >> .env
RUN echo "VITE_ETHEREUM_CHAIN_ID=5" >> .env
RUN echo "VITE_ALCHEMY_KOVAN_KEY=$VITE_ALCHEMY_KOVAN_KEY" >> .env
RUN echo "VITE_ALCHEMY_SEPOLIA_KEY=$VITE_ALCHEMY_SEPOLIA_KEY" >> .env
RUN echo "VITE_FEE_RECIPIENT=$HELIX_FEE_RECIPIENT" >> .env
RUN echo "VITE_MAINTENANCE_ENABLED=false" >> .env
RUN echo "VITE_VPN_CHECKS_ENABLED=false" >> .env
RUN echo "VITE_GEO_IP_RESTRICTIONS_ENABLED=false" >> .env

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/src/.yarn YARN_CACHE_FOLDER=/src/.yarn yarn install --frozen-lockfile

COPY .github/vue/chart.vue components/trading-view/chart.vue

RUN yarn build
RUN yarn generate

FROM caddy:latest
WORKDIR /root
RUN apk add nss

# copy generated static files
COPY --from=builder /src/.output/ /root/dist

# copy svg assets that otherwise would point to a broken link
RUN unlink /root/dist/vendor/@injectivelabs/token-metadata
RUN mkdir -p /root/dist/vendor/@injectivelabs/token-metadata
COPY --from=builder /src/node_modules/@injectivelabs/token-metadata/dist/images/* /root/dist/vendor/@injectivelabs/token-metadata/

# copy Caddy config and start serving the website
COPY .github/Caddyfile /root/Caddyfile
CMD caddy run --config /root/Caddyfile
