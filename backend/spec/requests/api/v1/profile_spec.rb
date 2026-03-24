require 'rails_helper'

RSpec.describe 'Api::V1::Profile', type: :request do
  let(:user) { create(:user, name: 'João', password: 'password123', password_confirmation: 'password123') }
  let(:headers) { auth_headers_for(user) }

  describe 'GET /api/v1/profile' do
    it 'retorna dados do usuário autenticado' do
      get '/api/v1/profile', headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['name']).to eq('João')
      expect(body['email']).to eq(user.email)
      expect(body).to have_key('created_at')
      expect(body).not_to have_key('password')
    end

    it 'retorna 401 sem token' do
      get '/api/v1/profile'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/profile' do
    context 'atualização de nome' do
      it 'atualiza o nome com sucesso' do
        put '/api/v1/profile',
            params: { name: 'Maria' },
            headers: headers,
            as: :json
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['name']).to eq('Maria')
        expect(user.reload.name).to eq('Maria')
      end
    end

    context 'atualização de senha' do
      it 'atualiza a senha com current_password correto' do
        put '/api/v1/profile',
            params: {
              current_password: 'password123',
              password: 'newpassword456',
              password_confirmation: 'newpassword456'
            },
            headers: headers,
            as: :json
        expect(response).to have_http_status(:ok)
        expect(user.reload.valid_password?('newpassword456')).to be true
      end

      it 'retorna 422 com current_password incorreto' do
        put '/api/v1/profile',
            params: {
              current_password: 'wrongpassword',
              password: 'newpassword456',
              password_confirmation: 'newpassword456'
            },
            headers: headers,
            as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body).to have_key('errors')
      end
    end

    it 'retorna 401 sem token' do
      put '/api/v1/profile', params: { name: 'Hacker' }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
