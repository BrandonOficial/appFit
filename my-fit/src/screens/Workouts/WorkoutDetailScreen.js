// src/screens/Workouts/WorkoutDetailScreen.js - ATUALIZADO

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
import ExerciseImage from "../../components/common/ExerciseImage";
import { getExerciseImage } from "../../constants/exerciseImages";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatExerciseDetails = (sets, reps, weight, rest) => {
  return `${sets}x ${reps} reps | ${weight}kg | ${rest}s descanso`;
};

// ============================================================================
// EXERCISE ITEM COMPONENT - ATUALIZADO COM IMAGEM
// ============================================================================

const ExerciseItem = ({ exercise, index }) => {
  const imageUrl = getExerciseImage(exercise.exercises.name);
  const details = formatExerciseDetails(
    exercise.sets,
    exercise.reps,
    exercise.weight,
    exercise.rest_seconds
  );

  return (
    <View style={styles.exerciseItem}>
      {/* Exercise Image */}
      <ExerciseImage
        source={imageUrl}
        width={64}
        height={64}
        borderRadius={12}
        showOverlay={false}
      />

      {/* Exercise Info */}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.exercises.name}</Text>
        <Text style={styles.exerciseDetails}>{details}</Text>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

  const handleGoBack = () => {
    navigation.goBack();
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

  const handleStartWorkout = () => {
    navigation.navigate("ExecuteWorkout", { workoutId });
  };

  const handleSaveWorkout = () => {
    Alert.alert("Salvar", "Alterações salvas com sucesso!");
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
  const sortedExercises = exercises.sort(
    (a, b) => a.order_index - b.order_index
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{workout.name}</Text>

        <TouchableOpacity
          onPress={handleEditWorkout}
          style={styles.headerButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="create-outline"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedExercises.map((exercise, index) => (
          <ExerciseItem key={exercise.id} exercise={exercise} index={index} />
        ))}
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveWorkout}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Iniciar Treino</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },

  headerButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    ...typography.h1,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: 120,
  },

  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },

  exerciseInfo: {
    flex: 1,
    justifyContent: "center",
  },

  exerciseName: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 4,
  },

  exerciseDetails: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },

  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  saveButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },

  saveButtonText: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.primary,
  },

  startButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },

  startButtonText: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    color: theme.colors.background,
  },
});

export default WorkoutDetailScreen;
