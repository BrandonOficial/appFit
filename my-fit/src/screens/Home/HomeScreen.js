import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Nossos componentes e hooks
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";

const HomeScreen = () => {
  // 1. Obter apenas os dados que precisamos
  const { user, userProfile } = useAuth();

  // 2. Lógica de nome (sem alteração)
  const userName =
    userProfile?.full_name ||
    user?.raw_user_meta_data?.full_name ||
    user?.email;

  return (
    <SafeAreaView style={globalStyles.screenContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.h1}>Olá,</Text>
          <Text style={typography.h1}>{userName}</Text>
          <Text style={styles.subtitle}>Este é o teu dashboard.</Text>
        </View>

        {/* 3. BOTÃO DE SAIR REMOVIDO DAQUI */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent removido para o conteúdo ficar no topo
    paddingVertical: theme.spacing.md,
  },
  header: {
    // Conteúdo no topo
  },
  subtitle: {
    ...typography.body,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.lg,
    marginTop: theme.spacing.sm,
  },
});

export default HomeScreen;
