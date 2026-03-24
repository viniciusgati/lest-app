module Api
  module V1
    class MetricsController < BaseController
      def subjects
        subjects = current_user.subjects.includes(:topics)

        result = subjects.map do |subject|
          sessions = completed_sessions_for_subject(subject)
          {
            id: subject.id,
            name: subject.name,
            accuracy_percentage: calculate_accuracy(sessions),
            sessions_count: sessions.count
          }
        end

        render json: result
      end

      def subject_topics
        subject = current_user.subjects.find(params[:subject_id])
        topics = subject.topics.includes(:study_sessions)

        result = topics.map do |topic|
          sessions = topic.study_sessions.where(status: 'completed').order(scheduled_date: :desc)
          {
            id: topic.id,
            name: topic.name,
            notes: topic.notes,
            next_review: topic.next_review,
            ease_factor: topic.ease_factor,
            interval: topic.interval,
            accuracy_percentage: calculate_accuracy(sessions),
            sessions_count: sessions.count,
            recent_sessions: sessions.limit(10).map { |s| session_summary(s) }
          }
        end

        render json: result
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Not found' }, status: :not_found
      end

      def history
        weeks = [[( params[:weeks] || 8).to_i, 26].min, 1].max
        since_date = weeks.weeks.ago.beginning_of_week(:monday)

        results = StudySession
          .joins(topic: :subject)
          .where(subjects: { user_id: current_user.id })
          .where(status: 'completed')
          .where('study_sessions.scheduled_date >= ?', since_date)
          .where('study_sessions.questions_done > 0')
          .group(
            "DATE_TRUNC('week', study_sessions.scheduled_date)",
            'subjects.id',
            'subjects.name'
          )
          .select(
            "DATE_TRUNC('week', study_sessions.scheduled_date) AS week_start",
            'subjects.id AS subject_id',
            'subjects.name AS subject_name',
            'SUM(study_sessions.questions_correct)::float / SUM(study_sessions.questions_done) AS accuracy',
            'COUNT(*) AS sessions_count'
          )

        by_subject = results.group_by(&:subject_id)
        render json: {
          subjects: by_subject.map do |_id, rows|
            {
              id: rows.first.subject_id,
              name: rows.first.subject_name,
              weeks: rows.map { |r|
                {
                  week_start: r.week_start.to_date.iso8601,
                  accuracy: r.accuracy.round(4),
                  sessions_count: r.sessions_count.to_i
                }
              }.sort_by { |w| w[:week_start] }
            }
          end
        }
      end

      def streak
        study_dates = StudySession
          .joins(topic: :subject)
          .where(subjects: { user_id: current_user.id })
          .where(status: 'completed')
          .where('questions_done > 0')
          .pluck(Arel.sql('DISTINCT DATE(scheduled_date)'))
          .map(&:to_date)
          .sort
          .reverse

        today = Date.today
        studied_today = study_dates.first == today
        last_study_date = study_dates.first

        current_streak = 0
        check_date = studied_today ? today : today - 1
        study_set = study_dates.to_set

        while study_set.include?(check_date)
          current_streak += 1
          check_date -= 1
        end

        longest = 0
        current = 0
        prev_date = nil

        study_dates.reverse.each do |date|
          if prev_date.nil? || date == prev_date + 1
            current += 1
            longest = [longest, current].max
          else
            current = 1
          end
          prev_date = date
        end

        render json: {
          current_streak: current_streak,
          longest_streak: longest,
          last_study_date: last_study_date&.iso8601,
          studied_today: studied_today
        }
      end

      def weekly_progress
        week_start = Date.today.beginning_of_week(:monday)
        week_end   = week_start + 6.days

        sessions = completed_sessions_in_range(week_start, week_end)
        goal     = current_user.weekly_goals.find_by(week_start: week_start)

        actual_hours      = sessions.sum('actual_minutes').to_f / 60
        actual_questions  = sessions.sum(:questions_done)
        actual_percentage = calculate_accuracy(sessions)

        render json: {
          week_start: week_start,
          actual_hours: actual_hours.round(1),
          actual_questions: actual_questions,
          actual_percentage: actual_percentage,
          target_hours: goal&.target_hours || 0,
          target_questions: goal&.target_questions || 0,
          target_percentage: goal&.target_percentage || 0
        }
      end

      private

      def completed_sessions_for_subject(subject)
        StudySession.joins(topic: :subject)
                    .where(subjects: { id: subject.id }, status: 'completed')
      end

      def completed_sessions_in_range(from, to)
        StudySession.joins(topic: :subject)
                    .where(subjects: { user_id: current_user.id },
                           status: 'completed',
                           scheduled_date: from..to)
      end

      def calculate_accuracy(sessions)
        total_done    = sessions.sum(:questions_done)
        total_correct = sessions.sum(:questions_correct)
        return nil if total_done.zero?
        (total_correct.to_f / total_done * 100).round(1)
      end

      def session_summary(session)
        acc = if session.questions_done > 0
                (session.questions_correct.to_f / session.questions_done * 100).round(1)
              end
        {
          id: session.id,
          scheduled_date: session.scheduled_date,
          questions_done: session.questions_done,
          questions_correct: session.questions_correct,
          accuracy: acc
        }
      end
    end
  end
end
