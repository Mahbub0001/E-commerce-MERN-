import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api";
import { safeParseJSON } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = safeParseJSON(localStorage.getItem("novamart_user"), null);
    const sessionUser = safeParseJSON(sessionStorage.getItem("novamart_user"), null);
    return savedUser || sessionUser;
  });

  function saveSession(nextUser, token = "demo-jwt-token", rememberMe = true) {
    if (rememberMe) {
      localStorage.setItem("novamart_user", JSON.stringify(nextUser));
      localStorage.setItem("novamart_token", token);
      sessionStorage.removeItem("novamart_user");
      sessionStorage.removeItem("novamart_token");
    } else {
      sessionStorage.setItem("novamart_user", JSON.stringify(nextUser));
      sessionStorage.setItem("novamart_token", token);
      localStorage.removeItem("novamart_user");
      localStorage.removeItem("novamart_token");
    }

    setUser(nextUser);
  }

  async function login({ email, password, rememberMe = true }) {
    if (!email || !password) {
      throw new Error("Email and password required.");
    }

    const { data } = await api.post("/api/auth/login", { email, password });
    const nextUser = data?.data ?? data;
    saveSession(nextUser, nextUser.token, rememberMe);
    return nextUser;
  }

  async function register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new Error("Name, email, and password required.");
    }

    const { data } = await api.post("/api/auth/register", { name, email, password });
    const nextUser = data?.data ?? data;
    saveSession(nextUser, nextUser.token, true);
    return nextUser;
  }

  async function refreshProfile() {
    const { data } = await api.get("/api/auth/profile");
    const profile = data?.data ?? data;
    setUser(profile);
    if (localStorage.getItem("novamart_user")) {
      localStorage.setItem("novamart_user", JSON.stringify(profile));
    }
    if (sessionStorage.getItem("novamart_user")) {
      sessionStorage.setItem("novamart_user", JSON.stringify(profile));
    }
    return profile;
  }

  function logout() {
    localStorage.removeItem("novamart_user");
    localStorage.removeItem("novamart_token");
    sessionStorage.removeItem("novamart_user");
    sessionStorage.removeItem("novamart_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      refreshProfile,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
