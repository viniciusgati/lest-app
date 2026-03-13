FactoryBot.define do
  factory :topic do
    association :subject
    name { Faker::Educator.course }
    notes { nil }
    ease_factor { 2.5 }
    interval { 1 }
    next_review { Date.today }
  end
end
