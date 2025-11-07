import React, { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../services/supabase/config";
// 1. Importar TODOS os nossos serviços de auth
import { signInWithPassword, signOut, signUp } from "../services/supabase/auth";

// Criar o Contexto
const AuthContext = createContext();

// Criar o Provedor (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Começa true para verificar sessão
  const [error, setError] = useState(null);

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
        }
      } catch (e) {
        console.error("Erro ao obter sessão:", e);
      } finally {
        setIsLoading(false); // Terminámos a verificação inicial
      }
    };
    getSession();

    // II. Configura o "ouvinte" (listener)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Função de limpeza: remove o "ouvinte"
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // [] = Corre apenas uma vez no arranque

  // --- Funções de Autenticação ---

  // Função de Login (Existente)
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await signInWithPassword(email, password);
    if (error) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  // Função de Registo (NOVA)
  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null); // Limpa erros antigos

    // Chama o serviço signUp
    const { data, error } = await signUp(name, email, password);

    if (error) {
      setError(error.message); // Guarda a mensagem de erro
      setIsLoading(false);
      return false; // Indica que o registo falhou
    }

    // Sucesso!
    setIsLoading(false);
    return true; // Indica que o registo foi um sucesso
  };

  // Função de Logout (Existente)
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await signOut();
    if (error) {
      setError(error.message);
    }
    setIsLoading(false);
  };

  // --- Valor a Partilhar ---
  const value = {
    user,
    isLoading,
    error,
    isLoggedIn: !!user, // true se 'user' existir, false se for nulo
    login,
    logout,
    register, // <-- A nossa nova função!
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado (Existente)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
