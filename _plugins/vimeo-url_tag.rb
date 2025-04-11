# _plugins/vimeo_tag.rb
module Jekyll
    class VimeoTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @vimeo_url = markup.strip
      end
  
      def render(context)
        if @vimeo_url.empty?
          "Error: No Vimeo video URL provided."
        elsif @vimeo_url.include?("vimeo.com/")
          video_id = @vimeo_url.split('/').last
          "<div class=\"ratio ratio-16x9\">" \
            "<iframe src=\"https://player.vimeo.com/video/#{video_id}\" webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder=\"0\"></iframe>" \
          "</div>"
        else
          "Error: Invalid Vimeo video URL."
        end
      end
    end
  end
  
  Liquid::Template.register_tag('vimeo_url', Jekyll::VimeoTag)