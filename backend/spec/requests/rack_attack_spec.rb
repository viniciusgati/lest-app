require 'rails_helper'

RSpec.describe 'Rack::Attack Rate Limiting', type: :request do
  before do
    Rack::Attack.enabled = true
    Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new
    Rack::Attack.reset!
  end

  after do
    Rack::Attack.enabled = false
  end

  describe 'throttle auth/ip' do
    let(:login_params) { { user: { email: 'test@example.com', password: 'wrongpassword' } }.to_json }
    let(:headers) { { 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '1.2.3.4' } }

    it 'permite até 10 requests por minuto' do
      10.times do
        post '/api/v1/auth/login', params: login_params, headers: headers
        expect(response.status).not_to eq(429)
      end
    end

    it 'retorna 429 no 11º request' do
      10.times { post '/api/v1/auth/login', params: login_params, headers: headers }
      post '/api/v1/auth/login', params: login_params, headers: headers
      expect(response.status).to eq(429)
    end

    it 'retorna JSON com mensagem de erro no 429' do
      11.times { post '/api/v1/auth/login', params: login_params, headers: headers }
      body = JSON.parse(response.body)
      expect(body['error']).to match(/Rate limit exceeded/)
    end

    it 'retorna header Retry-After no 429' do
      11.times { post '/api/v1/auth/login', params: login_params, headers: headers }
      expect(response.headers['Retry-After']).to be_present
    end
  end
end
