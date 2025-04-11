# _plugins/vimeo_tag.rb
# _plugins/vimeo_tag.rb
module Jekyll
    class VimeoTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @vimeo_id = markup.strip
      end
  
      def render(context)
        if @vimeo_id.empty?
          "Error: No Vimeo video ID provided."
        else
          "<div class=\"ratio ratio-16x9\">" \
            "<iframe src=\"https://player.vimeo.com/video/#{@vimeo_id}\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>" \
          "</div>"
        end
      end
    end
  end
  
  Liquid::Template.register_tag('vimeo', Jekyll::VimeoTag)