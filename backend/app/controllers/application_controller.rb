class ApplicationController < ActionController::API
  def fallback_index_html
    render file: Rails.root.join('public', 'index.html'), layout: false
  end
end
