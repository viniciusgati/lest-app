class Subject < ApplicationRecord
  belongs_to :user
  has_many :topics, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
end
