import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

// Nossos componentes e hooks
import { useAuth } from "../../contexts/AuthContext";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";

const ProfileScreen = () => {
  const { user, userProfile, updateAvatar, logout, isLoading } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // --- Funções de Handler ---
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

  const handleLogout = async () => {
    await logout();
  };

  // Funções placeholder
  const handleEditProfile = () => console.log("Clicou em Gerenciar Perfil");
  const handlePrivacy = () => console.log("Clicou em Privacidade");
  const handleLanguage = () => console.log("Clicou em Idioma");
  const handleAbout = () => console.log("Clicou em Sobre o App");
  const handleHelp = () => console.log("Clicou em Ajuda e Suporte");

  const userName = userProfile?.full_name || user?.email;
  const userEmail = user?.email;

  // Componente de Item da Lista
  const SettingsItem = ({
    icon,
    title,
    onPress,
    showChevron = true,
    rightComponent,
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.settingsItemText}>{title}</Text>
      </View>
      {rightComponent ||
        (showChevron && (
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.screenContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER COM FOTO DE PERFIL --- */}
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

        {/* --- SEÇÃO CONTA --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon="person-outline"
              title="Gerenciar Perfil"
              onPress={handleEditProfile}
            />
          </View>
        </View>

        {/* --- SEÇÃO CONFIGURAÇÕES DO APP --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONFIGURAÇÕES DO APP</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon="notifications-outline"
              title="Notificações"
              showChevron={false}
              rightComponent={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{
                    false: "#374151",
                    true: theme.colors.primary,
                  }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor="#374151"
                />
              }
            />
            <SettingsItem
              icon="lock-closed-outline"
              title="Privacidade"
              onPress={handlePrivacy}
            />
            <SettingsItem
              icon="language-outline"
              title="Idioma"
              onPress={handleLanguage}
            />
          </View>
        </View>

        {/* --- SEÇÃO INFORMAÇÕES --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
          <View style={styles.settingsCard}>
            <SettingsItem
              icon="information-circle-outline"
              title="Sobre o App"
              onPress={handleAbout}
            />
            <SettingsItem
              icon="help-circle-outline"
              title="Ajuda e Suporte"
              onPress={handleHelp}
            />
          </View>
        </View>

        {/* --- BOTÃO DE SAIR --- */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: 20,
  },
  name: {
    ...typography.h1,
    fontSize: 24,
    marginBottom: 4,
  },
  email: {
    ...typography.body,
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  settingsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 64,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  settingsItemText: {
    ...typography.body,
    fontSize: 16,
    flex: 1,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
    minHeight: 64,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
});

export default ProfileScreen;
