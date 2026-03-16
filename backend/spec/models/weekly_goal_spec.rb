require 'rails_helper'

RSpec.describe WeeklyGoal, type: :model do
  describe 'validações' do
    it 'é válido com atributos corretos' do
      goal = build(:weekly_goal)
      expect(goal).to be_valid
    end

    it 'rejeita target_hours negativo' do
      goal = build(:weekly_goal, target_hours: -1)
      expect(goal).not_to be_valid
      expect(goal.errors[:target_hours]).to be_present
    end

    it 'rejeita target_questions negativo' do
      goal = build(:weekly_goal, target_questions: -1)
      expect(goal).not_to be_valid
    end

    it 'rejeita target_percentage > 100' do
      goal = build(:weekly_goal, target_percentage: 101)
      expect(goal).not_to be_valid
    end

    it 'rejeita target_percentage < 0' do
      goal = build(:weekly_goal, target_percentage: -1)
      expect(goal).not_to be_valid
    end

    it 'garante unicidade de week_start por usuário' do
      user = create(:user)
      create(:weekly_goal, user: user, week_start: Date.today.beginning_of_week(:monday))
      dup = build(:weekly_goal, user: user, week_start: Date.today.beginning_of_week(:monday))
      expect(dup).not_to be_valid
    end
  end

  describe '.week_start_for' do
    it 'retorna a segunda-feira da semana' do
      # 2026-03-15 é domingo
      date = Date.new(2026, 3, 15)
      expect(WeeklyGoal.week_start_for(date)).to eq(Date.new(2026, 3, 9))
    end

    it 'retorna a própria segunda-feira se passada' do
      monday = Date.new(2026, 3, 9)
      expect(WeeklyGoal.week_start_for(monday)).to eq(monday)
    end
  end

  describe 'normalização de week_start' do
    it 'normaliza week_start para segunda-feira antes de salvar' do
      user = create(:user)
      # 2026-03-15 é domingo — deve ser normalizado para segunda 09/03
      goal = create(:weekly_goal, user: user, week_start: Date.new(2026, 3, 15))
      expect(goal.week_start).to eq(Date.new(2026, 3, 9))
    end
  end
end
