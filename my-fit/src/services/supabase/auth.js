import { supabase } from "./config";

/**
 * Tenta autenticar um utilizador com email e senha.
 */
export const signInWithPassword = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Erro no login (Supabase Service):", error.message);
  }
  return { data, error };
};

/**
 * Regista um novo utilizador com nome, email e senha.
 * @param {string} name - O nome completo do utilizador. (O 1º ARGUMENTO)
 * @param {string} email - O email para o novo utilizador. (O 2º ARGUMENTO)
 * @param {string} password - A senha para o novo utilizador. (O 3º ARGUMENTO)
 */
export const signUp = async (name, email, password) => {
  // 1. A função deve aceitar 'name', 'email', 'password'

  const { data, error } = await supabase.auth.signUp({
    // 2. O 'email' que o Supabase recebe é o 2º argumento
    email: email,
    // 3. O 'password' que o Supabase recebe é o 3º argumento
    password: password,

    options: {
      data: {
        // 4. O 'name' (1º argumento) é guardado aqui
        full_name: name,
      },
    },
  });

  if (error) {
    // Esta linha é a que te está a mostrar o erro agora
    console.error("Erro no registo (Supabase Service):", error.message);
  } else {
    console.log("Registo bem-sucedido (Supabase Service):", data.user.email);
  }
  return { data, error };
};

/**
 * Desconecta o utilizador atual.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro no logout (Supabase Service):", error.message);
  }
  return { error };
};
