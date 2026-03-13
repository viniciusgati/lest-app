class CreateSubjects < ActiveRecord::Migration[7.1]
  def change
    create_table :subjects do |t|
      t.references :user, null: false, foreign_key: true
      t.string :name, null: false, limit: 100

      t.timestamps
    end
  end
end
