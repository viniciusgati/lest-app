class CreateWeeklyGoals < ActiveRecord::Migration[7.1]
  def change
    create_table :weekly_goals do |t|
      t.references :user, null: false, foreign_key: true
      t.date :week_start, null: false
      t.float :target_hours, null: false, default: 0
      t.integer :target_questions, null: false, default: 0
      t.float :target_percentage, null: false, default: 0

      t.timestamps
    end

    add_index :weekly_goals, [:user_id, :week_start], unique: true
  end
end
