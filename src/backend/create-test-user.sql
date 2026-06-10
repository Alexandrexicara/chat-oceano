-- Criar usuário padrão para teste
INSERT INTO users (name, username, bio, city, country, avatar) VALUES
('Usuário Teste', 'usuario_teste', 'Explorando o oceano 🌊', 'São Paulo', 'Brasil', '👤')
ON CONFLICT (username) DO NOTHING;

-- Retornar o ID do usuário
SELECT id, name, username FROM users WHERE username = 'usuario_teste';
