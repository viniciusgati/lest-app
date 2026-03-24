class Subject < ApplicationRecord
  include Discard::Model
  default_scope { kept }

  belongs_to :user
  has_many :topics, dependent: :destroy

  validates :name, presence: true, length: { maximum: 100 }
end
