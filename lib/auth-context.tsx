"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types/database"
import { mockUser, mockAdminUser } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isAuthenticated = !!user && !isLoading

  useEffect(() => {
    // Check for stored session
    try {
      const storedUser = localStorage.getItem("auth_user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      }
    } catch (error) {
      console.error("[v0] Error loading stored user:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" }
      }

      // Store user and token
      localStorage.setItem("auth_user", JSON.stringify(data.data.user))
      localStorage.setItem("authToken", data.data.token)
      setUser(data.data.user)
      console.log("Login Data:", data.data.user);
      console.log("Login isAuthenticated:", isAuthenticated);
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An error occurred during login" }
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" }
      }

      // Store user and token
      localStorage.setItem("auth_user", JSON.stringify(data.user))
      localStorage.setItem("authToken", data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An error occurred during registration" }
    }
  }

  const logout = async () => {
    // await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("authToken")
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return { success: false, error: "Not authenticated" }

    const updatedUser = { ...user, ...data, updated_at: new Date().toISOString() }
    setUser(updatedUser)
    localStorage.setItem("auth_user", JSON.stringify(updatedUser))
    return { success: true }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
