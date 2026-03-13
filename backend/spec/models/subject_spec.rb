require 'rails_helper'

RSpec.describe Subject, type: :model do
  it { should belong_to(:user) }
  it { should have_many(:topics).dependent(:destroy) }
  it { should validate_presence_of(:name) }
  it { should validate_length_of(:name).is_at_most(100) }

  it 'é válido com atributos válidos' do
    expect(build(:subject)).to be_valid
  end

  it 'é inválido sem nome' do
    expect(build(:subject, name: '')).not_to be_valid
  end

  it 'é inválido com nome maior que 100 caracteres' do
    expect(build(:subject, name: 'a' * 101)).not_to be_valid
  end
end
