import React, { createContext, useState, useContext } from "react";

// 1. Criar o Contexto
const AuthContext = createContext();

// 2. Criar o Provedor (Provider)
// Este componente vai "embrulhar" a nossa aplicação
export const AuthProvider = ({ children }) => {
  // Vamos guardar o estado de autenticação.
  // No futuro, podemos guardar o token ou o objeto 'user' do Supabase.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Função para simular o login
  const login = () => {
    // Aqui, no futuro, chamaríamos o supabase.auth.signInWithPassword(...)
    console.log("Simulando login...");
    setIsLoggedIn(true);
  };

  // Função para simular o logout
  const logout = () => {
    // Aqui, chamaríamos o supabase.auth.signOut()
    console.log("Simulando logout...");
    setIsLoggedIn(false);
  };

  // 3. O valor que o contexto vai partilhar
  const value = {
    isLoggedIn,
    login,
    logout,
    // Podemos adicionar o 'user', 'loading', etc. aqui mais tarde
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Criar o Hook customizado (para facilitar o uso)
// Em vez de importar `useContext` e `AuthContext` em todos os ficheiros,
// apenas importamos `useAuth`.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
