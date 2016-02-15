FROM ruby:2.3.0
RUN apt-get update && apt-get install -y git wget unzip build-essential zlib1g-dev flex libasound2-dev libesd0-dev libsndfile1-dev sox

RUN wget -P /tmp 'http://iij.dl.sourceforge.jp/julius/60273/julius-4.3.1.tar.gz' && \
	tar zxvf /tmp/julius-4.3.1.tar.gz -C /usr/local && \
	rm -rf /tmp/julius-4.3.1.tar.gz && \
	cd /usr/local/julius-4.3.1 && \
	./configure --enable-words-int && make && make install

RUN cd /usr/local/bin && iconv -f euc-jp -t utf-8 yomi2voca.pl > temp && chmod +x temp && mv temp yomi2voca.pl

WORKDIR oma
RUN git clone --depth 1 https://github.com/julius-speech/grammar-kit.git

ADD Gemfile Gemfile.lock ./
RUN bundle

ADD . ./
RUN yomi2voca.pl my.yomi > my.voca 2> /dev/null && mkdfa.pl my
RUN sh gen-ssl.sh

EXPOSE 443
ENV RUBYOPT "-E UTF-8"
ENTRYPOINT ["bundle", "exec", "thin", "-C", "thin.yml", "start"]
