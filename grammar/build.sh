#!/bin/sh

./yomi2voca.pl charm.yomi > charm.voca
./mkdfa.pl charm
