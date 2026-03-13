require 'rails_helper'

RSpec.describe 'Api::V1::Topics', type: :request do
  let(:user) { create(:user) }
  let(:subject_record) { create(:subject, user: user) }
  let(:headers) { auth_headers_for(user) }

  describe 'GET /api/v1/subjects/:subject_id/topics' do
    it 'retorna temas da matéria' do
      create_list(:topic, 2, subject: subject_record)
      get "/api/v1/subjects/#{subject_record.id}/topics", headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(2)
    end

    it 'retorna 404 para matéria de outro usuário' do
      other_subject = create(:subject)
      get "/api/v1/subjects/#{other_subject.id}/topics", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it 'retorna 401 sem token' do
      get "/api/v1/subjects/#{subject_record.id}/topics"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/subjects/:subject_id/topics' do
    it 'cria tema com valores SM-2 iniciais' do
      post "/api/v1/subjects/#{subject_record.id}/topics",
           params: { topic: { name: 'Probabilidade' } },
           headers: headers, as: :json
      expect(response).to have_http_status(:created)
      body = json_response
      expect(body[:name]).to eq('Probabilidade')
      expect(body[:ease_factor]).to eq(2.5)
      expect(body[:interval]).to eq(1)
      expect(body[:next_review]).to eq(Date.today.to_s)
    end

    it 'retorna 422 sem name' do
      post "/api/v1/subjects/#{subject_record.id}/topics",
           params: { topic: { name: '' } },
           headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'retorna 404 para matéria de outro usuário' do
      other_subject = create(:subject)
      post "/api/v1/subjects/#{other_subject.id}/topics",
           params: { topic: { name: 'Tema' } },
           headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PUT /api/v1/subjects/:subject_id/topics/:id' do
    let(:topic) { create(:topic, subject: subject_record) }

    it 'atualiza nome e notes do tema' do
      put "/api/v1/subjects/#{subject_record.id}/topics/#{topic.id}",
          params: { topic: { name: 'Novo nome', notes: 'Anotação' } },
          headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(json_response[:name]).to eq('Novo nome')
      expect(json_response[:notes]).to eq('Anotação')
    end

    it 'retorna 404 para tema de outra matéria' do
      other_topic = create(:topic)
      put "/api/v1/subjects/#{subject_record.id}/topics/#{other_topic.id}",
          params: { topic: { name: 'X' } },
          headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'DELETE /api/v1/subjects/:subject_id/topics/:id' do
    it 'remove tema' do
      topic = create(:topic, subject: subject_record)
      delete "/api/v1/subjects/#{subject_record.id}/topics/#{topic.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(Topic.find_by(id: topic.id)).to be_nil
    end

    it 'retorna 404 para tema de outra matéria' do
      other_topic = create(:topic)
      delete "/api/v1/subjects/#{subject_record.id}/topics/#{other_topic.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
