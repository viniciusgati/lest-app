FactoryBot.define do
  factory :weekly_goal do
    association :user
    week_start { Date.today.beginning_of_week(:monday) }
    target_hours { 10.0 }
    target_questions { 50 }
    target_percentage { 75.0 }
  end
end
