import { supabase } from "./config";

/**
 * Obtém os dados do perfil de um utilizador específico (da tabela 'profiles').
 * @param {string} userId - O ID do utilizador (vem de auth.user.id).
 * @returns {Promise<{ data: object, error: object }>}
 */
export const getProfile = async (userId) => {
  // Garantir que temos um ID
  if (!userId)
    return { data: null, error: new Error("User ID é obrigatório.") };

  try {
    // 1. Vai à tabela 'profiles'
    // 2. Seleciona as colunas 'full_name' e 'avatar_url'
    // 3. Onde o 'id' da tabela 'profiles' é igual ao userId que passámos
    // 4. '.single()' diz-nos que esperamos apenas 1 resultado (ou dá erro)
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (error) {
      // Isto pode acontecer se a RLS (Row Level Security) estiver a bloquear
      console.error("Erro ao buscar perfil (Supabase Service):", error.message);
    }

    return { data, error };
  } catch (e) {
    console.error("Erro inesperado em getProfile:", e);
    return { data: null, error: e };
  }
};
