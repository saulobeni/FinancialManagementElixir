"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Tag,
} from "lucide-react"
import { PrivateRoute } from "@/components/private-route"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { useAuth } from "@/lib/auth-context"

interface Transaction {
  id: number
  value: string
  type: "DESPESA" | "RECEITA"
  description: string
}

interface TagType {
  id: number
  name: string
}

interface DashboardStats {
  totalTransactions: number
  totalTags: number
  balance: number
  DESPESA: number
  RECEITA: number
}

function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    totalTags: 0,
    balance: 0,
    DESPESA: 0,
    RECEITA: 0,
  })

  const { user } = useAuth()
  const hasFetchedRef = useRef(false) // 🔒 controle para evitar chamadas duplicadas

  useEffect(() => {
    const fetchData = async () => {
      if (hasFetchedRef.current || !user?.id) return
      hasFetchedRef.current = true

      const token = getAuthToken()
      if (!token) return

      try {
        const headers = { Authorization: `Bearer ${token}` }

        const [transactionsRes, tagsRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/transactions/user/${user.id}`, { headers }),
          axios.get(`http://localhost:4000/api/tags/user/${user.id}`, { headers }),
        ])

        const transactions: Transaction[] = transactionsRes.data?.data || []
        const tags: TagType[] = tagsRes.data?.data || []

        const RECEITA = transactions
          .filter((t) => t.type === "RECEITA")
          .reduce((acc, t) => acc + parseFloat(t.value || "0"), 0)

        const DESPESA = transactions
          .filter((t) => t.type === "DESPESA")
          .reduce((acc, t) => acc + parseFloat(t.value || "0"), 0)

        const balance = RECEITA - DESPESA

        setStats({
          totalTransactions: transactions.length,
          totalTags: tags.length,
          DESPESA,
          RECEITA,
          balance,
        })
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
      }
    }

    fetchData()
  }, [user?.id]) // só executa quando user.id estiver pronto

  const quickActions = [
    {
      title: "Transações",
      description: "Controlar receitas e despesas",
      href: "/transactions",
      icon: CreditCard,
      color: "bg-emerald-500",
    },
    {
      title: "Categorias",
      description: "Organizar transações por categorias",
      href: "/tags",
      icon: Tag,
      color: "bg-purple-500",
    },
  ]

  return (
    <PrivateRoute>
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Visão geral do seu sistema financeiro</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  R$ {stats.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  R$ {stats.RECEITA.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  R$ {stats.DESPESA.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transações</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                <Card key={action.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link href={action.href}>Acessar</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </PrivateRoute>
  )
}
