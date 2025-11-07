import { supabase } from "./config";

/**
 * Obtém os dados do perfil de um utilizador (da tabela 'profiles').
 * Usamos .maybeSingle() para não dar erro se o perfil (ainda) não existir.
 */
export const getProfile = async (userId) => {
  if (!userId)
    return { data: null, error: new Error("User ID é obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)
      .maybeSingle(); // <-- Retorna null em vez de erro se não encontrar

    if (error) {
      console.error("Erro ao buscar perfil (Supabase Service):", error.message);
    }
    return { data, error };
  } catch (e) {
    console.error("Erro inesperado em getProfile:", e);
    return { data: null, error: e };
  }
};

/**
 * Atualiza os dados do perfil de um utilizador (ex: nome, avatar_url).
 */
export const updateProfile = async (userId, updates) => {
  if (!userId)
    return { data: null, error: new Error("User ID é obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates) // Atualiza os campos passados
      .eq("id", userId)
      .select() // Retorna a linha atualizada
      .single(); // Aqui usamos single() porque esperamos que a linha exista

    if (error) {
      console.error(
        "Erro ao atualizar perfil (Supabase Service):",
        error.message
      );
    }

    return { data, error };
  } catch (e) {
    console.error("Erro inesperado em updateProfile:", e);
    return { data: null, error: e };
  }
};
