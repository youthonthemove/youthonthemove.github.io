module Jekyll
  class ButtonTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      puts "--- Button Tag Render ---"
      puts "Markup: #{@markup.inspect}"

      parts = @markup.split(',')
      puts "Parts: #{parts.inspect}"

      puts "parts[0]: #{parts[0].inspect}"
      puts "parts[1]: #{parts[1].inspect}"
      puts "parts[2]: #{parts[2].inspect}"

      text = (parts[0] && parts[0].strip.gsub(/"/,'')) || 'Button'
      url = (parts[1] && parts[1] && parts[1].strip.gsub(/"/,'')) || '#'
      style = (parts[2] && parts[2] && parts[2].strip.gsub(/"/,'')) || 'primary'

      puts "Text: #{text.inspect}"
      puts "URL: #{url.inspect}"
      puts "Style: #{style.inspect}"

      "<a href=\"#{url}\" class=\"btn btn-#{style}\">#{text}</a>"
    end
  end

  Liquid::Template.register_tag('button', Jekyll::ButtonTag)
end