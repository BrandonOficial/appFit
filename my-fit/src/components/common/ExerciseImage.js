// src/components/common/ExerciseImage.js - VERSÃO ULTRA SIMPLIFICADA

import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../styles/theme";

/**
 * Componente ultra simplificado para exibir imagens de exercícios.
 * SEM estados, SEM requires, SEM bugs.
 *
 * @param {object} props
 * @param {string} props.source - URL da imagem
 * @param {number} [props.width] - Largura da imagem
 * @param {number} [props.height] - Altura da imagem
 * @param {number} [props.borderRadius=12] - Border radius
 * @param {string} [props.resizeMode='cover'] - Modo de redimensionamento
 * @param {boolean} [props.showOverlay=true] - Mostrar overlay escuro
 */
const ExerciseImage = ({
  source,
  width,
  height,
  borderRadius = 12,
  resizeMode = "cover",
  showOverlay = true,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: width || "100%",
          height: height || 200,
          borderRadius,
        },
      ]}
    >
      {/* Fundo placeholder */}
      <View style={styles.placeholder}>
        <Ionicons
          name="fitness"
          size={width ? Math.floor(width / 3) : 40}
          color={theme.colors.primary}
          style={styles.placeholderIcon}
        />
      </View>

      {/* Imagem */}
      <Image
        source={{ uri: source }}
        style={[
          styles.image,
          {
            borderRadius,
          },
        ]}
        resizeMode={resizeMode}
      />

      {/* Overlay escuro (opcional) */}
      {showOverlay && <View style={[styles.overlay, { borderRadius }]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },

  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${theme.colors.primary}20`,
  },

  placeholderIcon: {
    opacity: 0.3,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});

export default ExerciseImage;
