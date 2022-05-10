FROM golang:1.17.3-alpine as builder
RUN apk add --no-cache git gcc make libc-dev linux-headers
RUN set -eux; apk add --no-cache ca-certificates build-base

ARG ACCESS_TOKEN
ARG ACCESS_USER

ENV ACCESS_TOKEN=$ACCESS_TOKEN
ENV ACCESS_USER=$ACCESS_USER

RUN echo ${ACCESS_TOKEN}
RUN echo ${ACCESS_USER}

WORKDIR /root
RUN git clone https://${ACCESS_USER}:${ACCESS_TOKEN}@github.com/InjectiveLabs/injective-trading-bot.git
WORKDIR /root/injective-trading-bot
RUN echo "oh no"
RUN git pull
RUN git checkout bartek_debug
RUN go mod download
RUN make install


FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /go/bin/* /usr/local/bin/
WORKDIR /root

CMD injective-trading-bot start

