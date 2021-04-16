#select build layer
FROM node:lts-alpine
RUN apk add --no-cache git
RUN npm install -g http-server
WORKDIR /app

#Copy package json and npm token
COPY package*.json .
COPY .npmrc .

# install packages and build
EXPOSE 3000
RUN yarn
COPY . .
RUN yarn run build
RUN yarn run generate

#default command
CMD yarn run start
