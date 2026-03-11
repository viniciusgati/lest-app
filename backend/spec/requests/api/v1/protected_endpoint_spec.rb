require 'rails_helper'

# Spec auxiliar para verificar que endpoints protegidos rejeitam requests sem JWT
# Usa o health controller como referência (não é protegido) e um controller fictício.
# Os testes de autenticação reais são validados via sessions_spec e registrations_spec.

RSpec.describe 'Endpoints protegidos', type: :request do
  let!(:user) { create(:user) }

  describe 'Acesso sem autenticação' do
    it 'GET /health retorna 200 (não protegido)' do
      get '/health'
      expect(response).to have_http_status(:ok)
    end

    it 'DELETE /api/v1/auth/logout sem token retorna 401' do
      delete '/api/v1/auth/logout', as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'Acesso com token válido' do
    it 'DELETE /api/v1/auth/logout com token retorna 200' do
      headers = auth_headers_for(user)
      delete '/api/v1/auth/logout', headers: headers, as: :json
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'Acesso com token inválido' do
    it 'retorna 401' do
      delete '/api/v1/auth/logout',
             headers: { 'Authorization' => 'Bearer token_invalido' },
             as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
