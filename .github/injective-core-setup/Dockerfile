FROM public.ecr.aws/l9h3g6c6/injective-core:prod
RUN apk add jq perl curl
WORKDIR /root/scripts
COPY . .
CMD [ "bash", "-c", "/root/scripts/setup_markets.sh"]