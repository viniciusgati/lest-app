class Sm2Calculator
  MIN_EASE = 1.3

  def self.calculate(topic, questions_done, questions_correct)
    q = quality_score(questions_done, questions_correct)

    ease = topic.ease_factor
    interval = topic.interval

    if q >= 3
      interval = case interval
                 when 1 then 6
                 else (interval * ease).round
                 end
      ease = [ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)), MIN_EASE].max
    else
      interval = 1
    end

    {
      ease_factor: ease.round(2),
      interval: interval,
      next_review: Date.today + interval.days
    }
  end

  def self.quality_score(questions_done, questions_correct)
    return 0 if questions_done.zero?

    pct = (questions_correct.to_f / questions_done * 100).round
    case pct
    when 85..100 then 5
    when 75..84  then 4
    when 60..74  then 3
    when 40..59  then 2
    else              1
    end
  end
end
