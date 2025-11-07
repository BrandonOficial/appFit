import { supabase } from "./config";

/**
 * Obtém os dados do perfil de um utilizador específico (da tabela 'profiles').
 * @param {string} userId - O ID do utilizador (vem de auth.user.id).
 * @returns {Promise<{ data: object, error: object }>}
 */
export const getProfile = async (userId) => {
  if (!userId)
    return { data: null, error: new Error("User ID é obrigatório.") };

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", userId)

      // --- A MUDANÇA ESTÁ AQUI ---
      // .single(); // <-- Isto falha se não encontrar nada
      .maybeSingle(); // <-- Isto devolve 'null' se não encontrar nada (sem erro)
    // --- FIM DA MUDANÇA ---

    if (error) {
      // Se tivermos um erro (ex: RLS a bloquear), vamos registá-lo
      console.error("Erro ao buscar perfil (Supabase Service):", error.message);
    }

    return { data, error };
  } catch (e) {
    console.error("Erro inesperado em getProfile:", e);
    return { data: null, error: e };
  }
};
