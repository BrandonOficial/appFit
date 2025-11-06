import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
// Importamos o hook novamente
import { useAuth } from "../../contexts/AuthContext";

const HomeScreen = () => {
  // Desta vez, usamos o 'logout'
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo à Home!</Text>
      <Text>Este é o teu dashboard.</Text>
      <Button
        title="Sair (Logout Simulado)"
        onPress={() => {
          logout();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;
