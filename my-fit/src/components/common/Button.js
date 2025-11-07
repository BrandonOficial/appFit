import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native"; // 1. Importar ActivityIndicator
import { theme } from "../../styles/theme";

// 2. Adicionar 'isLoading' e '...props'
const Button = ({ title, onPress, isLoading = false, ...props }) => {
  return (
    // 3. Adicionar 'disabled={isLoading}' para evitar cliques duplos
    <TouchableOpacity
      style={[styles.container, isLoading && styles.disabled]}
      onPress={onPress}
      disabled={isLoading}
      {...props}
    >
      {/* 4. Mostrar o spinner ou o texto */}
      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.background} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  text: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    fontWeight: "500",
    color: theme.colors.background,
    textAlign: "center",
  },
  // 5. Estilo opcional para o botão quando estiver a carregar
  disabled: {
    opacity: 0.7, // Um pouco transparente para feedback visual
  },
});

export default Button;
