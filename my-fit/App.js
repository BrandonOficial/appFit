import React from "react";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "./src/styles/theme"; // Para a cor de fundo

export default function App() {
  // 3. Chamar o hook para carregar as fontes
  // ...
  const [fontsLoaded] = useFonts({
    Inter: require("./assets/fonts/Inter-VariableFont_opsz,wght.ttf"), // <- COLA AQUI
    "Inter-Italic": require("./assets/fonts/Inter-Italic-VariableFont_opsz,wght.ttf"), // <- E AQUI
  });
  // ...

  // 4. Mostrar o ecrã de loading (igual a antes)
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // 5. Renderizar a app (igual a antes)
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// Estilo para o loading (igual a antes)
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
