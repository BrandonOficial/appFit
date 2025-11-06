import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const typography = StyleSheet.create({
  // Exemplo: "Seu Logo"
  h1: {
    fontFamily: theme.fonts.bold, // 'Inter'
    fontSize: theme.fontSizes.xxl,
    fontWeight: "700", // 700 é o peso "Bold"
    color: theme.colors.text,
  },
  // Exemplo: "Email", "Senha"
  label: {
    fontFamily: theme.fonts.medium, // 'Inter'
    fontSize: theme.fontSizes.sm,
    fontWeight: "500", // 500 é o peso "Medium"
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  // Exemplo: "Digite seu email"
  body: {
    fontFamily: theme.fonts.regular, // 'Inter'
    fontSize: theme.fontSizes.md,
    fontWeight: "400", // 400 é o peso "Regular"
    color: theme.colors.text,
  },
  // Exemplo: "Cadastre-se"
  link: {
    fontFamily: theme.fonts.bold, // 'Inter'
    fontSize: theme.fontSizes.sm,
    fontWeight: "700", // "Bold" novamente
    color: theme.colors.primary,
  },
});
