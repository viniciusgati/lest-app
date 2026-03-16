require 'rails_helper'

RSpec.describe 'Api::V1::Schedule', type: :request do
  let(:user)           { create(:user) }
  let(:headers)        { auth_headers_for(user) }
  let(:subject_record) { create(:subject, user: user) }
  let(:week_start)     { Date.today.beginning_of_week(:monday) }

  before do
    create(:user_config, user: user,
           available_days: %w[mon tue wed thu fri],
           schedule_strategy: 'sm2')
    create(:weekly_goal, user: user,
           week_start: week_start,
           target_hours: 10.0)
  end

  describe 'POST /api/v1/schedule/generate' do
    it 'retorna 401 sem token' do
      post '/api/v1/schedule/generate'
      expect(response).to have_http_status(:unauthorized)
    end

    context 'com topics na semana (sm2)' do
      let!(:topic) { create(:topic, subject: subject_record, next_review: Date.today) }

      it 'retorna 201 com sessões criadas' do
        post '/api/v1/schedule/generate', headers: headers
        expect(response).to have_http_status(:created)
      end

      it 'retorna lista de sessões geradas' do
        post '/api/v1/schedule/generate', headers: headers
        body = JSON.parse(response.body)
        expect(body).to be_an(Array)
        expect(body.length).to be >= 1
      end

      it 'sessões têm campos esperados' do
        post '/api/v1/schedule/generate', headers: headers
        body = JSON.parse(response.body)
        session = body.first
        expect(session).to include('id', 'topic_id', 'scheduled_date', 'expected_minutes',
                                   'status', 'auto_generated')
        expect(session['auto_generated']).to be true
      end

      it 'remove sessões auto_generated existentes antes de gerar' do
        old = create(:study_session,
                     topic: topic,
                     scheduled_date: week_start,
                     auto_generated: true,
                     status: 'scheduled')

        post '/api/v1/schedule/generate', headers: headers
        expect(StudySession.find_by(id: old.id)).to be_nil
      end
    end

    context 'sem topics disponíveis' do
      it 'retorna 201 com lista vazia' do
        post '/api/v1/schedule/generate', headers: headers
        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body).to eq([])
      end
    end

    it 'não acessa sessões de outro usuário' do
      other_user    = create(:user)
      other_subject = create(:subject, user: other_user)
      create(:topic, subject: other_subject, next_review: Date.today)

      post '/api/v1/schedule/generate', headers: headers
      body = JSON.parse(response.body)
      expect(body).to eq([])
    end
  end
end
