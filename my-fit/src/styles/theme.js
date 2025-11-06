// Estas são as cores que definiste.
const colors = {
  background: "#0C0F1A", // Cor de fundo principal
  primary: "#7CFC00", // Verde-limão para botões e destaques
  text: "#F5F5F5", // Cor de texto principal (branco-sujo)

  // Variações e cores de apoio
  textSecondary: "#A9A9A9", // Um cinza para sub-textos (ex: "Ou entre com")
  surface: "#1E212D", // Uma cor para "cartões" ou fundos de input
  border: "#3A3D4A", // Cor para bordas subtis
  error: "#FF4136", // Cor para erros de validação
};

// Espaçamentos padrão (baseado no sistema 8-point grid)
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Tamanhos de fonte
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16, // Body
  lg: 20, // Títulos menores
  xl: 28, // Títulos principais
  xxl: 36, // Logo/Destaque
};

const fonts = {
  regular: "Inter",
  bold: "Inter",
  medium: "Inter",
};

// Exportamos tudo num único objeto 'theme'
export const theme = {
  colors,
  spacing,
  fontSizes,
  fonts,
};
