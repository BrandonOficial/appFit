import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

// Nossos componentes e hooks
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";
import Button from "../../components/common/Button"; // O nosso botão verde
import ProfileListItem from "../../components/common/ProfileListItem"; // O nosso novo item de lista

const ProfileScreen = () => {
  // Obter todos os dados e funções que precisamos do contexto
  const { user, userProfile, updateAvatar, logout, isLoading } = useAuth();

  // --- Funções de Handler ---

  // Função para escolher a imagem (já a tínhamos)
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos da permissão da galeria para mudar a foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      await updateAvatar(uri);
    }
  };

  // Função para o botão de Sair
  const handleLogout = async () => {
    await logout();
  };

  // Funções placeholder para os novos botões da lista
  const handleEditProfile = () => console.log("Clicou em Editar Perfil");
  const handleNotifications = () => console.log("Clicou em Notificações");
  const handlePrivacy = () => console.log("Clicou em Política de Privacidade");
  const handleHelp = () => console.log("Clicou em Ajuda");

  // --- Lógica de Nomes ---
  const userName = userProfile?.full_name || user?.email;
  const userEmail = user?.email;

  // --- Renderização ---
  return (
    <SafeAreaView style={globalStyles.screenContainer}>
      {/* Usamos ScrollView para o caso de o ecrã ser pequeno */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- 1. CABEÇALHO DO PERFIL --- */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.avatarContainer}
          >
            {userProfile?.avatar_url ? (
              <Image
                source={{ uri: userProfile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons
                  name="person"
                  size={60}
                  color={theme.colors.primary}
                />
              </View>
            )}
            {/* Ícone de "Editar" por cima da foto */}
            <View style={styles.editIcon}>
              <Ionicons
                name="camera"
                size={18}
                color={theme.colors.background}
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        {/* --- 2. LISTAS DE OPÇÕES --- */}
        <View style={styles.listContainer}>
          {/* Secção Geral */}
          <Text style={styles.sectionTitle}>Geral</Text>
          <ProfileListItem
            icon="person-outline"
            title="Editar Perfil"
            onPress={handleEditProfile}
          />
          <ProfileListItem
            icon="notifications-outline"
            title="Notificações"
            onPress={handleNotifications}
          />

          {/* Secção Informações */}
          <Text style={styles.sectionTitle}>Informações</Text>
          <ProfileListItem
            icon="lock-closed-outline"
            title="Política de Privacidade"
            onPress={handlePrivacy}
          />
          <ProfileListItem
            icon="help-circle-outline"
            title="Ajuda"
            onPress={handleHelp}
          />
        </View>

        {/* --- 3. BOTÃO DE SAIR --- */}
        <View style={styles.logoutButtonContainer}>
          <Button
            title="Sair"
            onPress={handleLogout}
            isLoading={isLoading}
            // --- A MUDANÇA ESTÁ AQUI ---
            variant="danger" // <-- Adiciona esta linha
            // --- FIM DA MUDANÇA ---
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Garante que o ScrollView ocupa o espaço
    padding: theme.spacing.md,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
    position: "relative", // Necessário para o ícone de editar
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: theme.colors.primary,
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  name: {
    ...typography.h1,
    fontSize: theme.fontSizes.xl,
  },
  email: {
    ...typography.body,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.md,
  },
  listContainer: {
    width: "100%",
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...typography.label, // Usa o nosso estilo de label (cinza, pequeno)
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textTransform: "uppercase", // Como no design
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.sm, // Pequeno recuo
  },
  logoutButtonContainer: {
    width: "100%",
    marginTop: "auto", // Empurra o botão de Sair para o fundo
    paddingTop: theme.spacing.lg,
  },
});

export default ProfileScreen;
