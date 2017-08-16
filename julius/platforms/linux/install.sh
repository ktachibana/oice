mkdir external
cd external

if [ ! -e julius ]; then
  git clone https://github.com/julius-speech/julius.git --depth 1
  pushd julius
  ./configure --enable-words-int && make && make install
  popd
fi
