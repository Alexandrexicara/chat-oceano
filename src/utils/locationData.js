// Lista de países com DDI e idioma padrão
export const countries = [
  { code: 'BR', name: 'Brasil', ddi: '55', language: 'pt-BR', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', ddi: '1', language: 'en-US', flag: '🇺🇸' },
  { code: 'PT', name: 'Portugal', ddi: '351', language: 'pt-PT', flag: '🇵🇹' },
  { code: 'AR', name: 'Argentina', ddi: '54', language: 'es-AR', flag: '🇦🇷' },
  { code: 'MX', name: 'México', ddi: '52', language: 'es-MX', flag: '🇲🇽' },
  { code: 'CO', name: 'Colômbia', ddi: '57', language: 'es-CO', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', ddi: '56', language: 'es-CL', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', ddi: '51', language: 'es-PE', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', ddi: '58', language: 'es-VE', flag: '🇻🇪' },
  { code: 'UY', name: 'Uruguai', ddi: '598', language: 'es-UY', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', ddi: '595', language: 'es-PY', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolívia', ddi: '591', language: 'es-BO', flag: '🇧🇴' },
  { code: 'EC', name: 'Equador', ddi: '593', language: 'es-EC', flag: '🇪🇨' },
  { code: 'GB', name: 'Reino Unido', ddi: '44', language: 'en-GB', flag: '🇬🇧' },
  { code: 'FR', name: 'França', ddi: '33', language: 'fr-FR', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', ddi: '49', language: 'de-DE', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', ddi: '39', language: 'it-IT', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', ddi: '34', language: 'es-ES', flag: '🇪🇸' },
  { code: 'JP', name: 'Japão', ddi: '81', language: 'ja-JP', flag: '🇯🇵' },
  { code: 'CN', name: 'China', ddi: '86', language: 'zh-CN', flag: '🇨🇳' },
  { code: 'IN', name: 'Índia', ddi: '91', language: 'hi-IN', flag: '🇮🇳' },
  { code: 'ZA', name: 'África do Sul', ddi: '27', language: 'en-ZA', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigéria', ddi: '234', language: 'en-NG', flag: '🇳🇬' },
  { code: 'AO', name: 'Angola', ddi: '244', language: 'pt-AO', flag: '🇦🇴' },
  { code: 'MZ', name: 'Moçambique', ddi: '258', language: 'pt-MZ', flag: '🇲🇿' },
]

// Cidades brasileiras com DDD
export const brazilianCities = [
  { name: 'São Paulo', ddd: '11', state: 'SP' },
  { name: 'Rio de Janeiro', ddd: '21', state: 'RJ' },
  { name: 'Belo Horizonte', ddd: '31', state: 'MG' },
  { name: 'Brasília', ddd: '61', state: 'DF' },
  { name: 'Salvador', ddd: '71', state: 'BA' },
  { name: 'Fortaleza', ddd: '85', state: 'CE' },
  { name: 'Curitiba', ddd: '41', state: 'PR' },
  { name: 'Recife', ddd: '81', state: 'PE' },
  { name: 'Porto Alegre', ddd: '51', state: 'RS' },
  { name: 'Manaus', ddd: '92', state: 'AM' },
  { name: 'Belém', ddd: '91', state: 'PA' },
  { name: 'Goiânia', ddd: '62', state: 'GO' },
  { name: 'Guarulhos', ddd: '11', state: 'SP' },
  { name: 'Campinas', ddd: '19', state: 'SP' },
  { name: 'São Luís', ddd: '98', state: 'MA' },
  { name: 'São Gonçalo', ddd: '21', state: 'RJ' },
  { name: 'Maceió', ddd: '82', state: 'AL' },
  { name: 'Duque de Caxias', ddd: '21', state: 'RJ' },
  { name: 'Natal', ddd: '84', state: 'RN' },
  { name: 'Campo Grande', ddd: '67', state: 'MS' },
  { name: 'Teresina', ddd: '86', state: 'PI' },
  { name: 'São Bernardo do Campo', ddd: '11', state: 'SP' },
  { name: 'João Pessoa', ddd: '83', state: 'PB' },
  { name: 'Nova Iguaçu', ddd: '21', state: 'RJ' },
  { name: 'Santo André', ddd: '11', state: 'SP' },
  { name: 'São José dos Campos', ddd: '12', state: 'SP' },
  { name: 'Osasco', ddd: '11', state: 'SP' },
  { name: 'Jaboatão dos Guararapes', ddd: '81', state: 'PE' },
  { name: 'Ribeirão Preto', ddd: '16', state: 'SP' },
  { name: 'Uberlândia', ddd: '34', state: 'MG' },
  { name: 'Contagem', ddd: '31', state: 'MG' },
  { name: 'Sorocaba', ddd: '15', state: 'SP' },
  { name: 'Aracaju', ddd: '79', state: 'SE' },
  { name: 'Feira de Santana', ddd: '75', state: 'BA' },
  { name: 'Cuiabá', ddd: '65', state: 'MT' },
  { name: 'Joinville', ddd: '47', state: 'SC' },
  { name: 'Juiz de Fora', ddd: '32', state: 'MG' },
  { name: 'Londrina', ddd: '43', state: 'PR' },
  { name: 'Aparecida de Goiânia', ddd: '62', state: 'GO' },
  { name: 'Niterói', ddd: '21', state: 'RJ' },
  { name: 'Ananindeua', ddd: '91', state: 'PA' },
  { name: 'Porto Velho', ddd: '69', state: 'RO' },
  { name: 'Serra', ddd: '27', state: 'ES' },
  { name: 'Caxias do Sul', ddd: '54', state: 'RS' },
  { name: 'Vila Velha', ddd: '27', state: 'ES' },
  { name: 'Florianópolis', ddd: '48', state: 'SC' },
  { name: 'Maringá', ddd: '44', state: 'PR' },
  { name: 'Macapá', ddd: '96', state: 'AP' },
  { name: 'Rio Branco', ddd: '68', state: 'AC' },
  { name: 'Palmas', ddd: '63', state: 'TO' },
  { name: 'Boa Vista', ddd: '95', state: 'RR' },
]

// Idiomas suportados
export const languages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Español (México)', flag: '🇲🇽' },
  { code: 'es-AR', name: 'Español (Argentina)', flag: '🇦🇷' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
]

// Função para pegar país por código
export function getCountryByCode(code) {
  return countries.find(c => c.code === code) || countries[0]
}

// Função para pegar idioma por código
export function getLanguageByCode(code) {
  return languages.find(l => l.code === code) || languages[0]
}

// Função para pegar cidades de um estado
export function getCitiesByState(state) {
  return brazilianCities.filter(c => c.state === state)
}

// Função para pegar DDD da cidade
export function getDDDByCity(cityName) {
  const city = brazilianCities.find(c => c.name === cityName)
  return city ? city.ddd : ''
}
