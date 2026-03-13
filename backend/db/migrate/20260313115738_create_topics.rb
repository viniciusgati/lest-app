class CreateTopics < ActiveRecord::Migration[7.1]
  def change
    create_table :topics do |t|
      t.references :subject, null: false, foreign_key: true
      t.string :name, null: false, limit: 100
      t.text :notes
      t.float :ease_factor, null: false, default: 2.5
      t.integer :interval, null: false, default: 1
      t.date :next_review, null: false

      t.timestamps
    end
  end
end
