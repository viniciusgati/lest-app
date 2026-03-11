class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  validates :name, presence: true
end
