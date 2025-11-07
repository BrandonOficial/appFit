import React, { useState, useEffect } from "react"; // 1. Importar useEffect
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // 2. Obter os novos estados e a função de login real
  // Vamos também renomear 'error' para 'authError' para evitar conflitos
  const { login, isLoading, error: authError } = useAuth();

  // 3. Estado local para o erro (para podermos limpá-lo)
  const [error, setError] = useState(null);

  // 4. Sincronizar o erro do contexto com o estado local
  useEffect(() => {
    setError(authError);
  }, [authError]);

  // 5. Limpar o erro quando o utilizador começa a digitar
  const handleEmailChange = (text) => {
    setError(null); // Limpa o erro
    setEmail(text);
  };
  const handlePasswordChange = (text) => {
    setError(null); // Limpa o erro
    setPassword(text);
  };

  // 6. Atualizar a função de login
  const handleLogin = async () => {
    // Validação simples (opcional)
    if (!email || !password) {
      setError("Por favor, preencha o email e a senha.");
      return;
    }
    // Chamar a função de login do AuthContext
    await login(email, password);
    // O 'authError' será atualizado automaticamente pelo contexto se falhar
  };

  // Funções placeholder (sem alteração)
  const handleForgotPassword = () =>
    console.log('Clicou em "Esqueceu a senha"');
  const handleSignUp = () => navigation.navigate("Register");
  const handleGoogleLogin = () => console.log('Clicou em "Login com Google"');
  const handleFacebookLogin = () =>
    console.log('Clicou em "Login com Facebook"');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexOne}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={typography.h1}>Seu Logo</Text>
          </View>

          <View style={styles.formContainer}>
            {/* 7. Mostrar a mensagem de erro (se existir) */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Input
              label="Email"
              placeholder="Digite seu email"
              value={email}
              onChangeText={handleEmailChange} // Usar a nova função
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={handlePasswordChange} // Usar a nova função
              isPassword={true}
            />

            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <View style={styles.buttonSpacer} />

            {/* 8. Passar o 'isLoading' para o botão */}
            <Button
              title="Entrar"
              onPress={handleLogin}
              isLoading={isLoading}
            />
          </View>

          <View style={styles.footer}>
            {/* ... O resto do footer (sem alteração) ... */}
            <Text style={styles.socialText}>Ou entre com</Text>
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleLogin}
              >
                <Ionicons
                  name="logo-google"
                  size={28}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookLogin}
              >
                <Ionicons
                  name="logo-facebook"
                  size={28}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.signUpContainer}
              onPress={handleSignUp}
            >
              <Text style={typography.body}>Não tem uma conta? </Text>
              <Text style={typography.link}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Todos os teus estilos anteriores de LoginScreen.js)
  // 9. Adicionar o estilo para a mensagem de erro:
  errorText: {
    ...typography.body,
    color: theme.colors.error, // A nossa cor de erro
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },

  // ... (Estilos safeArea, flexOne, scrollContainer, header, etc. aqui)
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flexOne: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  formContainer: {
    // ...
  },
  forgotPassword: {
    ...typography.link,
    fontSize: theme.fontSizes.sm,
    textAlign: "right",
  },
  buttonSpacer: {
    height: theme.spacing.md,
  },
  footer: {
    alignItems: "center",
    paddingBottom: theme.spacing.lg,
  },
  socialText: {
    ...typography.label,
    marginBottom: theme.spacing.md,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    marginBottom: theme.spacing.xl,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  signUpContainer: {
    flexDirection: "row",
  },
});

export default LoginScreen;
