class JwtErrorHandler
  def initialize(app)
    @app = app
  end

  def call(env)
    @app.call(env)
  rescue JWT::DecodeError
    [401, { 'Content-Type' => 'application/json' }, ['{"error":"Token inválido ou expirado."}']]
  end
end

Rails.application.config.middleware.insert_before Warden::Manager, JwtErrorHandler
