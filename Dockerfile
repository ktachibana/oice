FROM node:8.4.0

RUN apt-get update && apt-get install -y sox libsndfile1-dev
ADD . /app
WORKDIR /app
RUN npm install --silent && npm run postinstall

CMD npm start
EXPOSE 3000
