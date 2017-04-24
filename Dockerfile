FROM node:alpine

STOPSIGNAL SIGINT

ADD ./ /app

RUN cd /app && npm i --registry=https://registry.npm.taobao.org && npm run build && npm i --production --registry=https://registry.npm.taobao.org && rm /root/.npm/* -rf 

CMD cd /app && npm start
