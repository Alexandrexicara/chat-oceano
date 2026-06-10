-- Script para popular o banco de dados com dados iniciais

-- Inserir usuários de teste
INSERT INTO users (name, username, bio, city, country, avatar) VALUES
('João Silva', 'joao_silva', 'Amante do mar 🌊', 'Rio de Janeiro', 'Brasil', '👤'),
('Maria Santos', 'maria_santos', 'Navegante oceânica', 'São Paulo', 'Brasil', '👩'),
('Pedro Costa', 'pedro_costa', 'Explorador de garrafas', 'Salvador', 'Brasil', '🧑'),
('Ana Oliveira', 'ana_oliveira', 'Mensageira do oceano', 'Fortaleza', 'Brasil', '👧'),
('Carlos Mendes', 'carlos_m', 'Capitão das garrafas', 'Recife', 'Brasil', '👨'),
('Fernanda Lima', 'fer_lima', 'Colecionadora de histórias', 'Curitiba', 'Brasil', '👩‍🦰'),
('Ricardo Souza', 'ricardo_s', 'Músico do mar', 'Porto Alegre', 'Brasil', '🧔'),
('Juliana Alves', 'ju_alves', 'Aventureira oceânica', 'Belém', 'Brasil', '👱‍♀️')
ON CONFLICT (username) DO NOTHING;

-- Inserir algumas mensagens de exemplo no oceano (públicas)
INSERT INTO messages (sender_id, text, is_oceano) VALUES
(1, 'O pôr do sol hoje está incrível! 🌅', true),
(2, 'Alguém quer jogar futebol amanhã?', true),
(3, 'Acabei de terminar um livro maravilhoso 📚', true),
(4, 'Bom dia a todos! 🌊', true),
(5, 'A praia estava perfeita hoje 🏖️', true),
(6, 'Quem mais ama o som das ondas? 🎶', true),
(7, 'Receita do dia: bolo de cenoura! 🥕🎂', true),
(8, 'A vida é melhor perto do mar 🌊', true)
ON CONFLICT DO NOTHING;

-- Adicionar alguns contatos
INSERT INTO contacts (user_id, contact_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 5), (2, 6),
(3, 1), (3, 7), (3, 8)
ON CONFLICT DO NOTHING;

SELECT '✅ Dados iniciais inseridos com sucesso!' as status;
