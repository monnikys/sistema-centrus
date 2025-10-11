# 📁 Sistema de Arquivo de Funcionários

Sistema completo para gerenciamento e arquivamento de documentos PDF de funcionários, com categorização automática.

## 🚀 Como Instalar e Executar

### Pré-requisitos
- Node.js instalado (versão 14 ou superior)
- npm ou yarn

### Passo 1: Criar a estrutura do projeto

```bash
npx create-react-app sistema-arquivo-funcionarios
cd sistema-arquivo-funcionarios
```

### Passo 2: Instalar dependências

```bash
npm install dexie dexie-react-hooks lucide-react
```

### Passo 3: Criar a estrutura de pastas

Crie as seguintes pastas dentro de `src/`:
```
src/
├── components/
│   ├── CadastroFuncionario.js
│   ├── ListaFuncionarios.js
│   └── GerenciarDocumentos.js
├── db.js
├── App.js
├── App.css
├── index.js
└── index.css
```

### Passo 4: Copiar os arquivos

Copie o conteúdo de cada arquivo fornecido para os respectivos arquivos no seu projeto.

### Passo 5: Executar o projeto

```bash
npm start
```

O sistema estará disponível em `http://localhost:3000`

## 📋 Funcionalidades

### ✅ Gerenciamento de Funcionários
- Cadastrar novos funcionários
- Editar informações existentes
- Excluir funcionários
- Buscar funcionários por nome, CPF, cargo ou departamento

### 📄 Gerenciamento de Documentos
- Upload de arquivos PDF
- Categorização automática:
  - Abono de Assiduidade
  - Atestado Médico
  - Atestado de Comparecimento
  - Falta
- Visualizar PDFs no navegador
- Download de documentos
- Excluir documentos

### 💾 Armazenamento
- Todos os dados são salvos localmente no navegador (IndexedDB)
- Funciona offline
- Sem necessidade de servidor

## 🗂️ Estrutura do Banco de Dados

### Tabela: funcionarios
- id (auto-incremento)
- nome
- cpf
- cargo
- departamento
- email
- telefone

### Tabela: documentos
- id (auto-incremento)
- funcionarioId (referência ao funcionário)
- categoria
- nomeArquivo
- dataUpload
- tamanho
- dados (PDF em base64)

## 🎨 Tecnologias Utilizadas

- **React** - Framework JavaScript
- **Dexie.js** - Wrapper para IndexedDB
- **Lucide React** - Ícones
- **CSS3** - Estilização

## 📝 Como Usar

1. **Cadastrar Funcionário**: Clique em "Novo Funcionário" e preencha os dados
2. **Adicionar Documentos**: Clique no ícone de pasta para gerenciar documentos do funcionário
3. **Selecionar Categoria**: Escolha a categoria do documento nas abas
4. **Upload de PDF**: Clique em "Enviar PDF" e selecione o arquivo
5. **Visualizar/Baixar**: Use os ícones de olho e download para cada documento

## 🔒 Segurança

- Dados armazenados apenas no navegador do usuário
- Sem envio de informações para servidores externos
- Recomendado usar em ambiente controlado e seguro

## 🐛 Solução de Problemas

### PDFs não estão sendo salvos
- Verifique se o navegador suporta IndexedDB
- Limpe o cache do navegador
- Verifique o tamanho do arquivo (limitação do navegador)

### Aplicação não inicia
```bash
# Limpar cache e reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📄 Licença

Livre para uso pessoal e comercial.