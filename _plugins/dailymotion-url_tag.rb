# _plugins/dailymotion_url_tag.rb
module Jekyll
    class DailymotionUrlTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @dailymotion_url = markup.strip
      end
  
      def render(context)
        if @dailymotion_url.empty?
          "Error: No Dailymotion URL provided."
        elsif @dailymotion_url.include?("www.dailymotion.com/video/")
          video_id = @dailymotion_url.split('/').last.split('_').first
          "<div class=\"ratio ratio-16x9\">" \
            "<iframe src=\"https://www.dailymotion.com/embed/video/#{video_id}\" allowfullscreen frameborder=\"0\"></iframe>" \
          "</div>"
        else
          "Error: Invalid Dailymotion URL."
        end
      end
    end
  end
  
  Liquid::Template.register_tag('dailymotion_url', Jekyll::DailymotionUrlTag)