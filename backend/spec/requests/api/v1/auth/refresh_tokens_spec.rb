require 'rails_helper'

RSpec.describe 'Api::V1::Auth::RefreshTokens', type: :request do
  let(:user) { create(:user) }

  describe 'POST /api/v1/auth/refresh' do
    context 'com refresh token válido' do
      let(:refresh_token) { RefreshToken.generate_for(user) }

      it 'retorna 200 com novo access token' do
        post '/api/v1/auth/refresh',
             params: { refresh_token: refresh_token.token },
             as: :json
        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body['token']).to be_present
        expect(body['expires_in']).to eq(86_400)
      end
    end

    context 'com token expirado' do
      let(:refresh_token) { create(:refresh_token, :expired, user: user) }

      it 'retorna 401' do
        post '/api/v1/auth/refresh',
             params: { refresh_token: refresh_token.token },
             as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'com token revogado' do
      let(:refresh_token) { create(:refresh_token, :revoked, user: user) }

      it 'retorna 401' do
        post '/api/v1/auth/refresh',
             params: { refresh_token: refresh_token.token },
             as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'com token inválido' do
      it 'retorna 401' do
        post '/api/v1/auth/refresh',
             params: { refresh_token: 'token_invalido_qualquer' },
             as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'sem refresh token' do
      it 'retorna 401' do
        post '/api/v1/auth/refresh', as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
