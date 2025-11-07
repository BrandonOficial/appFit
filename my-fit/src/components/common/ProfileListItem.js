import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

/**
 * Um item de lista reutilizável para ecrãs de perfil/configurações.
 *
 * @param {object} props
 * @param {string} props.icon - O nome do ícone 'Ionicons' a ser exibido à esquerda.
 * @param {string} props.title - O texto principal do item.
 * @param {function} props.onPress - A função a ser chamada ao clicar.
 */
const ProfileListItem = ({ icon, title, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* 1. Ícone da Esquerda */}
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>

      {/* 2. Título */}
      <Text style={styles.title}>{title}</Text>

      {/* 3. Ícone da Direita (Seta) */}
      <View style={styles.chevronContainer}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: theme.colors.surface, // Fundo #1E212D
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm, // Espaço entre os itens
  },
  iconContainer: {
    width: 35, // Largura fixa para alinhar os títulos
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  title: {
    ...typography.body, // Usa o nosso estilo de corpo
    flex: 1, // Faz o título ocupar o espaço disponível
    color: theme.colors.text, // Cor de texto principal
  },
  chevronContainer: {
    // A seta fica no final
  },
});

export default ProfileListItem;
