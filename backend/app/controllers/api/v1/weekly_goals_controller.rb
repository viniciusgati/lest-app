module Api
  module V1
    class WeeklyGoalsController < BaseController
      def index
        goals = current_user.weekly_goals.order(week_start: :desc)
        render json: goals
      end

      def current
        goal = find_or_initialize_current_goal
        render json: goal
      end

      def update_current
        goal = current_user.weekly_goals.find_or_initialize_by(
          week_start: WeeklyGoal.week_start_for(Date.today)
        )
        if goal.update(weekly_goal_params)
          render json: goal
        else
          render json: { errors: goal.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def find_or_initialize_current_goal
        week_start = WeeklyGoal.week_start_for(Date.today)
        current_user.weekly_goals.find_or_initialize_by(week_start: week_start)
      end

      def weekly_goal_params
        params.require(:weekly_goal).permit(
          :target_hours, :target_questions, :target_percentage
        )
      end
    end
  end
end
