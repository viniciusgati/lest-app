require 'rails_helper'

RSpec.describe 'Api::V1::Subjects', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }

  describe 'GET /api/v1/subjects' do
    it 'retorna matérias do usuário autenticado' do
      create_list(:subject, 3, user: user)
      get '/api/v1/subjects', headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(3)
    end

    it 'não retorna matérias de outro usuário' do
      create(:subject)
      get '/api/v1/subjects', headers: headers
      expect(JSON.parse(response.body).length).to eq(0)
    end

    it 'retorna 401 sem token' do
      get '/api/v1/subjects'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/subjects' do
    it 'cria matéria vinculada ao usuário' do
      post '/api/v1/subjects',
           params: { subject: { name: 'Matemática' } },
           headers: headers, as: :json
      expect(response).to have_http_status(:created)
      expect(json_response[:name]).to eq('Matemática')
    end

    it 'retorna 422 sem name' do
      post '/api/v1/subjects',
           params: { subject: { name: '' } },
           headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'retorna 401 sem token' do
      post '/api/v1/subjects', params: { subject: { name: 'Física' } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/subjects/:id' do
    let(:subject) { create(:subject, user: user) }

    it 'atualiza nome da matéria' do
      put "/api/v1/subjects/#{subject.id}",
          params: { subject: { name: 'Física Quântica' } },
          headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(json_response[:name]).to eq('Física Quântica')
    end

    it 'retorna 404 para matéria de outro usuário' do
      other_subject = create(:subject)
      put "/api/v1/subjects/#{other_subject.id}",
          params: { subject: { name: 'Novo' } },
          headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'DELETE /api/v1/subjects/:id' do
    it 'remove matéria do usuário' do
      subject = create(:subject, user: user)
      delete "/api/v1/subjects/#{subject.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(Subject.find_by(id: subject.id)).to be_nil
    end

    it 'retorna 404 para matéria de outro usuário' do
      other_subject = create(:subject)
      delete "/api/v1/subjects/#{other_subject.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it 'remove temas em cascata' do
      subject = create(:subject, user: user)
      topic = create(:topic, subject: subject)
      delete "/api/v1/subjects/#{subject.id}", headers: headers
      expect(Topic.find_by(id: topic.id)).to be_nil
    end
  end
end
