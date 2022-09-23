FROM node:16 AS builder

WORKDIR /work

COPY package.json package-lock.json ./
RUN npm install

COPY tsconfig.json .
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx AS final

COPY --from=builder /work/build /usr/share/nginx/html/
