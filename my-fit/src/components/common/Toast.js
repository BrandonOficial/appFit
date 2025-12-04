// src/components/common/Toast.js
import React, { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../styles/theme";

const Toast = ({ message, type = "success", onHide }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada (Fade In)
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Espera 3 segundos e some (Fade Out)
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (onHide) onHide();
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor:
            type === "success" ? theme.colors.primary : theme.colors.error,
        },
      ]}
    >
      <Ionicons
        name={type === "success" ? "checkmark-circle" : "alert-circle"}
        size={24}
        color={theme.colors.background}
      />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40, // Ajuste para SafeArea
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 9999, // Ficar por cima de tudo
  },
  message: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
    flex: 1,
  },
});

export default Toast;
