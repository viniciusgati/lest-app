FactoryBot.define do
  factory :study_session do
    association :topic
    scheduled_date { Date.today }
    expected_minutes { 30 }
    actual_minutes { nil }
    questions_done { 0 }
    questions_correct { 0 }
    status { 'scheduled' }
    auto_generated { false }

    trait :completed do
      status { 'completed' }
      actual_minutes { 25 }
      questions_done { 10 }
      questions_correct { 8 }
    end

    trait :late do
      scheduled_date { 3.days.ago }
    end
  end
end
