Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  get '/health', to: 'health#index'

  # devise_for fora do namespace para manter scope :user (não :api_v1_user)
  scope '/api/v1' do
    devise_for :users,
               path: 'auth',
               path_names: {
                 sign_in: 'login',
                 sign_out: 'logout',
                 registration: 'signup'
               },
               controllers: {
                 sessions: 'api/v1/auth/sessions',
                 registrations: 'api/v1/auth/registrations'
               }

    post '/auth/refresh', to: 'api/v1/auth/refresh_tokens#create'
  end

  namespace :api do
    namespace :v1 do
      resources :subjects do
        resources :topics
      end

      resources :weekly_goals, only: [:index] do
        collection do
          get  :current
          put  :current, action: :update_current
        end
      end

      resource :user_config, only: [:show, :update]

      resources :study_sessions do
        member { put :complete }
      end

      namespace :metrics do
        get :subjects
        get 'subjects/:subject_id/topics', action: :subject_topics
        get :weekly_progress
        get :history
      end

      post 'schedule/generate', to: 'schedule#generate'

      resource :profile, only: %i[show update]
    end
  end

  # Catch-all: delega para Angular (deve ser o ÚLTIMO)
  get '*path',
      to: 'application#fallback_index_html',
      constraints: ->(req) { !req.xhr? && req.format.html? }
end
