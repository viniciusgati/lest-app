FactoryBot.define do
  factory :user_config do
    association :user
    available_days { %w[mon tue wed thu fri] }
    schedule_strategy { 'sm2' }
  end
end
