class ApplicationController < ActionController::API
  before_action :set_default_format

  def fallback_index_html
    render file: Rails.root.join('public', 'index.html'), layout: false
  end

  private

  def set_default_format
    request.format = :json
  end
end
