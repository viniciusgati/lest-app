require 'rails_helper'

RSpec.describe 'Api::V1::StudySessions', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:subject_record) { create(:subject, user: user) }
  let(:topic) { create(:topic, subject: subject_record) }

  describe 'GET /api/v1/study_sessions' do
    it 'retorna sessões do usuário autenticado' do
      create_list(:study_session, 2, topic: topic)
      get '/api/v1/study_sessions', headers: headers
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).length).to eq(2)
    end

    it 'não retorna sessões de outro usuário' do
      create(:study_session)
      get '/api/v1/study_sessions', headers: headers
      expect(JSON.parse(response.body).length).to eq(0)
    end

    it 'filtra por status' do
      create(:study_session, topic: topic, status: 'scheduled')
      create(:study_session, :completed, topic: topic)
      get '/api/v1/study_sessions', params: { status: 'completed' }, headers: headers
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
      expect(body[0]['status']).to eq('completed')
    end

    it 'filtra por date_from' do
      create(:study_session, topic: topic, scheduled_date: 10.days.ago)
      create(:study_session, topic: topic, scheduled_date: Date.today)
      get '/api/v1/study_sessions', params: { date_from: 5.days.ago.to_s }, headers: headers
      expect(JSON.parse(response.body).length).to eq(1)
    end

    it 'retorna status "late" para sessões atrasadas' do
      create(:study_session, :late, topic: topic)
      get '/api/v1/study_sessions', headers: headers
      body = JSON.parse(response.body)
      expect(body[0]['status']).to eq('late')
    end

    it 'filtra por status=late retornando apenas sessões atrasadas' do
      create(:study_session, :late, topic: topic)
      create(:study_session, topic: topic, scheduled_date: Date.today)
      get '/api/v1/study_sessions', params: { status: 'late' }, headers: headers
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
      expect(body[0]['status']).to eq('late')
    end

    it 'filtra por status=scheduled retornando apenas sessões agendadas' do
      create(:study_session, :late, topic: topic)
      create(:study_session, topic: topic, scheduled_date: Date.today)
      get '/api/v1/study_sessions', params: { status: 'scheduled' }, headers: headers
      body = JSON.parse(response.body)
      expect(body.all? { |s| s['status'] == 'scheduled' }).to be true
    end

    it 'retorna 401 sem token' do
      get '/api/v1/study_sessions'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/study_sessions' do
    let(:params) do
      { study_session: { topic_id: topic.id, scheduled_date: Date.tomorrow, expected_minutes: 45 } }
    end

    it 'cria sessão agendada' do
      post '/api/v1/study_sessions', params: params, headers: headers, as: :json
      expect(response).to have_http_status(:created)
      body = JSON.parse(response.body)
      expect(body['status']).to eq('scheduled')
      expect(body['topic_id']).to eq(topic.id)
    end

    it 'rejeita topic de outro usuário' do
      other_topic = create(:topic)
      post '/api/v1/study_sessions',
           params: { study_session: { topic_id: other_topic.id, scheduled_date: Date.tomorrow } },
           headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end

    it 'retorna 401 sem token' do
      post '/api/v1/study_sessions', params: params, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/study_sessions/:id' do
    let(:session) { create(:study_session, topic: topic, expected_minutes: 30) }

    it 'atualiza sessão agendada' do
      put "/api/v1/study_sessions/#{session.id}",
          params: { study_session: { expected_minutes: 60 } },
          headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['expected_minutes']).to eq(60)
    end

    it 'retorna 404 para sessão de outro usuário' do
      other_session = create(:study_session)
      put "/api/v1/study_sessions/#{other_session.id}",
          params: { study_session: { expected_minutes: 60 } },
          headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'DELETE /api/v1/study_sessions/:id' do
    let(:session) { create(:study_session, topic: topic) }

    it 'remove sessão' do
      delete "/api/v1/study_sessions/#{session.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(StudySession.find_by(id: session.id)).to be_nil
    end

    it 'retorna 404 para sessão de outro usuário' do
      other_session = create(:study_session)
      delete "/api/v1/study_sessions/#{other_session.id}", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PUT /api/v1/study_sessions/:id/complete' do
    let(:session) { create(:study_session, topic: topic, expected_minutes: 30) }
    let(:complete_params) do
      { study_session: { actual_minutes: 28, questions_done: 10, questions_correct: 8 } }
    end

    it 'completa a sessão e retorna sessão + próxima' do
      put "/api/v1/study_sessions/#{session.id}/complete",
          params: complete_params, headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['session']['status']).to eq('completed')
      expect(body['next_session']).to be_present
      expect(body['next_session']['auto_generated']).to be true
    end

    it 'atualiza SM-2 do topic' do
      put "/api/v1/study_sessions/#{session.id}/complete",
          params: complete_params, headers: headers, as: :json
      topic.reload
      expect(topic.interval).to eq(6) # primeira sessão boa (80%)
      expect(topic.next_review).to eq(Date.today + 6.days)
    end

    it 'cria próxima sessão automaticamente' do
      session # força criação antes de contar
      expect {
        put "/api/v1/study_sessions/#{session.id}/complete",
            params: complete_params, headers: headers, as: :json
      }.to change(StudySession, :count).by(1)
    end

    it 'rejeita questions_correct > questions_done' do
      put "/api/v1/study_sessions/#{session.id}/complete",
          params: { study_session: { actual_minutes: 20, questions_done: 5, questions_correct: 8 } },
          headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'retorna 404 para sessão de outro usuário' do
      other_session = create(:study_session)
      put "/api/v1/study_sessions/#{other_session.id}/complete",
          params: complete_params, headers: headers, as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
