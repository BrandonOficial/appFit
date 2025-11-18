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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { getWorkouts, deleteWorkout } from "../../services/supabase/workouts";
import { globalStyles } from "../../styles/globalStyles";
import { typography } from "../../styles/typography";
import { theme } from "../../styles/theme";

const WorkoutsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Função para carregar os treinos
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

  // Carregar treinos quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [user])
  );

  // Função de refresh
  const onRefresh = () => {
    setIsRefreshing(true);
    loadWorkouts();
  };

  // Função para deletar treino (CORRIGIDA)
  const handleDeleteWorkout = async (workoutId, workoutName) => {
    console.log("🗑️ Tentando deletar:", workoutId, workoutName);

    Alert.alert(
      "Deletar Treino",
      `Tem certeza que deseja deletar "${workoutName}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => console.log("❌ Cancelado"),
        },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🔵 Deletando treino:", workoutId);
              setDeletingId(workoutId);

              const { error } = await deleteWorkout(workoutId);

              if (error) {
                console.error("❌ Erro ao deletar:", error);
                throw error;
              }

              console.log("✅ Treino deletado com sucesso");

              // Atualizar a lista localmente (otimista)
              setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));

              // Recarregar para garantir sincronização
              await loadWorkouts();

              Alert.alert("Sucesso", "Treino deletado com sucesso!");
            } catch (error) {
              console.error("❌ Erro no delete:", error);
              Alert.alert(
                "Erro",
                "Não foi possível deletar o treino. Tente novamente."
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  // Renderizar item da lista
  const renderWorkoutItem = ({ item }) => {
    const exerciseCount = item.workout_exercises?.length || 0;
    const isDeleting = deletingId === item.id;

    return (
      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() =>
          navigation.navigate("WorkoutDetail", { workoutId: item.id })
        }
        activeOpacity={0.7}
        disabled={isDeleting}
      >
        <View style={styles.workoutHeader}>
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
              {exerciseCount} {exerciseCount === 1 ? "exercício" : "exercícios"}
              {item.frequency && ` • ${item.frequency}`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.menuButton, isDeleting && styles.menuButtonDisabled]}
            onPress={(e) => {
              e.stopPropagation(); // Previne que abra o detalhe
              handleDeleteWorkout(item.id, item.name);
            }}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.error}
              />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Estado de loading
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

  // Lista vazia
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="barbell-outline"
        size={64}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>Nenhum Treino</Text>
      <Text style={styles.emptyText}>
        Comece criando seu primeiro treino{"\n"}tocando no botão abaixo
      </Text>
    </View>
  );

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
        renderItem={renderWorkoutItem}
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
        ListEmptyComponent={EmptyState}
      />

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("CreateWorkout")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color={theme.colors.background} />
      </TouchableOpacity>
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
  workoutCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
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
  menuButton: {
    padding: theme.spacing.sm,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonDisabled: {
    opacity: 0.5,
  },
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
});

export default WorkoutsScreen;
