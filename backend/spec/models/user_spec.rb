require 'rails_helper'

RSpec.describe User, type: :model do
  it { should validate_presence_of(:name) }
  it { should validate_presence_of(:email) }
  it { should validate_uniqueness_of(:email).case_insensitive }
  it { should validate_presence_of(:password) }

  it 'é válido com atributos válidos' do
    expect(build(:user)).to be_valid
  end

  it 'é inválido sem nome' do
    expect(build(:user, name: '')).not_to be_valid
  end

  it 'é inválido com email duplicado' do
    create(:user, email: 'dup@test.com')
    expect(build(:user, email: 'dup@test.com')).not_to be_valid
  end
end
