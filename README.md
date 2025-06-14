# 🚀 Guia de Inicialização da Aplicação Financial Management

Este guia irá te orientar em como clonar, configurar e executar a aplicação, tanto o front-end quanto o back-end.

---

## 🔗 Clonando o Repositório

1. Clone o repositório:

```bash
git clone https://github.com/saulobeni/FinancialManagementElixir.git
````

2. Acesse a pasta do projeto:

```bash
cd FinancialManagementElixir
```

---

## 🌐 Front-End (React)

### 1. Acesse a pasta do front-end:

```bash
cd financial_front
```

### 2. Instale as dependências:

```bash
npm install --force
```

### 3. Execute o front-end:

```bash
npm run dev
```

O front estará disponível em:

```
http://localhost:5173
```

---

## 🐘 Banco de Dados (PostgreSQL)

A aplicação utiliza PostgreSQL. As credenciais devem ser configuradas no back-end.

---

## 🔧 Back-End (Elixir + Phoenix)

### 1. Acesse a pasta do back-end:

```bash
cd financial_back
```

### 2. Configure o banco de dados no arquivo `config/dev.exs`.

Exemplo de configuração:

```elixir
config :financial_management, FinancialManagement.Repo,
  username: "seu_usuario_do_banco",
  password: "sua_senha_do_banco",
  hostname: "seu_host_do_banco",
  port: "porta_do_banco",
  database: "nome_do_banco",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10
```

> 🔐 **Atenção:** Nunca versionar arquivos com informações sensíveis.

---

### 3. Instale as dependências do Elixir:

```bash
mix deps.get
```

### 4. Rode as migrations para criar as tabelas do banco:

* No **Linux** ou **MacOS**:

```bash
mix ecto.migrate
```

* No **Windows** (dentro do terminal do Docker, após subir os containers):

```bash
docker exec -it nome_do_container bash
mix ecto.migrate
```

> 🐳 Substitua `nome_do_container` pelo nome do seu container.

---

## 🐳 Iniciando o Docker

Na raiz do projeto (onde está localizado o `docker-compose.yml`), execute:

```bash
docker-compose up
```

Este comando irá subir os containers necessários (PostgreSQL e outros serviços).

---

## ✅ Acessando a Aplicação

* **Front-end:** [http://localhost:5173](http://localhost:5173)
* **Back-end API:** [http://localhost:4000/api](http://localhost:4000/api)

---

## 🏁 Pronto! A aplicação está rodando localmente 🚀
