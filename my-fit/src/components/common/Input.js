import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform, // 1. Importar o 'Platform'
} from "react-native";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";
import { Ionicons } from "@expo/vector-icons";

const Input = ({ label, placeholder, isPassword = false, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[typography.label, styles.label]}>{label}</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[typography.body, styles.input]} // Aplicamos o estilo aqui
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconContainer}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: theme.spacing.lg,
  },
  label: {
    // ...
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: 50,

    // 2. Adiciona esta verificação de plataforma:
    // Remove o "outline" azul que aparece no navegador (Web)
    ...(Platform.OS === "web" && {
      outlineStyle: "none",
    }),
  },
  iconContainer: {
    paddingLeft: theme.spacing.sm,
  },
});

export default Input;
