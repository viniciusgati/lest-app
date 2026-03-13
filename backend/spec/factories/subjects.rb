FactoryBot.define do
  factory :subject do
    association :user
    name { Faker::Educator.subject }
  end
end
