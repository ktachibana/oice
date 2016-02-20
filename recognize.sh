#!/bin/sh
sox -q -V1 - -b 16 -r 16k -c 1 -t .wav - | ./julius/julius -C my.jconf
