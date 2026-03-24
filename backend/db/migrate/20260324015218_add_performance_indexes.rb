class AddPerformanceIndexes < ActiveRecord::Migration[7.1]
  def change
    add_index :study_sessions, %i[topic_id status scheduled_date],
              name: 'idx_sessions_topic_status_date'
    add_index :study_sessions, %i[status scheduled_date],
              name: 'idx_sessions_status_date'
    add_index :topics, %i[subject_id next_review],
              name: 'idx_topics_subject_next_review'
  end
end
