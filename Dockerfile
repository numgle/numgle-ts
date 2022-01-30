FROM node:latest

COPY ["./src", "$HOME/src"]
COPY ["package.json", "yarn.lock", "tsconfig.json", "$HOME/"]

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]