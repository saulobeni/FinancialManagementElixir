FROM elixir:1.18.3-alpine

# Instala dependências do sistema
RUN apk update && apk add --no-cache \
  build-base \
  make \
  gcc \
  git \
  musl-dev \
  curl

# Define diretório do projeto
WORKDIR /usr/src/financial_management

# Copia arquivos do projeto
COPY . .

# Instala dependências do Elixir
RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix deps.get && \
    mix deps.compile

# Comando padrão ao subir o container
CMD ["iex", "-S", "mix"]
