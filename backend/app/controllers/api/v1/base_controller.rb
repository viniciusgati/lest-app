module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      private

      def current_user_response
        {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email
        }
      end
    end
  end
end
