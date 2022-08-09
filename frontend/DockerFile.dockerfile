FROM node:12-alpine
WORKDIR /frontend
COPY public ./public
COPY src ./src
COPY package.json ./
COPY rollup.config.js ./
RUN npm i

EXPOSE 3000
CMD ["npm", "run", "dev"]
