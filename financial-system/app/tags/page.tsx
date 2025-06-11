"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { PrivateRoute } from "@/components/private-route"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Search, Tag } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/lib/auth-context"

interface TagType {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  _count?: {
    transactions: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [formData, setFormData] = useState({ name: "" })

  const { user } = useAuth()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/tags/user/${user?.id}`)
      const parsedTags: TagType[] = (response.data?.data ?? []).map((tag: any) => ({
        id: String(tag.id),
        name: tag.name,
        createdAt: tag.createdAt || new Date().toISOString(),
        updatedAt: tag.updatedAt || new Date().toISOString(),
        _count: tag._count || { transactions: 0 },
      }))
      setTags(parsedTags)
    } catch (error) {
      console.error("Erro ao carregar categorias:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!user?.id) throw new Error("Usuário não autenticado")

      if (editingTag) {
        await axios.put(`http://localhost:4000/api/tags/${editingTag.id}`, {
          ...formData,
          user_id: user.id,
        })
      } else {
        await axios.post("http://localhost:4000/api/tags", {
          ...formData,
          user_id: user.id,
        })
      }

      fetchTags()
      setIsDialogOpen(false)
      setEditingTag(null)
      setFormData({ name: "" })
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      try {
        await axios.delete(`http://localhost:4000/api/tags/${id}`)
        fetchTags()
      } catch (error) {
        console.error("Erro ao excluir categoria:", error)
      }
    }
  }

  const openEditDialog = (tag: TagType) => {
    setEditingTag(tag)
    setFormData({ name: tag.name })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingTag(null)
    setFormData({ name: "" })
    setIsDialogOpen(true)
  }

  const filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
              <p className="text-gray-600">Organize suas transações por categorias</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTag ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                  <DialogDescription>
                    {editingTag ? "Edite o nome da categoria" : "Digite o nome da nova categoria"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Categoria</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Alimentação, Transporte, Lazer..."
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      {editingTag ? "Salvar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Categorias</CardTitle>
              <CardDescription>{filteredTags.length} categoria(s) encontrada(s)</CardDescription>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar categorias..."
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Transações</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-emerald-600" />
                          {tag.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                          {tag._count?.transactions || 0} transações
                        </span>
                      </TableCell>
                      <TableCell>{new Date(tag.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{new Date(tag.updatedAt).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(tag)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tag.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total de Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{tags.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mais Utilizada</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">
                  {tags.length > 0
                    ? tags.reduce((prev, current) =>
                        (prev._count?.transactions || 0) > (current._count?.transactions || 0) ? prev : current,
                      ).name
                    : "Nenhuma"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {tags.reduce((sum, tag) => sum + (tag._count?.transactions || 0), 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    </PrivateRoute>
  )
}
