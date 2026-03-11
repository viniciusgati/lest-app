module RequestHelpers
  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end

  def auth_headers_for(user, password: 'password123')
    post '/api/v1/auth/login',
         params: { user: { email: user.email, password: password } },
         as: :json
    token = response.headers['Authorization']
    { 'Authorization' => token }
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
  config.include FactoryBot::Syntax::Methods
end
