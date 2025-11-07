import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../../screens/Auth/LoginScreen";
// 1. Importar a nossa nova tela de Registo
import RegisterScreen from "../../screens/Auth/RegisterScreen";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    // Escondemos o header padrão (headerShown: false)
    // porque já criámos o nosso próprio botão "Voltar" na RegisterScreen
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* 2. Adicionar a rota de Registo aqui */}
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
