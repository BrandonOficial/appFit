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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { getWorkouts, deleteWorkout } from "../../services/supabase/workouts";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";
import Button from "../../components/common/Button";

/**
 * Modal de Confirmação de Deleção
 */
const DeleteConfirmationModal = ({ visible, workoutName, onConfirm, onCancel }) => {
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
 * Componente de Card de Treino
 */
const WorkoutCard = ({ item, onPress, onDelete, isDeleting }) => {
  const exerciseCount = item.workout_exercises?.length || 0;
  
  const getExerciseCountText = (count) => {
    return `${count} ${count === 1 ? "exercício" : "exercícios"}`;
  };

  const handleCardPress = () => {
    console.log("🔵 Card pressionado:", item.name);
    onPress(item.id);
  };

  const handleDeletePress = () => {
    console.log("🗑️ Botão deletar pressionado:", item.name);
    onDelete(item.id, item.name);
  };

  return (
    <View style={styles.workoutCard}>
      {/* Área principal clicável */}
      <Pressable
        style={styles.workoutMainArea}
        onPress={handleCardPress}
        android_ripple={{ color: 'rgba(124, 252, 0, 0.1)' }}
        disabled={isDeleting}
      >
        <View style={styles.workoutIconContainer}>
          <Ionicons name="barbell" size={24} color={theme.colors.primary} />
        </View>

        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{item.name}</Text>
          
          {item.description && (
            <Text style={styles.workoutDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          
          <Text style={styles.workoutMeta}>
            {getExerciseCountText(exerciseCount)}
            {item.frequency && ` • ${item.frequency}`}
          </Text>
        </View>
      </Pressable>

      {/* Botão de deletar */}
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
          isDeleting && styles.deleteButtonDisabled,
        ]}
        onPress={handleDeletePress}
        disabled={isDeleting}
        android_ripple={{ color: 'rgba(255, 65, 54, 0.2)' }}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={theme.colors.error} />
        ) : (
          <Ionicons
            name="trash-outline"
            size={22}
            color={theme.colors.error}
          />
        )}
      </Pressable>
    </View>
  );
};

const WorkoutsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Estado do modal de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);

  /**
   * Carrega a lista de treinos do usuário
   */
  const loadWorkouts = async () => {
    if (!user) return;

    try {
      console.log("🔵 Carregando treinos para:", user.id);
      const { data, error } = await getWorkouts(user.id);

      if (error) {
        console.error("❌ Erro ao carregar:", error);
        throw error;
      }

      console.log("✅ Treinos carregados:", data?.length || 0);
      setWorkouts(data || []);
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
    console.log("📍 Navegando para detalhes:", workoutId);
    navigation.navigate("WorkoutDetail", { workoutId });
  };

  /**
   * Navega para a tela de criação de treino
   */
  const navigateToCreateWorkout = () => {
    navigation.navigate("CreateWorkout");
  };

  /**
   * Abre o modal de confirmação de deleção
   */
  const confirmDeleteWorkout = (workoutId, workoutName) => {
    console.log("═══════════════════════════════════════");
    console.log("🗑️ INICIANDO PROCESSO DE DELEÇÃO");
    console.log("ID:", workoutId);
    console.log("Nome:", workoutName);
    console.log("═══════════════════════════════════════");

    setWorkoutToDelete({ id: workoutId, name: workoutName });
    setShowDeleteModal(true);
  };

  /**
   * Cancela a deleção
   */
  const handleCancelDelete = () => {
    console.log("❌ Usuário cancelou a deleção");
    setShowDeleteModal(false);
    setWorkoutToDelete(null);
  };

  /**
   * Confirma e executa a deleção
   */
  const handleConfirmDelete = () => {
    console.log("✅ Usuário confirmou a deleção");
    setShowDeleteModal(false);
    
    if (workoutToDelete) {
      executeDeleteWorkout(workoutToDelete.id, workoutToDelete.name);
    }
  };

  /**
   * Executa a deleção do treino
   */
  const executeDeleteWorkout = async (workoutId, workoutName) => {
    console.log("🔄 Executando deleção...");
    
    try {
      setDeletingId(workoutId);

      const { error } = await deleteWorkout(workoutId);

      if (error) {
        console.error("❌ Erro retornado do Supabase:", error);
        throw error;
      }

      console.log("✅ Treino deletado com sucesso no backend");

      // Atualizar a lista localmente
      setWorkouts((prevWorkouts) => {
        const updated = prevWorkouts.filter((workout) => workout.id !== workoutId);
        console.log("📋 Lista atualizada. Treinos restantes:", updated.length);
        return updated;
      });

      // Mostrar feedback de sucesso
      setTimeout(() => {
        Alert.alert("Sucesso", `"${workoutName}" foi deletado com sucesso!`);
      }, 300);

    } catch (error) {
      console.error("❌ ERRO AO DELETAR:", error);
      Alert.alert(
        "Erro",
        "Não foi possível deletar o treino. Tente novamente."
      );
    } finally {
      setDeletingId(null);
      setWorkoutToDelete(null);
      console.log("═══════════════════════════════════════\n");
    }
  };

  /**
   * Renderiza um card de treino
   */
  const renderWorkoutCard = ({ item }) => (
    <WorkoutCard
      item={item}
      onPress={navigateToWorkoutDetail}
      onDelete={confirmDeleteWorkout}
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
      <Text style={styles.emptyTitle}>Nenhum Treino</Text>
      <Text style={styles.emptyText}>
        Comece criando seu primeiro treino{"\n"}tocando no botão + abaixo
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.screenContainer}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando treinos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={typography.h1}>Meus Treinos</Text>
        <Text style={styles.subtitle}>
          {workouts.length} {workouts.length === 1 ? "treino" : "treinos"}
        </Text>
      </View>

      {/* Lista de Treinos */}
      <FlatList
        data={workouts}
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
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
        onPress={navigateToCreateWorkout}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.2)' }}
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  listContainer: {
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

  // Card do treino
  workoutCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    elevation: 2,
  },

  workoutMainArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
  },

  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(124, 252, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },

  workoutInfo: {
    flex: 1,
  },

  workoutName: {
    ...typography.body,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    marginBottom: 4,
  },

  workoutDescription: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },

  workoutMeta: {
    ...typography.body,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
  },

  deleteButton: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 65, 54, 0.1)",
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },

  deleteButtonPressed: {
    backgroundColor: "rgba(255, 65, 54, 0.2)",
  },

  deleteButtonDisabled: {
    opacity: 0.5,
  },

  // Floating Action Button
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