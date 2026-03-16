class ScheduleGenerator
  def self.generate(user)
    new(user).generate
  end

  def initialize(user)
    @user = user
    @config = user.user_config || UserConfig.new(
      available_days: %w[mon tue wed thu fri],
      schedule_strategy: 'sm2'
    )
    @week_start = Date.today.beginning_of_week(:monday)
    @week_end   = @week_start + 6.days
    @goal = user.weekly_goals.find_by(week_start: @week_start)
  end

  def generate
    available_dates = build_available_dates
    return [] if available_dates.empty?

    topics = select_topics
    return [] if topics.empty?

    minutes_per_day = calculate_minutes_per_day(available_dates.count)

    sessions = []
    ActiveRecord::Base.transaction do
      remove_existing_auto_sessions
      topics.each_with_index do |topic, i|
        date = available_dates[i % available_dates.count]
        session = StudySession.create!(
          topic:            topic,
          scheduled_date:   date,
          expected_minutes: minutes_per_day,
          auto_generated:   true
        )
        sessions << session
      end
    end

    sessions
  end

  private

  def build_available_dates
    (@week_start..@week_end).select do |date|
      day_key = Date::DAYNAMES[date.wday].downcase.first(3)
      @config.available_days.include?(day_key)
    end
  end

  def calculate_minutes_per_day(days_count)
    target_hours = @goal&.target_hours || (2.0 * days_count)
    total_minutes = (target_hours * 60).round
    (total_minutes / days_count).clamp(15, 240)
  end

  def select_topics
    case @config.schedule_strategy
    when 'sm2'         then sm2_topics
    when 'weak_points' then weak_points_topics
    else                    balanced_topics
    end
  end

  def sm2_topics
    Topic.joins(subject: :user)
         .where(users: { id: @user.id })
         .where('next_review <= ?', @week_end)
         .order(:next_review)
  end

  def weak_points_topics
    Topic.joins(subject: :user)
         .where(users: { id: @user.id })
         .joins(<<-SQL.squish)
           LEFT JOIN (
             SELECT topic_id,
               CASE WHEN SUM(questions_done) > 0
                 THEN SUM(questions_correct)::float / SUM(questions_done)
                 ELSE NULL END AS accuracy
             FROM study_sessions
             WHERE status = 'completed'
             GROUP BY topic_id
           ) topic_stats ON topic_stats.topic_id = topics.id
         SQL
         .order('topic_stats.accuracy ASC NULLS FIRST')
  end

  def balanced_topics
    topics_by_subject = @user.subjects.includes(:topics).flat_map do |subject|
      subject.topics.to_a
    end.group_by(&:subject_id)

    result = []
    max_per_subject = topics_by_subject.values.map(&:length).max || 0
    max_per_subject.times do |i|
      topics_by_subject.each_value do |topics|
        result << topics[i] if topics[i]
      end
    end
    result
  end

  def remove_existing_auto_sessions
    StudySession.joins(topic: :subject)
                .where(
                  subjects: { user_id: @user.id },
                  auto_generated: true,
                  status: 'scheduled',
                  scheduled_date: @week_start..@week_end
                )
                .destroy_all
  end
end
