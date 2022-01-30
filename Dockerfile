FROM node:latest

COPY ["./src", "$HOME/src"]
COPY ["package.json", "yarn.lock", "tsconfig.json", "$HOME/"]
RUN yarn install
RUN yarn build
RUN yarn start