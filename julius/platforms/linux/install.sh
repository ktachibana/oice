mkdir external
cd external

if [ ! -e julius ]; then
  git clone https://github.com/julius-speech/julius.git --depth 1
  cd julius
  ./configure --enable-words-int && make && make install
fi
