#!/bin/sh

# TODO: parameterize 'charm'

yomi2voca.pl src/charm/charm.yomi > dist/charm.voca 2>/dev/null # ignore blank line error.
cp src/charm/charm.grammar dist/charm.grammar
cd dist
mkdfa.pl charm
