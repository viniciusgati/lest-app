module Api
  module V1
    class ScheduleController < BaseController
      def generate
        sessions = ScheduleGenerator.generate(current_user)
        render json: sessions.map { |s| s.as_json.merge('status' => s.status_display) },
               status: :created
      end
    end
  end
end
