# Projeto ECOPoints

Este monorepo contém um aplicativo Expo e uma API Node.js criada com tRPC.

## Estrutura do projeto

```
.
├── api/                # API em Node.js
│   ├── src/
│   ├── trpc/
│   ├── package.json
│   └── ...
├── expo/               # App Expo
│   ├── src/
│   ├── assets/
│   ├── app.config.ts
│   ├── metro.config.js
│   ├── package.json
│   └── ...
├── tooling/            # Pacotes de ferramentas usadas no projeto
│   ├── eslint/
│   ├── typescript/
│   ├── tailwind/
│   └── ...
├── .github/            # Github workflows
├── .env                # Variáveis de ambiente
├── package.json # Raiz do projeto
├── pnpm-workspace.yaml # Configuração do workspace do projeto
└── ...
```

## Início

### Pré requisitos

- [Node.js](https://nodejs.org/) >= 22.9
- [pnpm](https://pnpm.io/) >= 9

### Instalação

1. Clone o repositório:

```sh
   git clone https://github.com/johnpgr/unama-projeto-react-native.git
   cd unama-projeto-react-native
```

2. Instale as dependências:

```sh
   pnpm install
```

### Rodando o projeto

1. Inicie os serviços utilizados no projeto usando `docker-compose`

```sh
   docker-compose up -d
```

2. Inicie o app Expo e a API Node.js:

```sh
    pnpm dev
```

### Scripts

- **Build**: `pnpm build`
- **Clean**: `pnpm clean`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`
- **Typecheck**: `pnpm typecheck`
