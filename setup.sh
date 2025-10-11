#!/bin/bash

echo "🚀 Configurando Sistema de Arquivo de Funcionários..."

# Criar projeto React
echo "📦 Criando projeto React..."
npx create-react-app sistema-arquivo-funcionarios

# Entrar na pasta do projeto
cd sistema-arquivo-funcionarios

# Instalar dependências
echo "📚 Instalando dependências..."
npm install dexie dexie-react-hooks lucide-react

# Criar estrutura de pastas
echo "📁 Criando estrutura de pastas..."
mkdir -p src/components

echo "✅ Configuração básica concluída!"
echo ""
echo "📝 Próximos passos:"
echo "1. Copie os arquivos fornecidos para as respectivas pastas"
echo "2. Execute 'npm start' para iniciar o projeto"
echo ""
echo "Estrutura de pastas criada:"
echo "src/"
echo "├── components/"
echo "│   ├── CadastroFuncionario.js (criar)"
echo "│   ├── ListaFuncionarios.js (criar)"
echo "│   └── GerenciarDocumentos.js (criar)"
echo "├── db.js (criar)"
echo "├── App.js (substituir)"
echo "├── App.css (substituir)"
echo "├── index.js (substituir)"
echo "└── index.css (substituir)"