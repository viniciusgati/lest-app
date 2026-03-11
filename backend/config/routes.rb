Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  get '/health', to: 'health#index'

  # API routes virão aqui (namespaced /api/v1)

  # Catch-all: delega para Angular (deve ser o ÚLTIMO)
  get '*path',
      to: 'application#fallback_index_html',
      constraints: ->(req) { !req.xhr? && req.format.html? }
end
