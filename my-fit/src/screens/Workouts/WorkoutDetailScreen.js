import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  getWorkoutById,
  deleteWorkout,
} from "../../services/supabase/workouts";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

const WorkoutDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { workoutId } = route.params;

  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkout();
  }, []);

  const loadWorkout = async () => {
    setIsLoading(true);
    const { data, error } = await getWorkoutById(workoutId);

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar o treino.");
      navigation.goBack();
      return;
    }

    setWorkout(data);
    setIsLoading(false);
  };

  const handleStartWorkout = () => {
    // Navegar para a tela de execução do treino
    navigation.navigate("ExecuteWorkout", { workoutId });
  };

  const handleEditWorkout = () => {
    navigation.navigate("CreateWorkout", { workoutId });
  };

  const handleDeleteWorkout = () => {
    Alert.alert(
      "Deletar Treino",
      `Tem certeza que deseja deletar "${workout.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteWorkout(workoutId);
            if (error) {
              Alert.alert("Erro", "Não foi possível deletar o treino.");
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return null;
  }

  const exercises = workout.workout_exercises || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleEditWorkout}>
          <Ionicons name="create-outline" size={28} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Info do Treino */}
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          {workout.description && (
            <Text style={styles.workoutDescription}>{workout.description}</Text>
          )}

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="barbell" size={20} color={theme.colors.primary} />
              <Text style={styles.metaText}>
                {exercises.length}{" "}
                {exercises.length === 1 ? "exercício" : "exercícios"}
              </Text>
            </View>

            {workout.frequency && (
              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.metaText}>{workout.frequency}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Lista de Exercícios */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercícios</Text>

          {exercises
            .sort((a, b) => a.order_index - b.order_index)
            .map((item, index) => (
              <View key={item.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumberContainer}>
                    <Text style={styles.exerciseNumber}>{index + 1}</Text>
                  </View>

                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>
                      {item.exercises.name}
                    </Text>
                    <Text style={styles.exerciseMuscle}>
                      {item.exercises.muscle_group}
                    </Text>
                  </View>
                </View>

                <View style={styles.exerciseDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Séries</Text>
                    <Text style={styles.detailValue}>{item.sets}</Text>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Reps</Text>
                    <Text style={styles.detailValue}>{item.reps}</Text>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Carga</Text>
                    <Text style={styles.detailValue}>{item.weight}kg</Text>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Descanso</Text>
                    <Text style={styles.detailValue}>{item.rest_seconds}s</Text>
                  </View>
                </View>
              </View>
            ))}
        </View>

        {/* Botão de Deletar */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteWorkout}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          <Text style={styles.deleteText}>Deletar Treino</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botão Flutuante de Iniciar */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={handleStartWorkout}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={24} color={theme.colors.background} />
        <Text style={styles.startButtonText}>Iniciar Treino</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
  },
  workoutInfo: {
    marginBottom: theme.spacing.xl,
  },
  workoutName: {
    ...typography.h1,
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  workoutDescription: {
    ...typography.body,
    color: theme.colors.textSecondary,
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  metaContainer: {
    flexDirection: "row",
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  metaText: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  exercisesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  exerciseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  exerciseNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(124, 252, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  exerciseNumber: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  exerciseMuscle: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  exerciseDetails: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: theme.spacing.sm,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    ...typography.body,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  detailDivider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.xs,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 65, 54, 0.1)",
    borderRadius: 12,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  deleteText: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.error,
    marginLeft: theme.spacing.sm,
  },
  startButton: {
    position: "absolute",
    bottom: theme.spacing.xl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: theme.spacing.md,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    gap: theme.spacing.sm,
  },
  startButtonText: {
    ...typography.body,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.background,
  },
});

export default WorkoutDetailScreen;
