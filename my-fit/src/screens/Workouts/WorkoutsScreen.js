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
 * Componente de Card de Treino
 * Separado para melhor controle de eventos
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
        android_ripple={{ color: "rgba(124, 252, 0, 0.1)" }}
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

      {/* Botão de deletar - Completamente separado */}
      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
          isDeleting && styles.deleteButtonDisabled,
        ]}
        onPress={handleDeletePress}
        disabled={isDeleting}
        android_ripple={{ color: "rgba(255, 65, 54, 0.2)" }}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color={theme.colors.error} />
        ) : (
          <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
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
   * Exibe o diálogo de confirmação para deletar treino
   */
  const confirmDeleteWorkout = (workoutId, workoutName) => {
    console.log("═══════════════════════════════════════");
    console.log("🗑️ INICIANDO PROCESSO DE DELEÇÃO");
    console.log("ID:", workoutId);
    console.log("Nome:", workoutName);
    console.log("═══════════════════════════════════════");

    Alert.alert(
      "Deletar Treino",
      `Tem certeza que deseja deletar "${workoutName}"?\n\nEsta ação não pode ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => {
            console.log("❌ Usuário cancelou a deleção");
          },
        },
        {
          text: "Deletar",
          style: "destructive",
          onPress: () => {
            console.log("✅ Usuário confirmou a deleção");
            executeDeleteWorkout(workoutId, workoutName);
          },
        },
      ],
      { cancelable: true }
    );
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
        const updated = prevWorkouts.filter(
          (workout) => workout.id !== workoutId
        );
        console.log("📋 Lista atualizada. Treinos restantes:", updated.length);
        return updated;
      });

      Alert.alert("Sucesso", `"${workoutName}" foi deletado com sucesso!`);
    } catch (error) {
      console.error("❌ ERRO AO DELETAR:", error);
      Alert.alert(
        "Erro",
        "Não foi possível deletar o treino. Tente novamente."
      );
    } finally {
      setDeletingId(null);
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
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={navigateToCreateWorkout}
        android_ripple={{ color: "rgba(0, 0, 0, 0.2)" }}
      >
        <Ionicons name="add" size={32} color={theme.colors.background} />
      </Pressable>
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
    // Adiciona elevação para Android
    elevation: 2,
  },

  // Área principal clicável
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

  // Botão de deletar
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
});

export default WorkoutsScreen;
