require 'rails_helper'

RSpec.describe 'POST /api/v1/auth/signup', type: :request do
  let(:valid_params) do
    {
      user: {
        name: 'João Silva',
        email: 'joao@example.com',
        password: 'password123',
        password_confirmation: 'password123'
      }
    }
  end

  context 'com dados válidos' do
    it 'cria um usuário e retorna 200' do
      post '/api/v1/auth/signup', params: valid_params, as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response[:message]).to eq('Cadastro realizado com sucesso.')
      expect(json_response[:user][:email]).to eq('joao@example.com')
    end

    it 'não retorna a senha no response' do
      post '/api/v1/auth/signup', params: valid_params, as: :json

      expect(json_response[:user]).not_to have_key(:password)
      expect(json_response[:user]).not_to have_key(:encrypted_password)
    end
  end

  context 'com email já cadastrado' do
    before { create(:user, email: 'joao@example.com') }

    it 'retorna 422 com mensagem de erro' do
      post '/api/v1/auth/signup', params: valid_params, as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response[:message]).to eq('Erro ao criar conta.')
      expect(json_response[:errors]).to be_present
    end
  end

  context 'com senha curta' do
    it 'retorna 422' do
      post '/api/v1/auth/signup',
           params: { user: valid_params[:user].merge(password: '123', password_confirmation: '123') },
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  context 'sem nome' do
    it 'retorna 422' do
      post '/api/v1/auth/signup',
           params: { user: valid_params[:user].merge(name: '') },
           as: :json

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
