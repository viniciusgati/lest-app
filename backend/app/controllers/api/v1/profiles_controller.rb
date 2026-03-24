module Api
  module V1
    class ProfilesController < BaseController
      def show
        render json: current_user.as_json(only: %i[id name email created_at])
      end

      def update
        if password_change_requested?
          if current_user.update_with_password(profile_params_with_password)
            render json: current_user.as_json(only: %i[id name email]), status: :ok
          else
            render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
          end
        else
          if current_user.update(name: profile_params[:name])
            render json: current_user.as_json(only: %i[id name email]), status: :ok
          else
            render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      private

      def password_change_requested?
        params[:current_password].present? && params[:password].present?
      end

      def profile_params
        params.permit(:name)
      end

      def profile_params_with_password
        params.permit(:name, :current_password, :password, :password_confirmation)
      end
    end
  end
end
