import "react-native-url-polyfill/auto"; // Necessário para o Supabase
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// 1. Lê as tuas variáveis de ambiente
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 2. Verifica se as variáveis existem
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis de ambiente do Supabase (URL e ANON_KEY) não estão definidas."
  );
}

// 3. Cria e exporta o cliente Supabase
// Passamos o AsyncStorage para que o Supabase possa guardar a sessão
// do utilizador de forma persistente no React Native.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Desligar isto para React Native
  },
});
