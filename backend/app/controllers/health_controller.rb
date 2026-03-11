class HealthController < ApplicationController
  # Garante que o health check permanece público mesmo após
  # a adição de `authenticate_user!` em ApplicationController (Story 1.3)
  skip_before_action :authenticate_user!, raise: false

  def index
    render json: { status: 'ok' }
  end
end
