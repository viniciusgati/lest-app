class UserConfig < ApplicationRecord
  VALID_DAYS = %w[mon tue wed thu fri sat sun].freeze
  VALID_STRATEGIES = %w[sm2 weak_points balanced].freeze

  belongs_to :user

  validates :schedule_strategy, inclusion: { in: VALID_STRATEGIES }
  validate :validate_available_days

  private

  def validate_available_days
    return if available_days.blank?

    invalid = available_days - VALID_DAYS
    errors.add(:available_days, "contém dias inválidos: #{invalid.join(', ')}") if invalid.any?
  end
end
