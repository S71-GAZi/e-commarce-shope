"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { IUser } from "./types/database"
import { mockUser, mockAdminUser } from "./mock-data"
import { cookies } from "next/headers";

interface AuthContextType {
  user: IUser | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<IUser>) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isAuthenticated = !!user && !isLoading
  const [accessToken, setAccessToken] = useState<string | null>(null)


  // useEffect(() => {
  //   // Check for stored session
  //   try {
  //     const storedUser = localStorage.getItem("auth_user")
  //     if (storedUser) {
  //       const parsedUser = JSON.parse(storedUser)
  //       setUser(parsedUser)
  //     }
  //   } catch (error) {
  //     console.error("[v0] Error loading stored user:", error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }, [])

  useEffect(() => {
    const refreshSession = async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        })

        if (!res.ok) {
          setIsLoading(false)
          return
        }

        const data = await res.json()
        console.log("Refresh Token data", data)
        setAccessToken(data.accessToken)
        setUser(data.user)
      } catch (err) {
        console.error("Refresh failed:", err)
      } finally {
        setIsLoading(false)
      }
    }

    refreshSession()
  }, [])


  // const login = async (email: string, password: string) => {
  //   try {
  //     const response = await fetch("/api/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     })

  //     const data = await response.json()

  //     if (!response.ok) {
  //       return { success: false, error: data.error || "Login failed" }
  //     }
  //     // Store user and token
  //      localStorage.setItem("auth_user", JSON.stringify(data.data.user))
  //     // localStorage.setItem("authToken", data.data.token)
  //     setUser(data.data.user)
  //     return { success: true }
  //   } catch (error) {
  //     console.error("Login error:", error)
  //     return { success: false, error: "An error occurred during login" }
  //   }
  // }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || "Login failed" }
      }
      console.log("Login user :", data);
      setUser(data.data.user)
      setAccessToken(data.data.token)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Login error" }
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
      // localStorage.setItem("auth_user", JSON.stringify(data.user))
      // localStorage.setItem("authToken", data.token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An error occurred during registration" }
    }
  }

  // const logout = async () => {
  //   // await supabase.auth.signOut()
  //   setUser(null)
  //   localStorage.removeItem("auth_user")
  //   localStorage.removeItem("authToken")
  // }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })

    setUser(null)
    setAccessToken(null)
  }

  const updateProfile = async (data: Partial<IUser>) => {
    if (!user) return { success: false, error: "Not authenticated" }

    const updatedUser = { ...user, ...data, updated_at: new Date().toISOString() }
    setUser(updatedUser)
    //localStorage.setItem("auth_user", JSON.stringify(updatedUser))
    return { success: true }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
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
