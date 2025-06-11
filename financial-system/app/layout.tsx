import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { AxiosInterceptor } from "@/lib/axios-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FinanceApp - Sistema Financeiro",
  description: "Sistema completo para gestão financeira pessoal",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <AxiosInterceptor>{children}</AxiosInterceptor>
        </AuthProvider>
      </body>
    </html>
  )
}
