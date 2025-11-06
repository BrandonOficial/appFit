import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
// Importamos o nosso hook customizado!
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";

const LoginScreen = () => {
  // Usamos o hook para aceder à função 'login'
  const { login } = useAuth();

  return (
    <View style={globalStyles.screenContainer}>
      <Text style={typography.h1}>Tela de Login</Text>
      <Button
        style={typography.body}
        title="Entrar (Simulado)"
        onPress={() => {
          // Ao clicar, chamamos a função 'login' do AuthContext
          login();
        }}
      />
      {/* Aqui podemos adicionar Inputs para email/password mais tarde */}
    </View>
  );
};

// Estilos básicos para o exemplo
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

export default LoginScreen;
