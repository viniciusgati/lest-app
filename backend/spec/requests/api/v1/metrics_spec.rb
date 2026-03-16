require 'rails_helper'

RSpec.describe 'Api::V1::Metrics', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:subject_record) { create(:subject, user: user) }
  let(:topic) { create(:topic, subject: subject_record) }

  describe 'GET /api/v1/metrics/subjects' do
    it 'retorna 401 sem token' do
      get '/api/v1/metrics/subjects'
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna lista de matérias com accuracy_percentage' do
      create(:study_session, :completed, topic: topic,
             questions_done: 10, questions_correct: 8)
      get '/api/v1/metrics/subjects', headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
      expect(body[0]['id']).to eq(subject_record.id)
      expect(body[0]['accuracy_percentage']).to eq(80.0)
      expect(body[0]['sessions_count']).to eq(1)
    end

    it 'retorna accuracy_percentage null para matéria sem sessões completadas' do
      subject_record # cria a matéria sem sessões
      get '/api/v1/metrics/subjects', headers: headers
      body = JSON.parse(response.body)
      expect(body[0]['accuracy_percentage']).to be_nil
      expect(body[0]['sessions_count']).to eq(0)
    end

    it 'ignora sessões agendadas (não completadas)' do
      create(:study_session, topic: topic, status: 'scheduled')
      get '/api/v1/metrics/subjects', headers: headers
      body = JSON.parse(response.body)
      expect(body[0]['accuracy_percentage']).to be_nil
    end

    it 'agrega múltiplas sessões completadas corretamente' do
      create(:study_session, :completed, topic: topic,
             questions_done: 10, questions_correct: 6)
      create(:study_session, :completed, topic: topic,
             questions_done: 10, questions_correct: 4)
      get '/api/v1/metrics/subjects', headers: headers
      body = JSON.parse(response.body)
      # (6+4)/(10+10) = 50%
      expect(body[0]['accuracy_percentage']).to eq(50.0)
      expect(body[0]['sessions_count']).to eq(2)
    end

    it 'não retorna métricas de outro usuário' do
      other_topic = create(:topic)
      create(:study_session, :completed, topic: other_topic)
      get '/api/v1/metrics/subjects', headers: headers
      body = JSON.parse(response.body)
      expect(body).to be_empty
    end
  end

  describe 'GET /api/v1/metrics/subjects/:subject_id/topics' do
    it 'retorna 401 sem token' do
      get "/api/v1/metrics/subjects/#{subject_record.id}/topics"
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna temas com accuracy_percentage e recent_sessions' do
      create(:study_session, :completed, topic: topic,
             questions_done: 10, questions_correct: 7)
      get "/api/v1/metrics/subjects/#{subject_record.id}/topics", headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.length).to eq(1)
      expect(body[0]['id']).to eq(topic.id)
      expect(body[0]['accuracy_percentage']).to eq(70.0)
      expect(body[0]['recent_sessions'].length).to eq(1)
    end

    it 'inclui dados SM-2 do tema' do
      topic # força criação do tema
      get "/api/v1/metrics/subjects/#{subject_record.id}/topics", headers: headers
      body = JSON.parse(response.body)
      expect(body[0]).to have_key('ease_factor')
      expect(body[0]).to have_key('interval')
      expect(body[0]).to have_key('next_review')
    end

    it 'limita recent_sessions a 10' do
      12.times do |i|
        create(:study_session, :completed, topic: topic,
               scheduled_date: Date.today - i.days)
      end
      get "/api/v1/metrics/subjects/#{subject_record.id}/topics", headers: headers
      body = JSON.parse(response.body)
      expect(body[0]['recent_sessions'].length).to eq(10)
    end

    it 'retorna 404 para subject de outro usuário' do
      other_subject = create(:subject)
      get "/api/v1/metrics/subjects/#{other_subject.id}/topics", headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it 'retorna accuracy_percentage null para tema sem sessões' do
      topic # cria tema sem sessões
      get "/api/v1/metrics/subjects/#{subject_record.id}/topics", headers: headers
      body = JSON.parse(response.body)
      expect(body[0]['accuracy_percentage']).to be_nil
    end

    it 'inclui accuracy por sessão no recent_sessions' do
      create(:study_session, :completed, topic: topic,
             questions_done: 10, questions_correct: 8)
      get "/api/v1/metrics/subjects/#{subject_record.id}/topics", headers: headers
      body = JSON.parse(response.body)
      session_summary = body[0]['recent_sessions'][0]
      expect(session_summary['accuracy']).to eq(80.0)
    end
  end

  describe 'GET /api/v1/metrics/weekly_progress' do
    let(:week_start) { Date.today.beginning_of_week(:monday) }

    it 'retorna 401 sem token' do
      get '/api/v1/metrics/weekly_progress'
      expect(response).to have_http_status(:unauthorized)
    end

    it 'retorna zeros quando não há sessões na semana' do
      get '/api/v1/metrics/weekly_progress', headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['actual_hours']).to eq(0.0)
      expect(body['actual_questions']).to eq(0)
      expect(body['actual_percentage']).to be_nil
    end

    it 'calcula actual_hours corretamente' do
      create(:study_session, :completed, topic: topic,
             scheduled_date: week_start, actual_minutes: 90)
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['actual_hours']).to eq(1.5)
    end

    it 'calcula actual_questions corretamente' do
      create(:study_session, :completed, topic: topic,
             scheduled_date: week_start, questions_done: 20)
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['actual_questions']).to eq(20)
    end

    it 'calcula actual_percentage corretamente' do
      create(:study_session, :completed, topic: topic,
             scheduled_date: week_start,
             questions_done: 10, questions_correct: 7)
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['actual_percentage']).to eq(70.0)
    end

    it 'ignora sessões fora da semana' do
      create(:study_session, :completed, topic: topic,
             scheduled_date: week_start - 7.days, actual_minutes: 60)
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['actual_hours']).to eq(0.0)
    end

    it 'ignora sessões não completadas da semana' do
      create(:study_session, topic: topic,
             scheduled_date: week_start, status: 'scheduled')
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['actual_questions']).to eq(0)
    end

    it 'inclui metas da semana atual quando existem' do
      create(:weekly_goal, user: user,
             week_start: week_start,
             target_hours: 10.0, target_questions: 50, target_percentage: 75.0)
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['target_hours']).to eq(10.0)
      expect(body['target_questions']).to eq(50)
      expect(body['target_percentage']).to eq(75.0)
    end

    it 'retorna target zeros quando não há meta definida' do
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['target_hours']).to eq(0)
      expect(body['target_questions']).to eq(0)
    end

    it 'retorna week_start da semana atual' do
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['week_start']).to eq(week_start.to_s)
    end

    it 'agrega múltiplas sessões na semana' do
      create(:study_session, :completed, topic: topic,
             scheduled_date: week_start, actual_minutes: 60, questions_done: 10, questions_correct: 8)
      create(:study_session, :completed, topic: topic,
             scheduled_date: week_start + 1.day, actual_minutes: 30, questions_done: 5, questions_correct: 3)
      get '/api/v1/metrics/weekly_progress', headers: headers
      body = JSON.parse(response.body)
      expect(body['actual_hours']).to eq(1.5)
      expect(body['actual_questions']).to eq(15)
    end
  end
end
