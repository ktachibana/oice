require 'sinatra'
require 'json'

PATTERN = %r|sentence1: <s> (.+) </s>|

get '/' do
  File.read('public/index.html')
end

post '/' do
  file = params[:file][:tempfile]
  command = "cat #{file.path}|sox -q -V1 - -b 16 -r 16k -c 1 -t .wav - | julius -C my.jconf"
  str = `#{command}`
  puts str

  sentence = str[PATTERN, 1] || (break 204)
  words = sentence.split(/\s+/)

  skills = []
  until words.first == 'slot' || words.empty?
    skills << {
      route: words.shift,
      point: "#{words.shift if %w(+ -).include?(words.first)}#{words.shift}".to_i
    }
  end
  result = { skills: skills, slot: words.last.to_i }

  content_type :json
  result.to_json
end
