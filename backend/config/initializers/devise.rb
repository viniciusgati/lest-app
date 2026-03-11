require 'devise/orm/active_record'

Devise.setup do |config|
  # Mailer config (não usado em API mode, mas necessário pelo Devise)
  config.mailer_sender = 'noreply@edutrack.app'

  # API mode: sem navegação HTML, sem cookies de sessão
  config.navigational_formats = []

  # Configuração JWT
  config.jwt do |jwt|
    jwt.secret = ENV.fetch('JWT_SECRET_KEY') { Rails.application.credentials.secret_key_base }
    jwt.dispatch_requests = [
      ['POST', %r{^/api/v1/auth/login$}]
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/api/v1/auth/logout$}]
    ]
    jwt.expiration_time = 24.hours.to_i
  end
end
