module Api
  module V1
    class UserConfigsController < BaseController
      def show
        config = current_user.user_config || current_user.create_user_config!(
          available_days: %w[mon tue wed thu fri],
          schedule_strategy: 'sm2'
        )
        render json: config
      end

      def update
        config = current_user.user_config || current_user.build_user_config
        if config.update(user_config_params)
          render json: config
        else
          render json: { errors: config.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def user_config_params
        params.require(:user_config).permit(
          :schedule_strategy,
          available_days: []
        )
      end
    end
  end
end
