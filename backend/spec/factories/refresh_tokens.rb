FactoryBot.define do
  factory :refresh_token do
    association :user
    token { SecureRandom.hex(32) }
    expires_at { 7.days.from_now }
    revoked_at { nil }

    trait :expired do
      expires_at { 1.day.ago }
    end

    trait :revoked do
      revoked_at { 1.hour.ago }
    end
  end
end
