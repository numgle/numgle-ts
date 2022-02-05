FROM node:latest

COPY ["./src", "$HOME/src"]
COPY ["package.json", "yarn.lock", "tsconfig.json", "$HOME/"]
COPY . .

RUN yarn install
RUN yarn build

CMD ["yarn", "start"]