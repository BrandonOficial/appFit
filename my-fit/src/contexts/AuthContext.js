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

  // Função helper para carregar perfil
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

  // Função de avatar
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

  // Inicialização e listener de auth
  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          if (session) {
            setUser(session.user);
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Erro ao obter sessão:", e);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event); // Debug

        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user.id);
          } else {
            setUser(null);
            setUserProfile(null);
          }
          // IMPORTANTE: Resetar loading após mudança de auth
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- Funções de Autenticação (Corrigidas) ---

  // Função de Login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await signInWithPassword(email, password);

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      // O onAuthStateChange vai cuidar do resto
      // Mas vamos dar um timeout de segurança
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return true;
    } catch (e) {
      console.error("Erro inesperado no login:", e);
      setError(e.message);
      setIsLoading(false);
      return false;
    }
  };

  // Função de Registo
  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await signUp(name, email, password);

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      // O onAuthStateChange vai cuidar do resto
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return true;
    } catch (e) {
      console.error("Erro inesperado no register:", e);
      setError(e.message);
      setIsLoading(false);
      return false;
    }
  };

  // Função de Logout
  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signOut();

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      // Limpar estados imediatamente
      setUser(null);
      setUserProfile(null);

      // O onAuthStateChange também vai disparar, mas vamos garantir
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return true;
    } catch (e) {
      console.error("Erro inesperado no logout:", e);
      setError(e.message);
      setIsLoading(false);
      return false;
    }
  };

  // --- Valor a Partilhar ---
  const value = {
    user,
    userProfile,
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
