#!/bin/sh
./external/sox-14.4.2/sox -q -V1 "$1" -b 16 -r 16k -c 1 -t .wav - | ./external/julius-bin/bin/julius.dSYM -C ../../charm.jconf
