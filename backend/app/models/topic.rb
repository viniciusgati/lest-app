class Topic < ApplicationRecord
  belongs_to :subject

  validates :name, presence: true, length: { maximum: 100 }

  before_create :set_next_review

  private

  def set_next_review
    self.next_review ||= Date.today
  end
end
