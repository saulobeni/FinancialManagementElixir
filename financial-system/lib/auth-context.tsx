"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

interface User {
  id: string
  name: string
  email: string
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`
      }
    } catch (err) {
      console.error("Erro ao restaurar auth:", err)
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:4000/api/login", {
        email,
        password,
      })

      const { user: userData, token: userToken } = response.data

      setUser(userData)
      setToken(userToken)

      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))

      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`

      router.push("/home")
    } catch (error) {
      console.error("Erro no login:", error)
      throw new Error("Credenciais inválidas")
    }
  }

  const register = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:4000/api/register", {
        user: {
          email,
          name: email.split("@")[0], // Usa a parte do e-mail antes do @ como nome
          password,
        },
      })

      const { user: userData, token: userToken } = response.data

      setUser(userData)
      setToken(userToken)

      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))

      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`

      router.push("/home")
    } catch (error) {
      console.error("Erro no registro:", error)
      throw new Error("Erro ao registrar")
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete axios.defaults.headers.common["Authorization"]
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {!isLoading && children}
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
