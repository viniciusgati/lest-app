class CreateUserConfigs < ActiveRecord::Migration[7.1]
  def change
    create_table :user_configs do |t|
      t.references :user, null: false, foreign_key: true, index: { unique: true }
      t.string :available_days, array: true, default: %w[mon tue wed thu fri]
      t.string :schedule_strategy, null: false, default: 'sm2'

      t.timestamps
    end
  end
end
