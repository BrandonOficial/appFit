import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import TabNavigator from "./TabNavigator";
import AuthStack from "./StackNavigators/AuthStack";
import { View, ActivityIndicator, StyleSheet } from "react-native"; // Para um ecrã de loading

const AppNavigator = () => {
  // Vamos buscar o estado 'isLoggedIn' ao nosso contexto
  const { isLoggedIn } = useAuth();

  // Opcional: Adicionar um estado de 'loading' ao AuthContext
  // para evitar o "piscar" da tela de login ao abrir a app
  // const { isLoggedIn, isLoading } = useAuth();
  // if (isLoading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      {/* Esta é a lógica condicional: */}
      {isLoggedIn ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Opcional: Estilo para o loading
// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   }
// });

export default AppNavigator;
