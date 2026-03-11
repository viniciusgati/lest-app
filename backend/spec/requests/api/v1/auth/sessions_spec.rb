require 'rails_helper'

RSpec.describe 'Auth Sessions', type: :request do
  let!(:user) { create(:user, email: 'test@example.com', password: 'password123') }

  describe 'POST /api/v1/auth/login' do
    context 'com credenciais válidas' do
      it 'retorna 200 e JWT no header Authorization' do
        post '/api/v1/auth/login',
             params: { user: { email: 'test@example.com', password: 'password123' } },
             as: :json

        expect(response).to have_http_status(:ok)
        expect(response.headers['Authorization']).to be_present
        expect(response.headers['Authorization']).to start_with('Bearer ')
        expect(json_response[:message]).to eq('Login realizado com sucesso.')
        expect(json_response[:user][:email]).to eq('test@example.com')
      end
    end

    context 'com senha incorreta' do
      it 'retorna 401' do
        post '/api/v1/auth/login',
             params: { user: { email: 'test@example.com', password: 'wrongpassword' } },
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'com email inexistente' do
      it 'retorna 401' do
        post '/api/v1/auth/login',
             params: { user: { email: 'nobody@example.com', password: 'password123' } },
             as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/auth/logout' do
    context 'com token válido' do
      it 'faz logout e retorna 200' do
        headers = auth_headers_for(user)

        delete '/api/v1/auth/logout', headers: headers, as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response[:message]).to eq('Logout realizado com sucesso.')
      end
    end

    context 'sem token' do
      it 'retorna 401' do
        delete '/api/v1/auth/logout', as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
