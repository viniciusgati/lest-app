module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          refresh_token = RefreshToken.generate_for(resource)
          render json: {
            message: 'Login realizado com sucesso.',
            refresh_token: refresh_token.token,
            user: { id: resource.id, name: resource.name, email: resource.email }
          }, status: :ok
        end

        def respond_to_on_destroy(scope = nil)
          if (user = warden.authenticate(scope: :user))
            RefreshToken.where(user: user, revoked_at: nil).find_each(&:revoke!)
            render json: { message: 'Logout realizado com sucesso.' }, status: :ok
          else
            render json: { message: 'Token inválido.' }, status: :unauthorized
          end
        end
      end
    end
  end
end
