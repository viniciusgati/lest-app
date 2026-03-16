require 'rails_helper'

RSpec.describe 'Api::V1::UserConfigs', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }

  describe 'GET /api/v1/user_config' do
    it 'retorna config com defaults se não existir' do
      get '/api/v1/user_config', headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['schedule_strategy']).to eq('sm2')
      expect(body['available_days']).to include('mon', 'tue', 'wed', 'thu', 'fri')
    end

    it 'retorna config existente' do
      create(:user_config, user: user, schedule_strategy: 'balanced')
      get '/api/v1/user_config', headers: headers
      body = JSON.parse(response.body)
      expect(body['schedule_strategy']).to eq('balanced')
    end

    it 'cria config apenas uma vez (idempotente)' do
      get '/api/v1/user_config', headers: headers
      get '/api/v1/user_config', headers: headers
      expect(UserConfig.where(user: user).count).to eq(1)
    end

    it 'retorna 401 sem token' do
      get '/api/v1/user_config'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/user_config' do
    it 'atualiza estratégia e dias' do
      put '/api/v1/user_config',
          params: { user_config: { schedule_strategy: 'balanced', available_days: %w[mon wed fri] } },
          headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['schedule_strategy']).to eq('balanced')
      expect(body['available_days']).to eq(%w[mon wed fri])
    end

    it 'rejeita estratégia inválida' do
      put '/api/v1/user_config',
          params: { user_config: { schedule_strategy: 'invalida' } },
          headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors']).to be_present
    end

    it 'rejeita dia inválido' do
      put '/api/v1/user_config',
          params: { user_config: { available_days: %w[mon xxx] } },
          headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'usuários não acessam configs uns dos outros' do
      other_user = create(:user)
      create(:user_config, user: other_user, schedule_strategy: 'weak_points')

      put '/api/v1/user_config',
          params: { user_config: { schedule_strategy: 'balanced' } },
          headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(UserConfig.find_by(user: other_user).schedule_strategy).to eq('weak_points')
    end

    it 'retorna 401 sem token' do
      put '/api/v1/user_config',
          params: { user_config: { schedule_strategy: 'sm2' } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
