require 'sinatra'

PATTERN = %r|sentence1: <s> (.+) </s>|

post '/' do
  file = params[:file][:tempfile]
  command = "cat #{file.path}|sox -q -V1 - -b 16 -r 16k -c 1 -t .wav - |docker run -i julius"
  str = `#{command}`

  sentence = str[PATTERN, 1] || fail('no sentence:')
  words = sentence.split(/\s+/)
  p words

  results = []
  until words.first == 'slot' || words.empty?
    results << words.shift
    results << "#{words.shift if %w(+ -).include?(words.first)}#{words.shift}"
    p [results, words]
  end
  results = ['', words.last, *results]

  results.join(',')
end
