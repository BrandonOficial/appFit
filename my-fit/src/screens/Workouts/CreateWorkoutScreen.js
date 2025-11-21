import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import {
  createWorkout,
  updateWorkout,
  getWorkoutById,
  addExerciseToWorkout,
  updateWorkoutExercise,
  removeExerciseFromWorkout,
  getExercises,
} from "../../services/supabase/workouts";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { theme } from "../../styles/theme";
import { typography } from "../../styles/typography";

// ============================================================================
// CONSTANTS
// ============================================================================

const MUSCLE_GROUPS = [
  { id: null, name: "Todos" },
  { id: "peito", name: "Peito" },
  { id: "costas", name: "Costas" },
  { id: "pernas", name: "Pernas" },
  { id: "ombros", name: "Ombros" },
  { id: "braços", name: "Braços" },
  { id: "abdomen", name: "Abdômen" },
];

// ============================================================================
// EXERCISE MODAL COMPONENT
// ============================================================================

const ExerciseModal = ({
  visible,
  onClose,
  onAddExercise,
  availableExercises,
  searchQuery,
  setSearchQuery,
  selectedMuscleGroup,
  setSelectedMuscleGroup,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Exercício</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar exercício..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Muscle Group Filters */}
          <View style={styles.filtersWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContainer}
            >
              {MUSCLE_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group.id || "all"}
                  style={[
                    styles.filterButton,
                    selectedMuscleGroup === group.id &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedMuscleGroup(group.id)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedMuscleGroup === group.id &&
                        styles.filterTextActive,
                    ]}
                  >
                    {group.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Exercise List */}
          <FlatList
            data={availableExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseOption}
                onPress={() => onAddExercise(item)}
              >
                <View style={styles.exerciseOptionIconContainer}>
                  <Ionicons
                    name="fitness"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <View style={styles.exerciseOptionInfo}>
                  <Text style={styles.exerciseOptionName}>{item.name}</Text>
                  <Text style={styles.exerciseOptionMuscle}>
                    {item.muscle_group}
                  </Text>
                </View>
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.exerciseList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

// ============================================================================
// EXERCISE CARD COMPONENT
// ============================================================================

const ExerciseCard = ({ exercise, index, onUpdate, onRemove }) => {
  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseIconContainer}>
          <Ionicons name="fitness" size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity onPress={() => onRemove(index)}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.exerciseParams}>
        <View style={styles.paramRow}>
          <View style={styles.paramItem}>
            <Text style={styles.paramLabel}>Séries</Text>
            <TextInput
              style={styles.paramInput}
              value={String(exercise.sets)}
              onChangeText={(text) =>
                onUpdate(index, "sets", parseInt(text) || 0)
              }
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.paramItem}>
            <Text style={styles.paramLabel}>Repetições</Text>
            <TextInput
              style={styles.paramInput}
              value={String(exercise.reps)}
              onChangeText={(text) =>
                onUpdate(index, "reps", parseInt(text) || 0)
              }
              keyboardType="number-pad"
            />
          </View>
        </View>

        <View style={styles.paramRow}>
          <View style={styles.paramItem}>
            <Text style={styles.paramLabel}>Carga (kg)</Text>
            <TextInput
              style={styles.paramInput}
              value={String(exercise.weight)}
              onChangeText={(text) =>
                onUpdate(index, "weight", parseInt(text) || 0)
              }
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.paramItem}>
            <Text style={styles.paramLabel}>Descanso (s)</Text>
            <TextInput
              style={styles.paramInput}
              value={String(exercise.rest_seconds)}
              onChangeText={(text) =>
                onUpdate(index, "rest_seconds", parseInt(text) || 0)
              }
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CreateWorkoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const workoutId = route.params?.workoutId;
  const isEditing = !!workoutId;

  // State Management
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  useEffect(() => {
    if (isEditing) {
      loadWorkout();
    }
    loadAvailableExercises();
  }, []);

  useEffect(() => {
    loadAvailableExercises();
  }, [searchQuery, selectedMuscleGroup]);

  const loadWorkout = async () => {
    const { data, error } = await getWorkoutById(workoutId);
    if (error) {
      Alert.alert("Erro", "Não foi possível carregar o treino.");
      navigation.goBack();
      return;
    }

    setWorkoutName(data.name);
    setWorkoutDescription(data.description || "");
    setFrequency(data.frequency || "");

    const mappedExercises = data.workout_exercises.map((we) => ({
      id: we.id,
      exercise_id: we.exercises.id,
      name: we.exercises.name,
      muscle_group: we.exercises.muscle_group,
      sets: we.sets,
      reps: we.reps,
      weight: we.weight,
      rest_seconds: we.rest_seconds,
      order_index: we.order_index,
    }));

    setExercises(mappedExercises);
  };

  const loadAvailableExercises = async () => {
    const { data, error } = await getExercises({
      search: searchQuery,
      muscle_group: selectedMuscleGroup,
    });
    if (!error && data) {
      setAvailableExercises(data);
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSaveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Erro", "Por favor, dê um nome ao treino.");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Erro", "Adicione pelo menos um exercício ao treino.");
      return;
    }

    setIsLoading(true);

    try {
      let finalWorkoutId = workoutId;

      if (isEditing) {
        await updateWorkout(workoutId, {
          name: workoutName,
          description: workoutDescription,
          frequency: frequency,
        });
      } else {
        const { data, error } = await createWorkout(user.id, {
          name: workoutName,
          description: workoutDescription,
          frequency: frequency,
        });
        if (error) throw error;
        finalWorkoutId = data.id;
      }

      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];

        if (exercise.id) {
          await updateWorkoutExercise(exercise.id, {
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            rest_seconds: exercise.rest_seconds,
            order_index: i,
          });
        } else {
          await addExerciseToWorkout(finalWorkoutId, {
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            rest_seconds: exercise.rest_seconds,
            order_index: i,
          });
        }
      }

      Alert.alert(
        "Sucesso",
        `Treino ${isEditing ? "atualizado" : "criado"} com sucesso!`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      console.error("Erro ao salvar treino:", e);
      Alert.alert("Erro", "Não foi possível salvar o treino.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      exercise_id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: 3,
      reps: 10,
      weight: 0,
      rest_seconds: 60,
      order_index: exercises.length,
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseModal(false);
  };

  const handleRemoveExercise = async (index) => {
    const exercise = exercises[index];

    if (exercise.id) {
      await removeExerciseFromWorkout(exercise.id);
    }

    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleUpdateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? "Editar Treino" : "Montar Treino"}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Workout Info */}
        <Input
          label="Nome do Treino"
          placeholder="Ex: Treino de Peito e Tríceps"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        <Input
          label="Descrição (opcional)"
          placeholder="Foco em força."
          value={workoutDescription}
          onChangeText={setWorkoutDescription}
        />

        <Input
          label="Frequência (opcional)"
          placeholder="Ex: 3x por semana"
          value={frequency}
          onChangeText={setFrequency}
        />

        {/* Exercises Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercícios Adicionados</Text>

          {exercises.length === 0 ? (
            <View style={styles.emptyExercises}>
              <Ionicons
                name="barbell-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyText}>Nenhum exercício adicionado</Text>
            </View>
          ) : (
            exercises.map((exercise, index) => (
              <ExerciseCard
                key={index}
                exercise={exercise}
                index={index}
                onUpdate={handleUpdateExercise}
                onRemove={handleRemoveExercise}
              />
            ))
          )}

          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowExerciseModal(true)}
          >
            <Ionicons
              name="add-circle"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.addExerciseText}>Adicionar Exercício</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? "Atualizar Treino" : "Salvar Treino"}
            onPress={handleSaveWorkout}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>

      {/* Exercise Modal */}
      <ExerciseModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onAddExercise={handleAddExercise}
        availableExercises={availableExercises}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedMuscleGroup={selectedMuscleGroup}
        setSelectedMuscleGroup={setSelectedMuscleGroup}
      />
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
  scrollContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  headerTitle: {
    ...typography.h1,
    fontSize: theme.fontSizes.xl,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },

  // Exercise Card
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
  exerciseIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(124, 252, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  exerciseName: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    flex: 1,
  },
  exerciseParams: {
    gap: theme.spacing.sm,
  },
  paramRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  paramItem: {
    flex: 1,
  },
  paramLabel: {
    ...typography.label,
    marginBottom: 4,
  },
  paramInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    textAlign: "center",
  },

  // Empty State
  emptyExercises: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },

  // Add Exercise Button
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124, 252, 0, 0.1)",
    borderRadius: 12,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: "dashed",
  },
  addExerciseText: {
    ...typography.body,
    color: theme.colors.primary,
    fontWeight: "700",
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "85%",
    paddingTop: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...typography.h1,
    fontSize: theme.fontSizes.xl,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    height: 50,
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

  // Filters
  filtersWrapper: {
    marginBottom: theme.spacing.md,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingRight: theme.spacing.xl, // Extra padding no final
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    minWidth: 80,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.background,
    fontWeight: "700",
  },

  // Exercise List
  exerciseList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  exerciseOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  exerciseOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(124, 252, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  exerciseOptionInfo: {
    flex: 1,
  },
  exerciseOptionName: {
    ...typography.body,
    fontSize: theme.fontSizes.md,
    fontWeight: "700",
    marginBottom: 2,
  },
  exerciseOptionMuscle: {
    ...typography.body,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
});

export default CreateWorkoutScreen;
