import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../services/supabase/config";
// 1. Importar TODOS os nossos serviços de auth
import { signInWithPassword, signOut, signUp } from "../services/supabase/auth";
// 2. IMPORTAR O SERVIÇO DE PERFIL
import { getProfile } from "../services/supabase/users";

// Criar o Contexto
const AuthContext = createContext();

// Criar o Provedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // NOVO: Estado para o perfil
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega o perfil do utilizador da tabela 'profiles'
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

  // O "Guardião" - Verifica a sessão no arranque e ouve mudanças
  useEffect(() => {
    setIsLoading(true);

    // I. Tenta obter a sessão atual
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setUser(session.user);
          // NOVO: Carrega o perfil assim que temos o utilizador
          await loadUserProfile(session.user.id);
        }
      } catch (e) {
        console.error("Erro ao obter sessão:", e);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    // II. Configura o "ouvinte" (listener)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        // NOVO: Carrega o perfil quando há mudanças na autenticação
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Função de limpeza: remove o "ouvinte"
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // --- Funções de Autenticação ---

  // Função de Login
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await signInWithPassword(email, password);

    if (error) {
      setError(error.message);
    } else if (data?.user) {
      // Carrega o perfil após login bem-sucedido
      await loadUserProfile(data.user.id);
    }

    setIsLoading(false);
  };

  // Função de Registo
  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);

    const { data, error } = await signUp(name, email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return false;
    }

    // Se o registo foi bem-sucedido e temos um user
    if (data?.user) {
      await loadUserProfile(data.user.id);
    }

    setIsLoading(false);
    return true;
  };

  // Função de Logout
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await signOut();

    if (error) {
      setError(error.message);
    } else {
      setUserProfile(null); // Limpa o perfil ao fazer logout
    }

    setIsLoading(false);
  };

  // --- Valor a Partilhar ---
  const value = {
    user,
    userProfile, // NOVO: Partilhar o perfil
    isLoading,
    error,
    isLoggedIn: !!user,
    login,
    logout,
    register,
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
