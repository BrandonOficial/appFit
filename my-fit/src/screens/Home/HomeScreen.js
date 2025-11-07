import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Nossos componentes e hooks
import { useAuth } from "../../contexts/AuthContext";
import Button from "../../components/common/Button";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";

const HomeScreen = () => {
  // 1. Obter o 'user' e a função 'logout' do nosso contexto
  // Também obtemos o 'isLoading' para mostrar o spinner no botão ao sair
  const { user, logout, isLoading } = useAuth();

  // 2. Tentar obter o nome que guardámos no registo
  // O Supabase guarda-o em 'raw_user_meta_data'
  const userName = user?.raw_user_meta_data?.full_name || user?.email;

  const handleLogout = async () => {
    // A função 'logout' já vem do nosso contexto, pronta a usar
    await logout();
  };

  return (
    // 3. Usar o 'screenContainer' dos nossos estilos globais
    <SafeAreaView style={globalStyles.screenContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={typography.h1}>Olá,</Text>
          <Text style={typography.h1}>{userName}</Text>
          <Text style={styles.subtitle}>Este é o teu dashboard.</Text>
        </View>

        {/* 4. O botão de Sair */}
        <Button
          title="Sair (Logout)"
          onPress={handleLogout}
          isLoading={isLoading} // O botão mostrará um spinner se estiver a fazer logout
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // O globalStyles.screenContainer já nos dá o flex: 1 e o fundo
  container: {
    flex: 1,
    justifyContent: "space-between", // Empurra o botão para o fundo
    paddingVertical: theme.spacing.md, // Espaço vertical
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
