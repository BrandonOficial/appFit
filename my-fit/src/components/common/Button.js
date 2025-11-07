import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { theme } from "../../styles/theme";

/**
 * Botão customizado que aceita variantes de cor.
 * @param {object} props
 * @param {string} props.title - O texto do botão.
 * @param {function} props.onPress - A função ao clicar.
 * @param {boolean} [props.isLoading=false] - Mostra um spinner se for true.
 * @param {'primary' | 'danger'} [props.variant='primary'] - O esquema de cor.
 */
const Button = ({
  title,
  onPress,
  isLoading = false,
  variant = "primary",
  ...props
}) => {
  // 1. Escolher os estilos com base na 'variant'
  const containerStyle = [
    styles.container,
    variant === "danger" ? styles.containerDanger : styles.containerPrimary,
    isLoading && styles.disabled,
  ];

  const textStyle = [
    styles.text,
    variant === "danger" ? styles.textDanger : styles.textPrimary,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        // Usar a cor de texto correta para o spinner
        <ActivityIndicator
          size="small"
          color={
            variant === "danger" ? theme.colors.text : theme.colors.background
          }
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // Estilo base (comum a todos)
    width: "100%",
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  // --- Estilos das Variantes ---
  containerPrimary: {
    // Verde
    backgroundColor: theme.colors.primary,
  },
  containerDanger: {
    // Vermelho
    backgroundColor: theme.colors.error, // Usando a cor 'error' do teu tema
  },
  textPrimary: {
    // Texto para o botão verde
    color: theme.colors.background, // Texto escuro
  },
  textDanger: {
    // Texto para o botão vermelho
    color: theme.colors.text, // Texto claro (branco)
  },
  // --- Fim das Variantes ---
  text: {
    // Estilo base do texto
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    fontWeight: "500",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.7,
  },
});

export default Button;
