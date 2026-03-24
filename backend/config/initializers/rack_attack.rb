class Rack::Attack
  # Throttle auth endpoints: 10 req/min por IP
  throttle('auth/ip', limit: 10, period: 60) do |req|
    req.ip if req.path.start_with?('/api/v1/auth/') &&
              req.request_method == 'POST'
  end

  # Throttle API geral: 300 req/min por IP
  throttle('api/ip', limit: 300, period: 60) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # Resposta customizada 429
  self.throttled_responder = lambda do |request|
    match_data = request.env['rack.attack.match_data']
    now = Time.now.to_i
    retry_after = match_data[:period] - (now % match_data[:period])

    [
      429,
      {
        'Content-Type' => 'application/json',
        'Retry-After' => retry_after.to_s
      },
      [{ error: "Rate limit exceeded. Try again in #{retry_after} seconds." }.to_json]
    ]
  end
end

Rack::Attack.cache.store = Rails.cache
