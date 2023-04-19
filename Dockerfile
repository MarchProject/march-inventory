FROM node:14.17.5

# RUN apk update && apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing && npm i -g pnpm && pnpm i -g grpc
RUN npm install -g pnpm

WORKDIR /app

# COPY ["package.json", "pnpm-lock.yaml", "./"]
COPY pnpm-lock.yaml .
COPY package.json .

RUN pnpm install

COPY . .
RUN pnpm prisma:gen

CMD [ "pnpm", "start" ]

EXPOSE 3000
