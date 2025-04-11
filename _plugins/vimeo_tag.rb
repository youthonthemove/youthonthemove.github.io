# _plugins/youtube_tag.rb
module Jekyll
    class YouTubeTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @youtube_id = markup.strip
      end
  
      def render(context)
        if @youtube_id.empty?
          "Error: No YouTube video ID provided."
        else
          "<div class=\"embed-responsive embed-responsive-16by9\">" \
            "<iframe class=\"embed-responsive-item\" src=\"https://www.youtube.com/embed/#{@youtube_id}\" allowfullscreen></iframe>" \
          "</div>"
        end
      end
    end
  end
  
  Liquid::Template.register_tag('youtube', Jekyll::YouTubeTag)