FROM alpine

RUN apk update && apk upgrade
RUN apk add --virtual build alpine-sdk portaudio-dev perl
RUN apk add libsndfile sox

RUN cd /tmp && \
 git clone https://github.com/julius-speech/julius.git --depth 1 && \
 cd julius && \
 ./configure --enable-words-int && make && make install

RUN apk add ruby ruby-dev ruby-io-console ruby-json openssl-dev
RUN gem install --no-rdoc --no-ri bundler

WORKDIR /app

COPY . ./
RUN bundle install

RUN apk del build

EXPOSE 443
CMD ["bundle", "exec", "thin", "--ssl", "--port", "443", "start"]
