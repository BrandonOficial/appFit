// src/screens/Workouts/WorkoutsScreen.js - CORRIGIDO

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
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { getWorkouts, deleteWorkout } from "../../services/supabase/workouts";
import ExerciseImage from "../../components/common/ExerciseImage";
import { getExerciseImage } from "../../constants/exerciseImages";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getExerciseCountText = (count) => {
  return `${count} ${count === 1 ? "exercício" : "exercícios"}`;
};

// ============================================================================
// ACTION MENU MODAL COMPONENT
// ============================================================================

const ActionMenuModal = ({
  visible,
  workoutName,
  onEdit,
  onDelete,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.menuOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContent}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle} numberOfLines={1}>
              {workoutName}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.menuItems}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons
                  name="create-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.menuItemText}>Editar Treino</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={onDelete}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, styles.menuIconDanger]}>
                <Ionicons
                  name="trash-outline"
                  size={24}
                  color={theme.colors.error}
                />
              </View>
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>
                Deletar Treino
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ============================================================================
// DELETE CONFIRMATION MODAL COMPONENT
// ============================================================================

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

// ============================================================================
// WORKOUT CARD COMPONENT - ATUALIZADO COM TouchableOpacity
// ============================================================================

const WorkoutCard = ({ item, onPress, onOpenMenu, isDeleting }) => {
  const exerciseCount = item.workout_exercises?.length || 0;
  const imageUrl = getExerciseImage(item.name);

  return (
    <TouchableOpacity
      style={styles.workoutCard}
      onPress={() => onPress(item.id)}
      disabled={isDeleting}
      activeOpacity={0.7}
    >
      {/* Imagem do Treino */}
      <ExerciseImage
        source={imageUrl}
        width={80}
        height={80}
        borderRadius={16}
        showOverlay={false}
      />

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
    </TouchableOpacity>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

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

  // ============================================================================
  // SEARCH FUNCTIONALITY
  // ============================================================================

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredWorkouts(workouts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = workouts.filter(
      (workout) =>
        workout.name.toLowerCase().includes(query) ||
        workout.description?.toLowerCase().includes(query) ||
        workout.frequency?.toLowerCase().includes(query)
    );
    setFilteredWorkouts(filtered);
  }, [searchQuery, workouts]);

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    if (isSearchVisible) {
      setSearchQuery("");
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const navigateToWorkoutDetail = (workoutId) => {
    navigation.navigate("WorkoutDetail", { workoutId });
  };

  const navigateToCreateWorkout = () => {
    navigation.navigate("CreateWorkout");
  };

  const openWorkoutMenu = (workoutId, workoutName) => {
    setSelectedWorkout({ id: workoutId, name: workoutName });
    setShowActionMenu(true);
  };

  const closeActionMenu = () => {
    setShowActionMenu(false);
    setTimeout(() => setSelectedWorkout(null), 300);
  };

  const handleEditWorkout = () => {
    if (selectedWorkout) {
      closeActionMenu();
      setTimeout(() => {
        navigation.navigate("CreateWorkout", { workoutId: selectedWorkout.id });
      }, 300);
    }
  };

  const handleDeleteFromMenu = () => {
    if (selectedWorkout) {
      closeActionMenu();
      setTimeout(() => {
        confirmDeleteWorkout(selectedWorkout.id, selectedWorkout.name);
      }, 300);
    }
  };

  const confirmDeleteWorkout = (workoutId, workoutName) => {
    setWorkoutToDelete({ id: workoutId, name: workoutName });
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setWorkoutToDelete(null);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);

    if (workoutToDelete) {
      executeDeleteWorkout(workoutToDelete.id, workoutToDelete.name);
    }
  };

  const executeDeleteWorkout = async (workoutId, workoutName) => {
    try {
      setDeletingId(workoutId);

      const { error } = await deleteWorkout(workoutId);

      if (error) throw error;

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

  const onRefresh = () => {
    setIsRefreshing(true);
    loadWorkouts();
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderWorkoutCard = ({ item }) => (
    <WorkoutCard
      item={item}
      onPress={navigateToWorkoutDetail}
      onOpenMenu={openWorkoutMenu}
      isDeleting={deletingId === item.id}
    />
  );

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

      {/* FAB - Corrigido com TouchableOpacity */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToCreateWorkout}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={theme.colors.background} />
      </TouchableOpacity>

      <ActionMenuModal
        visible={showActionMenu}
        workoutName={selectedWorkout?.name || ""}
        onEdit={handleEditWorkout}
        onDelete={handleDeleteFromMenu}
        onClose={closeActionMenu}
      />

      <DeleteConfirmationModal
        visible={showDeleteModal}
        workoutName={workoutToDelete?.name || ""}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

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

  // Card - Removido workoutCardPressed (não é mais necessário)
  workoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 0,
  },

  workoutContent: {
    flex: 1,
    justifyContent: "center",
    marginLeft: theme.spacing.md,
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

  // FAB - Removido fabPressed (não é mais necessário)
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

  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  menuContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: theme.spacing.xl,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  menuTitle: {
    ...typography.body,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    flex: 1,
    marginRight: theme.spacing.md,
  },

  menuItems: {
    paddingTop: theme.spacing.sm,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 60,
  },

  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(124, 252, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },

  menuIconDanger: {
    backgroundColor: "rgba(255, 65, 54, 0.1)",
  },

  menuItemText: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    flex: 1,
  },

  menuItemTextDanger: {
    color: theme.colors.error,
  },

  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 72,
  },

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
