import { supabase } from "./config";

/**
 * Busca todos os treinos do utilizador
 */
export const getWorkouts = async (userId) => {
  if (!userId) return { data: null, error: new Error("User ID obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("workouts")
      .select(
        `
        *,
        workout_exercises (
          id,
          order_index,
          sets,
          reps,
          weight,
          rest_seconds,
          exercises (
            id,
            name,
            muscle_group,
            equipment
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error("Erro ao buscar treinos:", e);
    return { data: null, error: e };
  }
};

/**
 * Busca um treino específico com seus exercícios
 */
export const getWorkoutById = async (workoutId) => {
  if (!workoutId)
    return { data: null, error: new Error("Workout ID obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("workouts")
      .select(
        `
        *,
        workout_exercises (
          id,
          order_index,
          sets,
          reps,
          weight,
          rest_seconds,
          exercises (
            id,
            name,
            muscle_group,
            equipment
          )
        )
      `
      )
      .eq("id", workoutId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error("Erro ao buscar treino:", e);
    return { data: null, error: e };
  }
};

/**
 * Cria um novo treino
 */
export const createWorkout = async (userId, workoutData) => {
  if (!userId) return { data: null, error: new Error("User ID obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        name: workoutData.name,
        description: workoutData.description,
        frequency: workoutData.frequency,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error("Erro ao criar treino:", e);
    return { data: null, error: e };
  }
};

/**
 * Atualiza um treino existente
 */
export const updateWorkout = async (workoutId, updates) => {
  if (!workoutId)
    return { data: null, error: new Error("Workout ID obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("workouts")
      .update(updates)
      .eq("id", workoutId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error("Erro ao atualizar treino:", e);
    return { data: null, error: e };
  }
};

/**
 * Deleta um treino
 */
export const deleteWorkout = async (workoutId) => {
  if (!workoutId) return { error: new Error("Workout ID obrigatório.") };

  try {
    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId);

    if (error) throw error;
    return { error: null };
  } catch (e) {
    console.error("Erro ao deletar treino:", e);
    return { error: e };
  }
};

/**
 * Adiciona um exercício ao treino
 */
export const addExerciseToWorkout = async (workoutId, exerciseData) => {
  if (!workoutId)
    return { data: null, error: new Error("Workout ID obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("workout_exercises")
      .insert({
        workout_id: workoutId,
        exercise_id: exerciseData.exercise_id,
        order_index: exerciseData.order_index,
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        weight: exerciseData.weight,
        rest_seconds: exerciseData.rest_seconds,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error("Erro ao adicionar exercício:", e);
    return { data: null, error: e };
  }
};

/**
 * Atualiza um exercício do treino
 */
export const updateWorkoutExercise = async (workoutExerciseId, updates) => {
  if (!workoutExerciseId)
    return { data: null, error: new Error("ID obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("workout_exercises")
      .update(updates)
      .eq("id", workoutExerciseId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error("Erro ao atualizar exercício:", e);
    return { data: null, error: e };
  }
};

/**
 * Remove um exercício do treino
 */
export const removeExerciseFromWorkout = async (workoutExerciseId) => {
  if (!workoutExerciseId) return { error: new Error("ID obrigatório.") };

  try {
    const { error } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("id", workoutExerciseId);

    if (error) throw error;
    return { error: null };
  } catch (e) {
    console.error("Erro ao remover exercício:", e);
    return { error: e };
  }
};

/**
 * Busca exercícios disponíveis (biblioteca de exercícios)
 */
export const getExercises = async (filters = {}) => {
  try {
    let query = supabase
      .from("exercises")
      .select("*")
      .order("name", { ascending: true });

    if (filters.muscle_group) {
      query = query.eq("muscle_group", filters.muscle_group);
    }

    if (filters.search) {
      query = query.ilike("name", `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    console.error("Erro ao buscar exercícios:", e);
    return { data: null, error: e };
  }
};
