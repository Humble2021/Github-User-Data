FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm update
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
