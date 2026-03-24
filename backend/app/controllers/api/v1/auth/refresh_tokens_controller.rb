module Api
  module V1
    module Auth
      class RefreshTokensController < ApplicationController

        def create
          token_value = params[:refresh_token].presence
          refresh_token = token_value ? RefreshToken.valid.find_by(token: token_value) : nil

          if refresh_token.nil?
            render json: { error: 'Token inválido ou expirado.' }, status: :unauthorized
            return
          end

          user = refresh_token.user
          new_jwt = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil).first

          render json: { token: new_jwt, expires_in: 86_400 }, status: :ok
        end
      end
    end
  end
end
