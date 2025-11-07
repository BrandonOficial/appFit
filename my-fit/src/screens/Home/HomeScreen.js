import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Nossos componentes e hooks
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";

const HomeScreen = () => {
  // 1. OBTER O NOVO 'userProfile' DO CONTEXTO
  const { user, userProfile, logout, isLoading } = useAuth();

  // 2. LÓGICA DE NOME CORRIGIDA E MAIS ROBUSTA
  const userName =
    userProfile?.full_name ||
    user?.raw_user_meta_data?.full_name ||
    user?.email;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={globalStyles.screenContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.h1}>Olá,</Text>
          <Text style={typography.h1}>{userName}</Text>
          <Text style={styles.subtitle}>Este é o teu dashboard.</Text>
        </View>

        <Button
          title="Sair (Logout)"
          onPress={handleLogout}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
  },
  header: {
    // ...
  },
  subtitle: {
    ...typography.body,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.lg,
    marginTop: theme.spacing.sm,
  },
});

export default HomeScreen;
