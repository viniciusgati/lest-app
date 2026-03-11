# Seed de desenvolvimento — usuário padrão para testes
User.find_or_create_by!(email: 'dev@edutrack.app') do |user|
  user.name = 'Dev User'
  user.password = 'password123'
  user.password_confirmation = 'password123'
end

puts "✅ Seed: dev@edutrack.app / password123"
