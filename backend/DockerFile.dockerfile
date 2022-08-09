FROM node:12-alpine
WORKDIR /backend
COPY src ./
COPY database ./database
COPY package.json ./
RUN npm i

EXPOSE 3000
CMD ["npm", "run", "dev"]
