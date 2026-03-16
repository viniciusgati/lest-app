require 'rails_helper'

RSpec.describe ScheduleGenerator, type: :service do
  let(:user)           { create(:user) }
  let(:subject_record) { create(:subject, user: user) }
  let(:week_start) { Date.today.beginning_of_week(:monday) }
  let(:week_end)   { week_start + 6.days }
  let(:topic1)     { create(:topic, subject: subject_record, next_review: week_start) }
  let(:topic2)     { create(:topic, subject: subject_record, next_review: week_start + 2.days) }

  let!(:config) do
    create(:user_config, user: user,
           available_days: %w[mon tue wed thu fri],
           schedule_strategy: 'sm2')
  end

  let!(:goal) do
    create(:weekly_goal, user: user,
           week_start: Date.today.beginning_of_week(:monday),
           target_hours: 10.0)
  end

  describe '.generate' do
    context 'estratégia sm2' do
      it 'retorna array vazio quando não há topics com next_review na semana' do
        # nenhum topic criado
        sessions = ScheduleGenerator.generate(user)
        expect(sessions).to eq([])
      end

      it 'cria sessões apenas para topics com next_review <= fim_da_semana' do
        topic1 # next_review = hoje (dentro da semana)
        topic2 # next_review = hoje + 2 dias (dentro da semana)
        create(:topic, subject: subject_record, next_review: week_end + 1.day) # fora da semana

        sessions = ScheduleGenerator.generate(user)
        expect(sessions.length).to eq(2)
        expect(sessions.map(&:topic_id)).to include(topic1.id, topic2.id)
      end

      it 'ordena por next_review asc' do
        topic1 # next_review = hoje
        topic2 # next_review = hoje + 2 dias

        sessions = ScheduleGenerator.generate(user)
        expect(sessions[0].topic_id).to eq(topic1.id)
        expect(sessions[1].topic_id).to eq(topic2.id)
      end

      it 'distribui sessões nos dias disponíveis' do
        topic1
        topic2

        sessions = ScheduleGenerator.generate(user)
        dates = sessions.map(&:scheduled_date)
        dates.each do |date|
          day_key = Date::DAYNAMES[date.wday].downcase.first(3)
          expect(config.available_days).to include(day_key)
        end
      end

      it 'calcula expected_minutes com base no target_hours' do
        topic1

        sessions = ScheduleGenerator.generate(user)
        available_days_count = (week_start..week_end).count do |date|
          day_key = Date::DAYNAMES[date.wday].downcase.first(3)
          config.available_days.include?(day_key)
        end
        expected_minutes = ((goal.target_hours * 60) / available_days_count).round.clamp(15, 240)
        expect(sessions.first.expected_minutes).to eq(expected_minutes)
      end

      it 'usa 2h/dia como default quando não há WeeklyGoal' do
        goal.destroy
        topic1

        sessions = ScheduleGenerator.generate(user)
        available_days_count = (week_start..week_end).count do |date|
          day_key = Date::DAYNAMES[date.wday].downcase.first(3)
          config.available_days.include?(day_key)
        end
        expected_minutes = ((2.0 * available_days_count * 60) / available_days_count).round.clamp(15, 240)
        expect(sessions.first.expected_minutes).to eq(expected_minutes)
      end
    end

    context 'remoção de sessões auto_generated existentes' do
      it 'remove sessões auto_generated + scheduled da semana antes de gerar' do
        topic1
        old_session = create(:study_session,
                             topic: topic1,
                             scheduled_date: week_start,
                             auto_generated: true,
                             status: 'scheduled')

        ScheduleGenerator.generate(user)
        expect(StudySession.find_by(id: old_session.id)).to be_nil
      end

      it 'NÃO remove sessões completed' do
        topic1
        completed = create(:study_session, :completed,
                           topic: topic1,
                           scheduled_date: week_start,
                           auto_generated: true)

        ScheduleGenerator.generate(user)
        expect(StudySession.find_by(id: completed.id)).not_to be_nil
      end

      it 'NÃO remove sessões manuais (auto_generated: false)' do
        topic1
        manual = create(:study_session,
                        topic: topic1,
                        scheduled_date: week_start,
                        auto_generated: false,
                        status: 'scheduled')

        ScheduleGenerator.generate(user)
        expect(StudySession.find_by(id: manual.id)).not_to be_nil
      end
    end

    context 'estratégia weak_points' do
      before { config.update!(schedule_strategy: 'weak_points') }

      it 'ordena topics com menor accuracy primeiro (nulls first)' do
        topic_no_sessions = create(:topic, subject: subject_record)
        topic_with_sessions = create(:topic, subject: subject_record)
        create(:study_session, :completed, topic: topic_with_sessions,
               questions_done: 10, questions_correct: 8)

        sessions = ScheduleGenerator.generate(user)
        expect(sessions.first.topic_id).to eq(topic_no_sessions.id)
      end

      it 'retorna todos os topics do usuário' do
        topic1
        topic2

        sessions = ScheduleGenerator.generate(user)
        expect(sessions.length).to eq(2)
      end
    end

    context 'estratégia balanced' do
      before { config.update!(schedule_strategy: 'balanced') }

      it 'distribui topics em round-robin por matéria' do
        subject2 = create(:subject, user: user)
        t1 = create(:topic, subject: subject_record)
        t2 = create(:topic, subject: subject2)

        sessions = ScheduleGenerator.generate(user)
        topic_ids = sessions.map(&:topic_id)
        expect(topic_ids).to include(t1.id, t2.id)
      end

      it 'retorna vazio quando não há matérias' do
        sessions = ScheduleGenerator.generate(user)
        expect(sessions).to eq([])
      end
    end

    context 'dias disponíveis' do
      it 'retorna vazio quando available_days está vazio' do
        config.update!(available_days: [])
        topic1

        sessions = ScheduleGenerator.generate(user)
        expect(sessions).to eq([])
      end

      it 'usa available_days padrão (seg–sex) quando não há UserConfig' do
        config.destroy
        topic1
        topic2

        sessions = ScheduleGenerator.generate(user)
        sessions.each do |session|
          day_key = Date::DAYNAMES[session.scheduled_date.wday].downcase.first(3)
          expect(%w[mon tue wed thu fri]).to include(day_key)
        end
      end
    end
  end
end
