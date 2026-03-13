module Api
  module V1
    class SubjectsController < BaseController
      before_action :set_subject, only: [:update, :destroy]

      def index
        subjects = current_user.subjects.order(:name)
        render json: subjects
      end

      def create
        subject = current_user.subjects.build(subject_params)
        if subject.save
          render json: subject, status: :created
        else
          render json: { errors: subject.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @subject.update(subject_params)
          render json: @subject
        else
          render json: { errors: @subject.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @subject.destroy
        head :no_content
      end

      private

      def set_subject
        @subject = current_user.subjects.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Not found' }, status: :not_found
      end

      def subject_params
        params.require(:subject).permit(:name)
      end
    end
  end
end
