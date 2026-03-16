class AddStartTimeToStudySessions < ActiveRecord::Migration[7.1]
  def change
    add_column :study_sessions, :start_time, :time
  end
end
