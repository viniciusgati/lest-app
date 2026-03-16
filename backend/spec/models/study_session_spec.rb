require 'rails_helper'

RSpec.describe StudySession, type: :model do
  describe 'validações' do
    it 'é válido com atributos corretos' do
      session = build(:study_session)
      expect(session).to be_valid
    end

    it 'rejeita sem scheduled_date' do
      session = build(:study_session, scheduled_date: nil)
      expect(session).not_to be_valid
    end

    it 'rejeita expected_minutes <= 0' do
      session = build(:study_session, expected_minutes: 0)
      expect(session).not_to be_valid
    end

    it 'rejeita questions_done negativo' do
      session = build(:study_session, questions_done: -1)
      expect(session).not_to be_valid
    end

    it 'rejeita questions_correct maior que questions_done' do
      session = build(:study_session, questions_done: 5, questions_correct: 6)
      expect(session).not_to be_valid
      expect(session.errors[:questions_correct]).to be_present
    end

    it 'aceita questions_correct igual a questions_done' do
      session = build(:study_session, questions_done: 5, questions_correct: 5)
      expect(session).to be_valid
    end

    it 'rejeita status inválido' do
      session = build(:study_session, status: 'pending')
      expect(session).not_to be_valid
    end
  end

  describe '#late?' do
    it 'retorna true para sessão agendada no passado' do
      session = build(:study_session, :late)
      expect(session.late?).to be true
    end

    it 'retorna false para sessão futura' do
      session = build(:study_session, scheduled_date: Date.tomorrow)
      expect(session.late?).to be false
    end

    it 'retorna false para sessão completada mesmo que atrasada' do
      session = build(:study_session, :completed, scheduled_date: 3.days.ago)
      expect(session.late?).to be false
    end
  end

  describe '#status_display' do
    it 'retorna "late" para sessão agendada atrasada' do
      session = build(:study_session, :late)
      expect(session.status_display).to eq('late')
    end

    it 'retorna "scheduled" para sessão futura' do
      session = build(:study_session, scheduled_date: Date.tomorrow)
      expect(session.status_display).to eq('scheduled')
    end

    it 'retorna "completed" para sessão completada' do
      session = build(:study_session, :completed)
      expect(session.status_display).to eq('completed')
    end
  end
end
