module Api
  module V1
    class TopicsController < BaseController
      before_action :set_subject
      before_action :set_topic, only: [:update, :destroy]

      def index
        render json: @subject.topics.order(:name)
      end

      def create
        topic = @subject.topics.build(topic_params)
        if topic.save
          render json: topic, status: :created
        else
          render json: { errors: topic.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @topic.update(topic_params)
          render json: @topic
        else
          render json: { errors: @topic.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @topic.destroy
        head :no_content
      end

      private

      def set_subject
        @subject = current_user.subjects.find(params[:subject_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Not found' }, status: :not_found
      end

      def set_topic
        @topic = @subject.topics.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Not found' }, status: :not_found
      end

      def topic_params
        params.require(:topic).permit(:name, :notes)
      end
    end
  end
end
