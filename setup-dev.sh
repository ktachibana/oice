brew install coreutils
mkdir envtools
cd envtools
git clone https://github.com/julius-speech/julius.git --depth 1
cd julius
./configure --enable-words-int --prefix=`realpath ..` && make && make install
cd ../bin
ln -s julius.dSYM julius
