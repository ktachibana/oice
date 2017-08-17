mkdir external
cd external

if [ ! -e julius ]; then
  git clone https://github.com/julius-speech/julius.git --depth 1
  cd julius
  ./configure --enable-words-int && make

  cd gramtools/yomi2voca
  iconv -f euc-jp -t utf-8 yomi2voca.pl > _ && mv _ yomi2voca.pl
  chmod +x yomi2voca.pl
  cd ../..

  make install
fi
