# _plugins/dailymotion_tag.rb
module Jekyll
    class DailymotionTag < Liquid::Tag
      def initialize(tag_name, markup, tokens)
        super
        @dailymotion_id = markup.strip
      end
  
      def render(context)
        if @dailymotion_id.empty?
          "Error: No Dailymotion video ID provided."
        else
          "<div class=\"embed-responsive embed-responsive-16by9\">" \
            "<iframe class=\"embed-responsive-item\" src=\"https://www.dailymotion.com/embed/video/#{@dailymotion_id}\" allowfullscreen></iframe>" \
          "</div>"
        end
      end
    end
  end
  
  Liquid::Template.register_tag('dailymotion', Jekyll::DailymotionTag)