module Jekyll
  class ButtonTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      parts = @markup.split(',')

      puts "Markup: #{@markup.inspect}"  # Log the original markup
      puts "Parts: #{parts.inspect}"    # Log the parts array

      text = (parts[0] && parts[0].strip.gsub(/"/,'')) || 'Button'
      url = (parts[1] && parts[1].strip.gsub(/"/,'')) || '#'
      style = (parts[2] && parts[2] && parts[2].strip.gsub(/"/,'')) || 'primary' # Added extra check


      "<a href=\"#{url}\" class=\"btn btn-#{style}\">#{text}</a>"
    end
  end

  Liquid::Template.register_tag('button', Jekyll::ButtonTag)
end