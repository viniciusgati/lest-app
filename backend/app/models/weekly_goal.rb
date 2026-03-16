class WeeklyGoal < ApplicationRecord
  belongs_to :user

  validates :week_start, presence: true
  validates :target_hours, numericality: { greater_than_or_equal_to: 0 }
  validates :target_questions, numericality: { greater_than_or_equal_to: 0, only_integer: true }
  validates :target_percentage, numericality: {
    greater_than_or_equal_to: 0,
    less_than_or_equal_to: 100
  }
  validates :week_start, uniqueness: { scope: :user_id }

  before_validation :normalize_week_start

  def self.week_start_for(date = Date.today)
    date.beginning_of_week(:monday)
  end

  private

  def normalize_week_start
    self.week_start = WeeklyGoal.week_start_for(week_start) if week_start.present?
  end
end
