require 'rails_helper'

RSpec.describe UserConfig, type: :model do
  describe 'validações' do
    it 'é válido com atributos corretos' do
      config = build(:user_config)
      expect(config).to be_valid
    end

    it 'aceita todas as estratégias válidas' do
      %w[sm2 weak_points balanced].each do |strategy|
        config = build(:user_config, schedule_strategy: strategy)
        expect(config).to be_valid, "esperava válido para #{strategy}"
      end
    end

    it 'rejeita estratégia inválida' do
      config = build(:user_config, schedule_strategy: 'invalida')
      expect(config).not_to be_valid
      expect(config.errors[:schedule_strategy]).to be_present
    end

    it 'aceita todos os dias válidos' do
      config = build(:user_config, available_days: %w[mon tue wed thu fri sat sun])
      expect(config).to be_valid
    end

    it 'rejeita dia inválido' do
      config = build(:user_config, available_days: %w[mon xxx])
      expect(config).not_to be_valid
      expect(config.errors[:available_days]).to be_present
    end

    it 'é válido com available_days vazio' do
      config = build(:user_config, available_days: [])
      expect(config).to be_valid
    end
  end

  describe 'constantes' do
    it 'define VALID_DAYS com 7 dias' do
      expect(UserConfig::VALID_DAYS).to eq(%w[mon tue wed thu fri sat sun])
    end

    it 'define VALID_STRATEGIES com 3 opções' do
      expect(UserConfig::VALID_STRATEGIES).to eq(%w[sm2 weak_points balanced])
    end
  end
end
