# Alpha Saúde — Sistema de Agendamento Médico

## Stack
- **Frontend**: React + Vite + Tailwind CSS → Deploy no Vercel
- **Backend**: Node.js + Express + Prisma ORM → Deploy no Railway
- **Banco de Dados**: PostgreSQL via Supabase (gratuito)
- **Auth**: JWT (access token + refresh token)

## Estrutura
```
alpha-saude/
├── frontend/   # React App
└── backend/    # API REST Express
```

## Setup Rápido

### 1. Banco de Dados (Supabase)
1. Crie conta em https://supabase.com
2. Crie um novo projeto
3. Copie a **Connection String** (URI) em Settings > Database
4. Cole no `backend/.env` como `DATABASE_URL`

### 2. Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variáveis de Ambiente

### backend/.env
```
DATABASE_URL="postgresql://..."   # Supabase connection string
JWT_SECRET="seu_secret_aqui"
JWT_REFRESH_SECRET="outro_secret"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### frontend/.env
```
VITE_API_URL="http://localhost:3001"
```

## Deploy

### Vercel (Frontend)
1. Push para GitHub
2. Conecte o repo no vercel.com
3. Root directory: `frontend`
4. Adicione `VITE_API_URL` apontando para o Railway

### Railway (Backend)
1. Conecte o repo no railway.app
2. Root directory: `backend`
3. Adicione as variáveis de ambiente
4. Railway detecta Node.js automaticamente

## Roles e Permissões
- **admin**: acesso total a todas as telas
- **recepcionista**: acesso a Agenda e Pacientes apenas
