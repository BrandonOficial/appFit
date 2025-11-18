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
 * Deleta um treino - VERSÃO COM DIAGNÓSTICO COMPLETO
 */
export const deleteWorkout = async (workoutId) => {
  console.log("═══════════════════════════════════════");
  console.log("🔵 INICIANDO DELETE DE TREINO");
  console.log("═══════════════════════════════════════");

  if (!workoutId) {
    console.error("❌ ERRO: ID não fornecido");
    return { error: new Error("Workout ID obrigatório.") };
  }

  console.log("📍 Workout ID:", workoutId);

  try {
    // PASSO 1: Verificar usuário autenticado
    console.log("\n--- PASSO 1: Verificar Autenticação ---");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ Erro de autenticação:", authError);
      return { error: authError };
    }

    if (!user) {
      console.error("❌ Usuário não autenticado");
      return { error: new Error("Usuário não autenticado") };
    }

    console.log("✅ Usuário autenticado:", user.id);

    // PASSO 2: Verificar se o treino existe e pertence ao usuário
    console.log("\n--- PASSO 2: Verificar Treino ---");
    const { data: workout, error: selectError } = await supabase
      .from("workouts")
      .select("id, name, user_id")
      .eq("id", workoutId)
      .maybeSingle();

    if (selectError) {
      console.error("❌ Erro ao buscar treino:", selectError);
      console.error("   Código:", selectError.code);
      console.error("   Mensagem:", selectError.message);
      return { error: selectError };
    }

    if (!workout) {
      console.error("❌ Treino não encontrado");
      return { error: new Error("Treino não encontrado") };
    }

    console.log("✅ Treino encontrado:");
    console.log("   Nome:", workout.name);
    console.log("   User ID do treino:", workout.user_id);
    console.log("   User ID autenticado:", user.id);
    console.log("   Pertence ao usuário?", workout.user_id === user.id);

    // PASSO 3: Verificar exercícios relacionados
    console.log("\n--- PASSO 3: Verificar Exercícios Relacionados ---");
    const { data: exercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select("id")
      .eq("workout_id", workoutId);

    if (exercisesError) {
      console.error("❌ Erro ao buscar exercícios:", exercisesError);
    } else {
      console.log("📋 Exercícios relacionados:", exercises?.length || 0);
    }

    // PASSO 4: Tentar deletar os exercícios primeiro (manual)
    console.log("\n--- PASSO 4: Deletar Exercícios (Manual) ---");
    const { error: deleteExercisesError } = await supabase
      .from("workout_exercises")
      .delete()
      .eq("workout_id", workoutId);

    if (deleteExercisesError) {
      console.error("❌ Erro ao deletar exercícios:", deleteExercisesError);
      console.error("   Código:", deleteExercisesError.code);
      console.error("   Mensagem:", deleteExercisesError.message);
      return { error: deleteExercisesError };
    }

    console.log("✅ Exercícios deletados com sucesso");

    // PASSO 5: Deletar o treino
    console.log("\n--- PASSO 5: Deletar Treino ---");
    const { data: deletedData, error: deleteError } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId)
      .select();

    if (deleteError) {
      console.error("❌ ERRO AO DELETAR TREINO:");
      console.error("   Código:", deleteError.code);
      console.error("   Mensagem:", deleteError.message);
      console.error("   Detalhes:", deleteError.details);
      console.error("   Hint:", deleteError.hint);
      console.error("   Objeto completo:", deleteError);
      return { error: deleteError };
    }

    console.log("✅ Treino deletado com sucesso!");
    console.log("   Dados retornados:", deletedData);

    // PASSO 6: Verificar se realmente deletou
    console.log("\n--- PASSO 6: Verificar Deleção ---");
    const { data: checkData, error: checkError } = await supabase
      .from("workouts")
      .select("id")
      .eq("id", workoutId)
      .maybeSingle();

    if (checkError) {
      console.log(
        "⚠️ Erro ao verificar (pode ser normal):",
        checkError.message
      );
    }

    if (!checkData) {
      console.log("✅ CONFIRMADO: Treino foi deletado do banco de dados");
    } else {
      console.error("❌ PROBLEMA: Treino ainda existe no banco!");
    }

    console.log("═══════════════════════════════════════");
    console.log("🎉 DELETE CONCLUÍDO");
    console.log("═══════════════════════════════════════\n");

    return { error: null, data: deletedData };
  } catch (e) {
    console.error("\n❌ EXCEÇÃO CAPTURADA:");
    console.error("   Mensagem:", e.message);
    console.error("   Nome:", e.name);
    console.error("   Stack:", e.stack);
    console.log("═══════════════════════════════════════\n");
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
