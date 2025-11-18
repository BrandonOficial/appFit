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

const CreateWorkoutScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  const workoutId = route.params?.workoutId;
  const isEditing = !!workoutId;

  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal de adicionar exercício
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);

  // Carregar treino se estiver editando
  useEffect(() => {
    if (isEditing) {
      loadWorkout();
    }
    loadAvailableExercises();
  }, []);

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

    // Mapear exercícios
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

  useEffect(() => {
    loadAvailableExercises();
  }, [searchQuery, selectedMuscleGroup]);

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

      // Criar ou atualizar treino
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

      // Adicionar/atualizar exercícios
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];

        if (exercise.id) {
          // Atualizar existente
          await updateWorkoutExercise(exercise.id, {
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            rest_seconds: exercise.rest_seconds,
            order_index: i,
          });
        } else {
          // Adicionar novo
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
      // Se já existe no BD, deletar
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

  const muscleGroups = [
    { id: null, name: "Todos" },
    { id: "peito", name: "Peito" },
    { id: "costas", name: "Costas" },
    { id: "pernas", name: "Pernas" },
    { id: "ombros", name: "Ombros" },
    { id: "braços", name: "Braços" },
    { id: "abdomen", name: "Abdômen" },
  ];

  // Renderizar exercício adicionado
  const renderExerciseItem = (exercise, index) => (
    <View key={index} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseIconContainer}>
          <Ionicons name="fitness" size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
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
                handleUpdateExercise(index, "sets", parseInt(text) || 0)
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
                handleUpdateExercise(index, "reps", parseInt(text) || 0)
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
                handleUpdateExercise(index, "weight", parseInt(text) || 0)
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
                handleUpdateExercise(index, "rest_seconds", parseInt(text) || 0)
              }
              keyboardType="number-pad"
            />
          </View>
        </View>
      </View>
    </View>
  );

  // Modal de seleção de exercício
  const ExerciseModal = () => (
    <Modal
      visible={showExerciseModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowExerciseModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Exercício</Text>
            <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
              <Ionicons name="close" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Busca */}
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
          </View>

          {/* Filtros por grupo muscular */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {muscleGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.filterButton,
                  selectedMuscleGroup === group.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedMuscleGroup(group.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedMuscleGroup === group.id && styles.filterTextActive,
                  ]}
                >
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de exercícios */}
          <FlatList
            data={availableExercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseOption}
                onPress={() => handleAddExercise(item)}
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
          />
        </View>
      </View>
    </Modal>
  );

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

        {/* Nome do Treino */}
        <Input
          label="Nome do Treino"
          placeholder="Ex: Treino de Peito e Tríceps"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        {/* Descrição (opcional) */}
        <Input
          label="Descrição (opcional)"
          placeholder="Foco em força. 3x por semana"
          value={workoutDescription}
          onChangeText={setWorkoutDescription}
        />

        {/* Frequência (opcional) */}
        <Input
          label="Frequência (opcional)"
          placeholder="Ex: 3x por semana"
          value={frequency}
          onChangeText={setFrequency}
        />

        {/* Seção de Exercícios */}
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
            exercises.map((exercise, index) =>
              renderExerciseItem(exercise, index)
            )
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

        {/* Botão Salvar */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEditing ? "Atualizar Treino" : "Salvar Treino"}
            onPress={handleSaveWorkout}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>

      {/* Modal */}
      <ExerciseModal />
    </SafeAreaView>
  );
};

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
  emptyExercises: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
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
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    ...typography.h1,
    fontSize: theme.fontSizes.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
  },
  filtersContainer: {
    marginBottom: theme.spacing.md,
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
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
  exerciseList: {
    paddingBottom: theme.spacing.lg,
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
