module Jekyll
  class ButtonTag < Liquid::Tag
    def initialize(tag_name, markup, tokens)
      super
      @markup = markup.strip
    end

    def render(context)
      parts = @markup.split(',').map(&:strip) # Strip each element in parts

      text = (parts[0] && !parts[0].empty? ? parts[0].gsub(/"/,'') : 'Button')
      url = (parts[1] && !parts[1].empty? ? parts[1].gsub(/"/,'') : '#')
      style = (parts[2] && !parts[2].empty? ? parts[2].gsub(/"/,'') : 'primary')

      "<a href=\"#{url}\" class=\"btn btn-#{style}\">#{text}</a>"
    end
  end

  Liquid::Template.register_tag('btn', Jekyll::ButtonTag)
end