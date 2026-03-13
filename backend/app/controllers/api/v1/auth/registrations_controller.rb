module Api
  module V1
    module Auth
      class RegistrationsController < Devise::RegistrationsController
        respond_to :json

        before_action :configure_permitted_parameters

        private

        def configure_permitted_parameters
          devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
        end

        # Prevent Devise from calling sign_in after registration.
        # In API mode there is no session store, so sign_in would raise DisabledSessionError.
        def sign_up(resource_name, resource)
          # no-op: token is dispatched by warden-jwt_auth middleware on login, not on signup
        end

        def respond_with(resource, _opts = {})
          if resource.persisted?
            render json: {
              message: 'Cadastro realizado com sucesso.',
              user: { id: resource.id, name: resource.name, email: resource.email }
            }, status: :ok
          else
            render json: {
              message: 'Erro ao criar conta.',
              errors: resource.errors.full_messages
            }, status: :unprocessable_content
          end
        end
      end
    end
  end
end
