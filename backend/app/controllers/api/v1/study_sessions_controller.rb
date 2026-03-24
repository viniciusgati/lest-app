module Api
  module V1
    class StudySessionsController < BaseController
      before_action :set_session, only: [:update, :destroy, :complete]

      def index
        sessions = user_sessions.order(scheduled_date: :asc)
        sessions = apply_status_filter(sessions)
        sessions = sessions.where(scheduled_date: params[:date_from]..) if params[:date_from].present?
        sessions = sessions.where(scheduled_date: ..params[:date_to]) if params[:date_to].present?

        per = (params[:per_page] || 20).to_i.clamp(1, 100)
        @pagy, paginated = pagy(sessions, limit: per)

        response.set_header('X-Total', @pagy.count.to_s)
        response.set_header('X-Total-Pages', @pagy.pages.to_s)

        render json: {
          data: paginated.map { |s| session_json(s) },
          meta: {
            page: @pagy.page,
            per_page: @pagy.limit,
            total: @pagy.count,
            total_pages: @pagy.pages
          }
        }
      end

      def create
        unless topic_belongs_to_user?(session_params[:topic_id])
          return render json: { error: 'Topic not found' }, status: :not_found
        end

        session = StudySession.new(session_params)
        if session.save
          render json: session_json(session), status: :created
        else
          render json: { errors: session.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @session.update(session_params.except(:topic_id))
          render json: session_json(@session)
        else
          render json: { errors: @session.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @session.destroy
        head :no_content
      end

      def complete
        result = params.require(:study_session).permit(
          :actual_minutes, :questions_done, :questions_correct
        )

        sm2 = Sm2Calculator.calculate(
          @session.topic,
          result[:questions_done].to_i,
          result[:questions_correct].to_i
        )

        ActiveRecord::Base.transaction do
          @session.update!(result.merge(status: 'completed'))
          @session.topic.update!(sm2)

          next_session = StudySession.create!(
            topic: @session.topic,
            scheduled_date: sm2[:next_review],
            expected_minutes: @session.expected_minutes,
            auto_generated: true
          )

          render json: {
            session: session_json(@session),
            next_session: session_json(next_session)
          }
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      private

      def user_sessions
        StudySession.joins(topic: :subject).where(subjects: { user_id: current_user.id })
      end

      def set_session
        @session = user_sessions.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Not found' }, status: :not_found
      end

      def topic_belongs_to_user?(topic_id)
        current_user.subjects.joins(:topics).where(topics: { id: topic_id }).exists?
      end

      def session_json(session)
        session.as_json.merge('status' => session.status_display)
      end

      def apply_status_filter(sessions)
        case params[:status]
        when 'completed'
          sessions.where(status: 'completed')
        when 'late'
          sessions.where(status: 'scheduled').where('scheduled_date < ?', Date.today)
        when 'scheduled'
          sessions.where(status: 'scheduled').where('scheduled_date >= ?', Date.today)
        else
          sessions
        end
      end

      def session_params
        params.require(:study_session).permit(
          :topic_id, :scheduled_date, :start_time, :expected_minutes
        )
      end
    end
  end
end
