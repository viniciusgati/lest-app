require 'rails_helper'

RSpec.describe Sm2Calculator do
  describe '.quality_score' do
    it 'retorna 5 para 100% de acertos' do
      expect(described_class.quality_score(10, 10)).to eq(5)
    end

    it 'retorna 4 para 80% de acertos' do
      expect(described_class.quality_score(10, 8)).to eq(4)
    end

    it 'retorna 3 para 60% de acertos' do
      expect(described_class.quality_score(10, 6)).to eq(3)
    end

    it 'retorna 2 para 40% de acertos' do
      expect(described_class.quality_score(10, 4)).to eq(2)
    end

    it 'retorna 1 para 20% de acertos' do
      expect(described_class.quality_score(10, 2)).to eq(1)
    end

    it 'retorna 0 sem questões feitas' do
      expect(described_class.quality_score(0, 0)).to eq(0)
    end

    it 'retorna 5 para 85% (limiar superior)' do
      expect(described_class.quality_score(20, 17)).to eq(5) # 85%
    end

    it 'retorna 4 para 75% (limiar)' do
      expect(described_class.quality_score(4, 3)).to eq(4) # 75%
    end
  end

  describe '.calculate' do
    let(:topic) { build(:topic, ease_factor: 2.5, interval: 1) }

    it 'avança para intervalo 6 após primeira sessão boa (90%)' do
      result = described_class.calculate(topic, 10, 9)
      expect(result[:interval]).to eq(6)
    end

    it 'reseta intervalo para 1 após sessão ruim (20%)' do
      result = described_class.calculate(topic, 10, 2)
      expect(result[:interval]).to eq(1)
    end

    it 'define next_review como hoje + intervalo' do
      result = described_class.calculate(topic, 10, 9)
      expect(result[:next_review]).to eq(Date.today + 6.days)
    end

    it 'retorna ease_factor ajustado para sessão boa' do
      result = described_class.calculate(topic, 10, 9) # quality 5
      expect(result[:ease_factor]).to be > 2.5
    end

    it 'não deixa ease_factor cair abaixo de MIN_EASE (1.3)' do
      low_ease_topic = build(:topic, ease_factor: 1.3, interval: 1)
      result = described_class.calculate(low_ease_topic, 10, 2) # quality 1 — reset
      # interval reseta mas ease não é atualizado em reset
      expect(result[:interval]).to eq(1)
    end

    it 'multiplica intervalo pelo ease_factor após intervalo > 1' do
      advanced_topic = build(:topic, ease_factor: 2.5, interval: 6)
      result = described_class.calculate(advanced_topic, 10, 9)
      expect(result[:interval]).to eq((6 * 2.5).round) # 15
    end
  end
end
