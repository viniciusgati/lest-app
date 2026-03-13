require 'rails_helper'

RSpec.describe Topic, type: :model do
  it { should belong_to(:subject) }
  it { should validate_presence_of(:name) }
  it { should validate_length_of(:name).is_at_most(100) }

  it 'é válido com atributos válidos' do
    expect(build(:topic)).to be_valid
  end

  it 'é inválido sem nome' do
    expect(build(:topic, name: '')).not_to be_valid
  end

  it 'inicializa next_review com Date.today ao criar' do
    topic = create(:topic, next_review: nil)
    expect(topic.next_review).to eq(Date.today)
  end

  it 'inicializa ease_factor com 2.5 por padrão' do
    topic = create(:topic)
    expect(topic.ease_factor).to eq(2.5)
  end

  it 'inicializa interval com 1 por padrão' do
    topic = create(:topic)
    expect(topic.interval).to eq(1)
  end
end
