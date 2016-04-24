mkdir external
cd external

if [ ! -e julius-4.3.1-win32bin.zip ]; then
  wget https://github.com/julius-speech/julius/releases/download/v4.3.1/julius-4.3.1-win32bin.zip
  unzip julius-4.3.1-win32bin.zip
fi

if [ ! -e sox.zip ]; then
  wget https://sourceforge.net/projects/sox/files/sox/14.4.2/sox-14.4.2-win32.zip/download -O sox.zip
  unzip sox.zip
fi
