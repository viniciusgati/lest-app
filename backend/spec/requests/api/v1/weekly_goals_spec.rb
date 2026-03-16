require 'rails_helper'

RSpec.describe 'Api::V1::WeeklyGoals', type: :request do
  let(:user) { create(:user) }
  let(:headers) { auth_headers_for(user) }
  let(:current_monday) { Date.today.beginning_of_week(:monday).to_s }

  describe 'GET /api/v1/weekly_goals/current' do
    it 'retorna meta da semana atual (cria com zeros se não existir)' do
      get '/api/v1/weekly_goals/current', headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['week_start']).to eq(current_monday)
      expect(body['target_hours']).to eq(0.0)
    end

    it 'retorna meta existente da semana atual' do
      create(:weekly_goal, user: user, target_hours: 15.0)
      get '/api/v1/weekly_goals/current', headers: headers
      body = JSON.parse(response.body)
      expect(body['target_hours']).to eq(15.0)
    end

    it 'retorna 401 sem token' do
      get '/api/v1/weekly_goals/current'
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PUT /api/v1/weekly_goals/current' do
    let(:params) { { weekly_goal: { target_hours: 10, target_questions: 50, target_percentage: 75 } } }

    it 'cria meta da semana atual' do
      put '/api/v1/weekly_goals/current', params: params, headers: headers, as: :json
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body['target_hours']).to eq(10.0)
      expect(body['target_questions']).to eq(50)
      expect(body['target_percentage']).to eq(75.0)
    end

    it 'atualiza meta existente (upsert)' do
      put '/api/v1/weekly_goals/current', params: params, headers: headers, as: :json
      put '/api/v1/weekly_goals/current',
          params: { weekly_goal: { target_hours: 12 } },
          headers: headers, as: :json
      expect(JSON.parse(response.body)['target_hours']).to eq(12.0)
      expect(WeeklyGoal.where(user: user).count).to eq(1)
    end

    it 'retorna erro com target_percentage > 100' do
      put '/api/v1/weekly_goals/current',
          params: { weekly_goal: { target_percentage: 110 } },
          headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors']).to be_present
    end

    it 'retorna erro com target_hours negativo' do
      put '/api/v1/weekly_goals/current',
          params: { weekly_goal: { target_hours: -5 } },
          headers: headers, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end

    it 'retorna 401 sem token' do
      put '/api/v1/weekly_goals/current', params: params, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/weekly_goals' do
    it 'retorna histórico de metas do usuário ordenado por semana desc' do
      week1 = Date.today.beginning_of_week(:monday) - 7
      week2 = Date.today.beginning_of_week(:monday) - 14
      create(:weekly_goal, user: user, week_start: week1)
      create(:weekly_goal, user: user, week_start: week2)

      get '/api/v1/weekly_goals', headers: headers
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.length).to eq(2)
      expect(body[0]['week_start']).to eq(week1.to_s)
    end

    it 'não retorna metas de outro usuário' do
      create(:weekly_goal)
      get '/api/v1/weekly_goals', headers: headers
      expect(JSON.parse(response.body).length).to eq(0)
    end

    it 'retorna 401 sem token' do
      get '/api/v1/weekly_goals'
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
