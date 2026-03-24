class AddDiscardedAtToSubjectsAndTopics < ActiveRecord::Migration[7.1]
  def change
    add_column :subjects, :discarded_at, :datetime
    add_index  :subjects, :discarded_at

    add_column :topics, :discarded_at, :datetime
    add_index  :topics, :discarded_at
  end
end
