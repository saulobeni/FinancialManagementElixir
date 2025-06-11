"use client"

import type React from "react"

import axios from "axios"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AxiosInterceptor({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/")
        }
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [router])

  return <>{children}</>
}
