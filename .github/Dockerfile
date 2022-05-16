FROM node:16 as builder
WORKDIR /src
COPY package.json yarn.lock ./
RUN --mount=type=cache,target=/src/.yarn YARN_CACHE_FOLDER=/src/.yarn yarn install --frozen-lockfile
COPY . .
ARG APP_BASE_URL="http://localhost:80"
ENV APP_BASE_URL=${APP_BASE_URL}
RUN echo "APP_BASE_URL=$APP_BASE_URL" >> .env
RUN yarn build
RUN yarn generate

FROM caddy:latest
#EXPOSE 3000
WORKDIR /root
#ARG APP_NETWORK APP_CHAIN_ID APP_BASE_URL APP_FEE_RECIPIENT APP_GOOGLE_ANALYTICS_KEY APP_GOOGLE_SITE_VERIFICATION_KEY APP_BUGSNAG_KEY APP_COINGECKO_API_KEY APP_ALCHEMY_KEY APP_ALCHEMY_KOVAN_KEY METRICS_ENABLED MAINTENANCE_ENABLED META_TAGS_ENABLED GEO_IP_RESTRICTIONS_ENABLED TRANSFER_RESTRICTIONS_ENABLED SHOW_AUCTION_COUNTDOWN REFERRALS_ENABLED
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
