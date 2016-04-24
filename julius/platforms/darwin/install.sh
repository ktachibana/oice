brew install coreutils

mkdir external
cd external

if [ ! -e julius ]; then
  git clone https://github.com/julius-speech/julius.git --depth 1
  pushd julius
  ./configure --enable-words-int --prefix=`realpath ../julius-bin` && make && make install
  popd
fi

if [ ! -e sox.zip ]; then
  wget -nc https://sourceforge.net/projects/sox/files/sox/14.4.2/sox-14.4.2-macosx.zip/download -O sox.zip
  unzip -o sox.zip
fi
