class StudySession < ApplicationRecord
  belongs_to :topic

  validates :scheduled_date, presence: true
  validates :expected_minutes, numericality: { greater_than: 0 }
  validates :questions_done, numericality: { greater_than_or_equal_to: 0 }
  validates :questions_correct, numericality: { greater_than_or_equal_to: 0 }
  validates :status, inclusion: { in: %w[scheduled completed] }
  validate :questions_correct_lte_done

  delegate :subject, to: :topic

  def late?
    status == 'scheduled' && scheduled_date < Date.today
  end

  def status_display
    late? ? 'late' : status
  end

  private

  def questions_correct_lte_done
    return unless questions_done && questions_correct
    if questions_correct > questions_done
      errors.add(:questions_correct, 'não pode ser maior que questões feitas')
    end
  end
end
