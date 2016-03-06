require 'sinatra'
require 'json'

PATTERN = %r|sentence1: <s> (.+) </s>|

set :public_folder, 'ui'

get '/' do
  File.read('ui/index.html')
end

post '/' do
  file = params[:file][:tempfile]
  command = "./recognize.sh < #{file.path}"
  puts command
  str = `#{command}`
  puts str

  sentence = str[PATTERN, 1] || (break 200)
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

run Sinatra::Application
