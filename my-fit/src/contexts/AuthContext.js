import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../services/supabase/config";
import { signInWithPassword, signOut, signUp } from "../services/supabase/auth";
import { getProfile, updateProfile } from "../services/supabase/users";
import { uploadAvatar } from "../services/supabase/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // A tua excelente função helper (perfeita, sem alterações)
  const loadUserProfile = async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return;
    }
    const { data, error } = await getProfile(userId);
    if (error) {
      console.error("Erro ao carregar perfil:", error.message);
      setUserProfile(null);
    } else {
      setUserProfile(data);
    }
  };

  // A tua função de avatar (perfeita, sem alterações)
  const updateAvatar = async (fileUri) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Upload
      const { data: uploadData, error: uploadError } = await uploadAvatar(
        fileUri,
        user.id
      );
      if (uploadError) throw uploadError;

      // 2. Obter URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);
      if (!urlData.publicUrl) {
        throw new Error("Não foi possível obter o URL público.");
      }
      const newAvatarUrl = urlData.publicUrl;

      // 3. Atualizar Tabela 'profiles'
      const { data: profileData, error: updateError } = await updateProfile(
        user.id,
        { avatar_url: newAvatarUrl }
      );
      if (updateError) throw updateError;

      // 4. Atualizar estado local
      setUserProfile(profileData);
    } catch (e) {
      console.error("Erro no updateAvatar (Context):", e.message);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // O "Guardião" (Atualizado para lidar com o loading do perfil)
  useEffect(() => {
    setIsLoading(true);
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          await loadUserProfile(session.user.id); // Carrega o perfil
        }
      } catch (e) {
        console.error("Erro ao obter sessão:", e);
      } finally {
        setIsLoading(false); // Termina o loading inicial
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- Funções de Autenticação (Otimizadas) ---

  // Função de Login (Otimizada)
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await signInWithPassword(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false); // Parar o loading SÓ se houver erro
    }
    // Se o login for bem-sucedido, o 'onAuthStateChange'
    // vai tratar de chamar o 'loadUserProfile' e
    // o 'useEffect' (no arranque) já trata o 'setIsLoading(false)'
  };

  // Função de Registo (Otimizada)
  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await signUp(name, email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false); // Parar o loading SÓ se houver erro
      return false;
    }

    // Se o registo for bem-sucedido, o 'onAuthStateChange'
    // vai tratar de chamar o 'loadUserProfile'.
    // O 'setIsLoading(false)' será tratado pelo 'onAuthStateChange'
    // ou pelo 'useEffect' inicial.

    // (Poderíamos pôr setIsLoading(false) aqui, mas é mais limpo
    // deixar o 'onAuthStateChange' ou o 'getSession' gerir o loading)

    // No entanto, vamos adicionar para o caso de o 'onAuthStateChange' ser mais lento:
    setIsLoading(false);
    return true;
  };

  // Função de Logout (Otimizada)
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await signOut();
    if (error) {
      setError(error.message);
      setIsLoading(false); // Parar o loading SÓ se houver erro
    }
    // O 'onAuthStateChange' vai tratar de limpar o 'user' e o 'userProfile'
    // e o 'useEffect' (no arranque) trata o 'setIsLoading(false)'.
  };

  // --- Valor a Partilhar ---
  const value = {
    user,
    userProfile, // Partilhar o perfil
    isLoading,
    error,
    isLoggedIn: !!user,
    login,
    logout,
    register,
    updateAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
