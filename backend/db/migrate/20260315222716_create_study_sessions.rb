class CreateStudySessions < ActiveRecord::Migration[7.1]
  def change
    create_table :study_sessions do |t|
      t.references :topic, null: false, foreign_key: true
      t.date :scheduled_date, null: false
      t.integer :expected_minutes, null: false, default: 30
      t.integer :actual_minutes
      t.integer :questions_done, null: false, default: 0
      t.integer :questions_correct, null: false, default: 0
      t.string :status, null: false, default: 'scheduled'
      t.boolean :auto_generated, null: false, default: false

      t.timestamps
    end

    add_index :study_sessions, [:topic_id, :scheduled_date]
  end
end
