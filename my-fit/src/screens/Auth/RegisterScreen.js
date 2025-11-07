import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Nossos componentes e estilos
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

const RegisterScreen = () => {
  const navigation = useNavigation();

  const { register, isLoading, error: authError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [localError, setLocalError] = useState(null);

  const clearErrors = () => {
    setLocalError(null);
  };

  const handleRegister = async () => {
    clearErrors();
    const cleanedName = name.trim();
    const cleanedEmail = email.trim();
    console.log("A tentar registar com:", cleanedName, cleanedEmail);

    if (!cleanedName || !cleanedEmail || !password || !confirmPassword) {
      setLocalError("Por favor, preencha todos os campos.");
      return;
    }
    if (!cleanedEmail.includes("@") || !cleanedEmail.includes(".")) {
      setLocalError("Por favor, insira um formato de email válido.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("As senhas não coincidem.");
      return;
    }

    const success = await register(cleanedName, cleanedEmail, password);

    if (success) {
      Alert.alert(
        "Registo Concluído!",
        "Conta criada com sucesso. Por favor, verifique o seu email para confirmar a conta e depois faça o login.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
    // Se 'success' for falso, o authError do useAuth() aparecerá
  };

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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={typography.h1}>Criar Conta</Text>
          </View>

          <View style={styles.formContainer}>
            {(localError || authError) && (
              <Text style={styles.errorText}>{localError || authError}</Text>
            )}

            <Input
              label="Nome Completo"
              placeholder="Digite seu nome"
              value={name}
              onChangeText={(t) => {
                clearErrors();
                setName(t);
              }}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="Digite seu email"
              value={email}
              onChangeText={(t) => {
                clearErrors();
                setEmail(t);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={(t) => {
                clearErrors();
                setPassword(t);
              }}
              isPassword={true}
            />

            <Input
              label="Confirmar Senha"
              placeholder="Digite sua senha novamente"
              value={confirmPassword}
              onChangeText={(t) => {
                clearErrors();
                setConfirmPassword(t);
              }}
              isPassword={true}
            />

            <View style={styles.buttonSpacer} />

            <Button
              title="Cadastrar"
              onPress={handleRegister}
              isLoading={isLoading}
            />
          </View>

          <View style={{ flex: 1 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
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
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: theme.spacing.xl + theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  formContainer: {
    // ...
  },
  buttonSpacer: {
    height: theme.spacing.md,
  },
  errorText: {
    ...typography.body,
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
});

export default RegisterScreen;
