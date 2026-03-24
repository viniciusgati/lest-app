class RefreshToken < ApplicationRecord
  belongs_to :user

  scope :valid, -> { where(revoked_at: nil).where('expires_at > ?', Time.current) }

  def revoke!
    update!(revoked_at: Time.current)
  end

  def self.generate_for(user)
    create!(
      user: user,
      token: SecureRandom.hex(32),
      expires_at: 7.days.from_now
    )
  end
end
