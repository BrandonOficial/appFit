import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import TabNavigator from "./TabNavigator";
import AuthStack from "./StackNavigators/AuthStack";
import { theme } from "../styles/theme";

const AppNavigator = () => {
  // 4. Obter os estados do nosso contexto
  const { isLoggedIn, isLoading } = useAuth();

  // 5. Mostrar o ecrã de loading enquanto o Supabase verifica a sessão
  // Esta é a verificação inicial (o "Guardião")
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // 6. Se não estiver a carregar, decidir qual navegador mostrar
  return (
    <NavigationContainer>
      {/* Esta é a lógica condicional: */}
      {isLoggedIn ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

// 7. Estilos atualizados com as cores do tema
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background, // Usa o nosso fundo da app
  },
});

export default AppNavigator;
