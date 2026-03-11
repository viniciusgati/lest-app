module Api
  module V1
    module Auth
      class SessionsController < Devise::SessionsController
        respond_to :json

        private

        def respond_with(resource, _opts = {})
          render json: {
            message: 'Login realizado com sucesso.',
            user: { id: resource.id, name: resource.name, email: resource.email }
          }, status: :ok
        end

        def respond_to_on_destroy(scope = nil)
          if warden.authenticate(scope: :user)
            render json: { message: 'Logout realizado com sucesso.' }, status: :ok
          else
            render json: { message: 'Token inválido.' }, status: :unauthorized
          end
        end
      end
    end
  end
end
