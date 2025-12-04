// src/constants/exerciseImages.js

/**
 * Mapeamento de palavras-chave para URLs de imagens de exercícios.
 * As imagens são do Unsplash com dimensões otimizadas (600x400).
 */
export const EXERCISE_IMAGE_MAP = {
  // PEITO
  peito:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&q=80",
  supino:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
  flexao:
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=400&fit=crop&q=80",

  // COSTAS
  costas:
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop&q=80",
  remada:
    "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop&q=80",
  pullover:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80",
  barra:
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=400&fit=crop&q=80",

  // PERNAS
  pernas:
    "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop&q=80",
  perna:
    "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop&q=80",
  agachamento:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&q=80",
  leg: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop&q=80",
  coxa: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop&q=80",
  panturrilha:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",

  // OMBROS
  ombros:
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop&q=80",
  ombro:
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop&q=80",
  desenvolvimento:
    "https://images.unsplash.com/photo-1583454155184-870a77f49f75?w=600&h=400&fit=crop&q=80",
  elevacao:
    "https://images.unsplash.com/photo-1583454155184-870a77f49f75?w=600&h=400&fit=crop&q=80",

  // BRAÇOS
  bracos:
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80",
  braco:
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80",
  biceps:
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80",
  triceps:
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80",
  rosca:
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80",

  // ABDÔMEN
  abdomen:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
  abdominal:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",
  prancha:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80",

  // CARDIO
  cardio:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop&q=80",
  corrida:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop&q=80",
  esteira:
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop&q=80",
  bicicleta:
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop&q=80",
  eliptico:
    "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&h=400&fit=crop&q=80",

  // ALONGAMENTO/FLEXIBILIDADE
  alongamento:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80",
  yoga: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80",
  mobilidade:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&q=80",

  // FUNCIONAL
  funcional:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop&q=80",
  crossfit:
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=400&fit=crop&q=80",

  // IMAGEM PADRÃO
  default:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80",
};

/**
 * Obtém a URL da imagem baseada no nome do exercício.
 * Usa um sistema de fallback inteligente que tenta múltiplas correspondências.
 *
 * @param {string} name - Nome do exercício ou treino
 * @returns {string} URL da imagem
 */
export const getExerciseImage = (name) => {
  if (!name) return EXERCISE_IMAGE_MAP.default;

  const normalizedName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Primeira tentativa: correspondência exata
  for (const [key, imageUrl] of Object.entries(EXERCISE_IMAGE_MAP)) {
    if (key !== "default" && normalizedName === key) {
      return imageUrl;
    }
  }

  // Segunda tentativa: palavra contida no nome
  for (const [key, imageUrl] of Object.entries(EXERCISE_IMAGE_MAP)) {
    if (key !== "default" && normalizedName.includes(key)) {
      return imageUrl;
    }
  }

  // Terceira tentativa: nome contém a palavra-chave
  for (const [key, imageUrl] of Object.entries(EXERCISE_IMAGE_MAP)) {
    if (key !== "default" && key.length > 3 && key.includes(normalizedName)) {
      return imageUrl;
    }
  }

  return EXERCISE_IMAGE_MAP.default;
};

/**
 * Pré-carrega as imagens para melhorar a performance.
 * Útil para chamar quando a app inicializa.
 */
export const preloadExerciseImages = () => {
  return Object.values(EXERCISE_IMAGE_MAP).map((url) => {
    const img = new Image();
    img.src = url;
    return img;
  });
};
