import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Pressable,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { getWorkouts, deleteWorkout } from "../../services/supabase/workouts";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";

/**
 * Modal de Confirmação de Deleção
 */
const DeleteConfirmationModal = ({
  visible,
  workoutName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Ionicons name="warning" size={48} color={theme.colors.error} />
          </View>

          <Text style={styles.modalTitle}>Deletar Treino</Text>

          <Text style={styles.modalMessage}>
            Tem certeza que deseja deletar{"\n"}
            <Text style={styles.modalWorkoutName}>"{workoutName}"</Text>?
            {"\n\n"}
            Esta ação não pode ser desfeita.
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={onCancel}
            >
              <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonTextConfirm}>Deletar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Componente de Card de Treino - Design Atualizado
 */
const WorkoutCard = ({ item, onPress, onOpenMenu, isDeleting }) => {
  const exerciseCount = item.workout_exercises?.length || 0;

  const getExerciseCountText = (count) => {
    return `${count} ${count === 1 ? "exercício" : "exercícios"}`;
  };

  // Gerar cor de fundo aleatória baseada no ID
  const getBackgroundColor = (id) => {
    const colors = [
      "rgba(124, 252, 0, 0.2)", // Verde
      "rgba(255, 159, 64, 0.2)", // Laranja
      "rgba(54, 162, 235, 0.2)", // Azul
      "rgba(255, 99, 132, 0.2)", // Rosa
      "rgba(153, 102, 255, 0.2)", // Roxo
    ];
    const index = parseInt(id.substring(0, 8), 16) % colors.length;
    return colors[index];
  };

  // Gerar emoji baseado no nome do treino
  const getWorkoutEmoji = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("cardio") || lowerName.includes("corrida"))
      return "🏃";
    if (lowerName.includes("peito") || lowerName.includes("supino"))
      return "💪";
    if (lowerName.includes("perna") || lowerName.includes("agachamento"))
      return "🦵";
    if (lowerName.includes("costas")) return "🏋️";
    if (
      lowerName.includes("alongamento") ||
      lowerName.includes("flexibilidade")
    )
      return "🧘";
    return "💪"; // Default
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.workoutCard,
        pressed && styles.workoutCardPressed,
      ]}
      onPress={() => onPress(item.id)}
      disabled={isDeleting}
    >
      {/* Imagem/Avatar do Treino */}
      <View
        style={[
          styles.workoutAvatar,
          { backgroundColor: getBackgroundColor(item.id) },
        ]}
      >
        <Text style={styles.workoutEmoji}>{getWorkoutEmoji(item.name)}</Text>
      </View>

      {/* Informações do Treino */}
      <View style={styles.workoutContent}>
        <Text style={styles.workoutTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.workoutSubtitle} numberOfLines={1}>
          {item.description || `${getExerciseCountText(exerciseCount)}`}
          {item.frequency && ` • ${item.frequency}`}
        </Text>
      </View>

      {/* Menu de Ações */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={(e) => {
          e.stopPropagation();
          onOpenMenu(item.id, item.name);
        }}
        disabled={isDeleting}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={theme.colors.textSecondary} />
        ) : (
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color={theme.colors.textSecondary}
          />
        )}
      </TouchableOpacity>
    </Pressable>
  );
};

const WorkoutsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Estado do modal de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);

  /**
   * Carrega a lista de treinos do usuário
   */
  const loadWorkouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await getWorkouts(user.id);

      if (error) throw error;

      setWorkouts(data || []);
      setFilteredWorkouts(data || []);
    } catch (e) {
      console.error("Erro ao carregar treinos:", e);
      Alert.alert("Erro", "Não foi possível carregar os treinos.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [user])
  );

  /**
   * Filtra os treinos baseado na busca
   */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWorkouts(workouts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = workouts.filter(
        (workout) =>
          workout.name.toLowerCase().includes(query) ||
          workout.description?.toLowerCase().includes(query) ||
          workout.frequency?.toLowerCase().includes(query)
      );
      setFilteredWorkouts(filtered);
    }
  }, [searchQuery, workouts]);

  /**
   * Atualiza a lista de treinos (pull-to-refresh)
   */
  const onRefresh = () => {
    setIsRefreshing(true);
    loadWorkouts();
  };

  /**
   * Navega para a tela de detalhes do treino
   */
  const navigateToWorkoutDetail = (workoutId) => {
    navigation.navigate("WorkoutDetail", { workoutId });
  };

  /**
   * Navega para a tela de criação de treino
   */
  const navigateToCreateWorkout = () => {
    navigation.navigate("CreateWorkout");
  };

  /**
   * Estado do menu de ações
   */
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  /**
   * Abre o menu de ações (editar/deletar)
   */
  const openWorkoutMenu = (workoutId, workoutName) => {
    setSelectedWorkout({ id: workoutId, name: workoutName });
    setMenuVisible(true);
  };

  /**
   * Fecha o menu de ações
   */
  const closeWorkoutMenu = () => {
    setMenuVisible(false);
    setSelectedWorkout(null);
  };

  /**
   * Navega para editar treino
   */
  const handleEditWorkout = () => {
    if (selectedWorkout) {
      closeWorkoutMenu();
      navigation.navigate("CreateWorkout", { workoutId: selectedWorkout.id });
    }
  };

  /**
   * Inicia processo de deleção
   */
  const handleDeleteFromMenu = () => {
    if (selectedWorkout) {
      closeWorkoutMenu();
      setTimeout(() => {
        confirmDeleteWorkout(selectedWorkout.id, selectedWorkout.name);
      }, 300);
    }
  };

  /**
   * Abre o modal de confirmação de deleção
   */
  const confirmDeleteWorkout = (workoutId, workoutName) => {
    setWorkoutToDelete({ id: workoutId, name: workoutName });
    setShowDeleteModal(true);
  };

  /**
   * Cancela a deleção
   */
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setWorkoutToDelete(null);
  };

  /**
   * Confirma e executa a deleção
   */
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);

    if (workoutToDelete) {
      executeDeleteWorkout(workoutToDelete.id, workoutToDelete.name);
    }
  };

  /**
   * Executa a deleção do treino
   */
  const executeDeleteWorkout = async (workoutId, workoutName) => {
    try {
      setDeletingId(workoutId);

      const { error } = await deleteWorkout(workoutId);

      if (error) throw error;

      // Atualizar a lista localmente
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      setFilteredWorkouts((prev) => prev.filter((w) => w.id !== workoutId));

      setTimeout(() => {
        Alert.alert("Sucesso", `"${workoutName}" foi deletado com sucesso!`);
      }, 300);
    } catch (error) {
      console.error("Erro ao deletar:", error);
      Alert.alert("Erro", "Não foi possível deletar o treino.");
    } finally {
      setDeletingId(null);
      setWorkoutToDelete(null);
    }
  };

  /**
   * Alterna a visibilidade da busca
   */
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery("");
    }
  };

  /**
   * Renderiza um card de treino
   */
  const renderWorkoutCard = ({ item }) => (
    <WorkoutCard
      item={item}
      onPress={navigateToWorkoutDetail}
      onOpenMenu={openWorkoutMenu}
      isDeleting={deletingId === item.id}
    />
  );

  /**
   * Renderiza o estado vazio
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="barbell-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>
        {searchQuery ? "Nenhum treino encontrado" : "Nenhum Treino"}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? `Nenhum treino corresponde a "${searchQuery}"`
          : "Comece criando seu primeiro treino\ntocando no botão + abaixo"}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando treinos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com Título e Busca */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Treinos</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={toggleSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isSearchVisible ? "close" : "search"}
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Barra de Busca */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar treinos..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Lista de Treinos */}
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={navigateToCreateWorkout}
      >
        <Ionicons name="add" size={32} color={theme.colors.background} />
      </Pressable>

      {/* Modal de Confirmação de Deleção */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        workoutName={workoutToDelete?.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },

  headerTitle: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: "700",
  },

  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Barra de Busca
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },

  searchIcon: {
    marginRight: theme.spacing.sm,
  },

  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    padding: 0,
  },

  // Lista
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
    flexGrow: 1,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },

  // Card do Treino - Novo Design
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  workoutCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  workoutAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },

  workoutEmoji: {
    fontSize: 32,
  },

  workoutContent: {
    flex: 1,
    justifyContent: "center",
  },

  workoutTitle: {
    ...typography.body,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 4,
  },

  workoutSubtitle: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },

  menuButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  // FAB
  fab: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: theme.spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  fabPressed: {
    transform: [{ scale: 0.95 }],
  },

  // Estado vazio
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xxl,
  },

  emptyTitle: {
    ...typography.h1,
    fontSize: theme.fontSizes.xl,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },

  emptyText: {
    ...typography.body,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Modal de Confirmação
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.xl,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 65, 54, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },

  modalTitle: {
    ...typography.h1,
    fontSize: theme.fontSizes.xl,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },

  modalMessage: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },

  modalWorkoutName: {
    color: theme.colors.text,
    fontWeight: "700",
  },

  modalButtons: {
    flexDirection: "row",
    gap: theme.spacing.md,
    width: "100%",
  },

  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },

  modalButtonCancel: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  modalButtonConfirm: {
    backgroundColor: theme.colors.error,
  },

  modalButtonTextCancel: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.text,
  },

  modalButtonTextConfirm: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.background,
  },
});

export default WorkoutsScreen;
