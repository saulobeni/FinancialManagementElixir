"use client"

import { useState, useEffect } from "react"
import { PrivateRoute } from "@/components/private-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRef } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Tag,
} from "lucide-react"
import axios from "axios"
import { useAuth } from "@/lib/auth-context"

interface Transaction {
  id: number
  description: string
  value: number
  type: "RECEITA" | "DESPESA"
  date: string
  tags?: string[]
}

interface TagType {
  id: number
  name: string
}

const generateRandomColor = () => {
  const colors = [
    "bg-emerald-100 text-emerald-800",
    "bg-blue-100 text-blue-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-yellow-100 text-yellow-800",
    "bg-red-100 text-red-800",
    "bg-orange-100 text-orange-800",
    "bg-sky-100 text-sky-800",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null)
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState({
    description: "",
    value: "",
    type: "RECEITA" as "RECEITA" | "DESPESA",
    date: "",
  })

  const hasFetched = useRef(false)
  const { user } = useAuth()

useEffect(() => {
  if (!user?.id || hasFetched.current) return
  hasFetched.current = true

  fetchTransactions()
  fetchTags()
}, [user?.id])


const fetchTransactions = async (retry = true) => {
  if (!user?.id) {
    console.warn("Usuário não carregado, ignorando fetchTransactions")
    return
  }

  try {
    const response = await axios.get(
      `http://localhost:4000/api/transactions/user/${user.id}`
    )
    const rawData = response.data?.data ?? []

    const parsedData: Transaction[] = rawData.map((t: any) => ({
      ...t,
      value: parseFloat(t.value),
    }))

    setTransactions(parsedData)
  } catch (error: any) {
    console.error("Erro ao carregar transações:", error)

    if (retry) {
      // tenta uma vez após 1 segundo
      setTimeout(() => fetchTransactions(false), 1000)
    }
  } finally {
    setIsLoading(false)
  }
}


  const handleRemoveTag = async (transactionId: number, tagId: number) => {
  try {
    await axios.delete(`http://localhost:4000/api/transactions/${transactionId}/tags/${tagId}`)
    fetchTransactions()
  } catch (error) {
    console.error("Erro ao remover tag:", error)
  }
}

  const fetchTags = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/tags/user/${user?.id}`)
      setTags(response.data?.data || [])
    } catch (error) {
      console.error("Erro ao carregar tags:", error)
    }
  }

  const handleAddTags = async () => {
    if (!selectedTransactionId || selectedTags.length === 0) return

    try {
      await axios.post(`http://localhost:4000/api/transactions/${selectedTransactionId}/tags`, {
        tag_ids: selectedTags,
      })

      setIsTagDialogOpen(false)
      setSelectedTags([])
      setSelectedTransactionId(null)
      fetchTransactions()
    } catch (error) {
      console.error("Erro ao adicionar tags:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        description: formData.description,
        value: Number.parseFloat(formData.value),
        type: formData.type,
        date: formData.date + "T00:00:00",
      }

      if (editingTransaction) {
        await axios.put(
          `http://localhost:4000/api/transactions/${editingTransaction.id}`,
          { transaction: data }
        )
      } else {
        await axios.post("http://localhost:4000/api/transactions", {
          transaction: data,
        })
      }

      fetchTransactions()
      setIsDialogOpen(false)
      setEditingTransaction(null)
      setFormData({ description: "", value: "", type: "RECEITA", date: "" })
    } catch (error) {
      console.error("Erro ao salvar transação:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await axios.delete(`http://localhost:4000/api/transactions/${id}`)
        fetchTransactions()
      } catch (error) {
        console.error("Erro ao excluir transação:", error)
      }
    }
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      value: transaction.value.toString(),
      type: transaction.type,
      date: transaction.date.split("T")[0],
    })
    setIsDialogOpen(true)
  }

  const openTagDialog = (transactionId: number) => {
    setSelectedTransactionId(transactionId)
    setSelectedTags([])
    setIsTagDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingTransaction(null)
    setFormData({ description: "", value: "", type: "RECEITA", date: "" })
    setIsDialogOpen(true)
  }

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalIncome = transactions
    .filter((t) => t.type === "RECEITA")
    .reduce((sum, t) => sum + t.value, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === "DESPESA")
    .reduce((sum, t) => sum + t.value, 0)

  const balance = totalIncome - totalExpenses

  if (isLoading) {
    return (
      <PrivateRoute>
        <MainLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          </div>
        </MainLayout>
      </PrivateRoute>
    )
  }
  
return (
  <PrivateRoute>
    <MainLayout>
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Tags à Transação</DialogTitle>
            <DialogDescription>
              Selecione as tags desejadas para esta transação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={(e) => {
                    const newTags = e.target.checked
                      ? [...selectedTags, tag.id]
                      : selectedTags.filter((id) => id !== tag.id)
                    setSelectedTags(newTags)
                  }}
                />
                {tag.name}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTags} className="bg-emerald-600 hover:bg-emerald-700">
              Adicionar Tags
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
            <p className="text-gray-600">Gerencie suas receitas e despesas</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTransaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
                <DialogDescription>
                  {editingTransaction
                    ? "Edite as informações da transação"
                    : "Preencha os dados da nova transação"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "RECEITA" | "DESPESA") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RECEITA">Receita</SelectItem>
                      <SelectItem value="DESPESA">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingTransaction ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Transações</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transação(ões) encontrada(s)
            </CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data / Tags</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell
                      className={transaction.type === "RECEITA" ? "text-green-600" : "text-red-600"}
                    >
                      R${" "}
                      {Number(transaction.value).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === "RECEITA" ? "default" : "destructive"}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{new Date(transaction.date).toLocaleDateString("pt-BR")}</span>
                        <div className="flex flex-wrap gap-1">
                        {transaction.tags?.map((tagName: string) => {
                          const tagObj = tags.find((t) => t.name === tagName)

                          return (
                            <div
                              key={tagName}
                              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${generateRandomColor()}`}
                            >
                              {tagName}
                              {tagObj?.id && (
                                <button
                                  onClick={() => handleRemoveTag(transaction.id, tagObj.id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                  title="Remover tag"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          )
                        })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTagDialog(transaction.id)}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  </PrivateRoute>
)


}
