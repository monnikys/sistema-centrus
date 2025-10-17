# Análise do Sistema Centrus

## Visão Geral

O **Sistema Centrus** é uma aplicação web desenvolvida em **React** para gerenciamento de funcionários e documentos de uma empresa. O sistema oferece funcionalidades completas de cadastro, autenticação, controle de permissões e gestão documental, utilizando armazenamento local através do **IndexedDB** (via Dexie.js).

---

## Arquitetura e Tecnologias

### Stack Tecnológico

O projeto utiliza um conjunto moderno de tecnologias focadas em desenvolvimento frontend:

- **React 18.2.0** - Framework principal para construção da interface
- **Dexie.js 3.2.7** - Wrapper para IndexedDB, gerenciamento de banco de dados local
- **Material-UI (MUI) 7.3.4** - Biblioteca de componentes UI seguindo Material Design
- **React Router DOM 7.9.4** - Gerenciamento de rotas e navegação
- **Recharts 3.3.0** - Biblioteca para visualização de dados e gráficos
- **Day.js 1.11.18** - Manipulação de datas
- **JSZip 3.10.1** - Compactação de arquivos para download em massa

### Estrutura do Projeto

```
sistema-centrus/
├── public/                    # Arquivos públicos estáticos
│   ├── favicon.ico
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/           # Componentes React
│   │   ├── AlterarSenha.js
│   │   ├── CadastroFuncionario.js
│   │   ├── Dashboard.js
│   │   ├── DocumentosEmpresa.js
│   │   ├── GerenciarDocumentos.js
│   │   ├── GerenciarUsuarios.js
│   │   ├── Header.js
│   │   ├── ListaFuncionarios.js
│   │   ├── Login.js
│   │   ├── ProtectedRoute.js
│   │   ├── RelatorioDocumentos.js
│   │   ├── SolicitacaoViagem.js
│   │   └── styles/
│   ├── App.js               # Componente principal
│   ├── App.css              # Estilos globais
│   ├── authDb.js            # Banco de dados de autenticação
│   ├── db.js                # Banco de dados principal
│   ├── index.js             # Ponto de entrada
│   └── index.css
├── img/                      # Documentação e imagens
├── package.json
├── readme.md
└── setup.sh
```

---

## Funcionalidades Principais

### 1. Sistema de Autenticação e Autorização

O sistema implementa um robusto mecanismo de autenticação com controle granular de permissões:

#### Características:
- **Login/Logout** com sessões persistentes
- **Hash de senhas** usando SHA-256 (Web Crypto API)
- **Tokens de sessão** com expiração de 8 horas
- **Dois tipos de usuários**: Admin e Usuário comum
- **Sistema de permissões granulares**

#### Permissões Disponíveis:
- `visualizar_funcionarios` - Ver lista de funcionários
- `criar_funcionarios` - Cadastrar novos funcionários
- `editar_funcionarios` - Editar dados de funcionários
- `excluir_funcionarios` - Remover funcionários
- `gerenciar_documentos` - Upload e gestão de documentos
- `solicitar_viagens` - Criar solicitações de viagem
- `aprovar_viagens` - Aprovar/recusar viagens
- `gerenciar_usuarios` - Administrar usuários do sistema

#### Credenciais Padrão:
- **Email**: `admin@centrus.com`
- **Senha**: `admin123`

### 2. Gerenciamento de Funcionários

Cadastro completo de funcionários com os seguintes campos:
- Nome completo
- CPF
- Cargo (lista pré-definida com 25 cargos)
- Departamento (23 departamentos organizacionais)
- Email
- Telefone

**Departamentos disponíveis**: PRESI, DIRAP, DIBEN, GECAP, GECON, GEINF, GECOR, GEOPE, GETEC, GEFIN, GEBEN, GERIS, SELOG, SEFOP, SECON, SEBEN, SECAB, SECRE, SETES, SEMEF, SESUP, SEFIN, SEDES, AUDIT, COJUR

### 3. Gestão de Documentos

Sistema completo para upload, categorização e gerenciamento de documentos em PDF:

#### Categorias de Documentos de Funcionários:
- Abono de Assiduidade
- Atestado Médico
- Atestado de Comparecimento
- Férias
- Ajuste de Ponto
- Licença Maternidade/Paternidade
- Licença Nojo
- Licença Gala
- Justiça Eleitoral
- Doação de Sangue

#### Categorias de Documentos da Empresa:
- Inclusão do Convênio
- Exclusão do Convênio
- Passagens Aéreas

#### Funcionalidades:
- Upload de arquivos PDF
- Armazenamento em base64 no IndexedDB
- Visualização inline de PDFs
- Download individual de documentos
- Download em massa (ZIP)
- Filtros por período (mês/ano)
- Documentos fixados (destaque)

### 4. Solicitação de Viagens

Sistema completo para gerenciar viagens corporativas:

#### Informações Capturadas:
- Solicitante e viajante
- Origem e destino (aeroportos brasileiros)
- Data e horários de ida
- Data e horários de volta
- Justificativa da viagem
- Observações adicionais

#### Fluxo de Aprovação:
- **Status**: Pendente, Aprovada, Recusada
- Controle de permissões separado para criar e aprovar
- Registro de motivo em caso de recusa

### 5. Dashboard Analítico

Dashboard moderno inspirado no template **Minimal Free** com visualizações em tempo real:

#### Widgets de Resumo:
- Total de funcionários
- Total de documentos
- Número de categorias
- Número de departamentos

#### Gráficos Interativos:
- **Gráfico de Barras**: Funcionários por departamento
- **Gráfico de Pizza**: Documentos por categoria
- **Barras de Progresso**: Distribuição percentual de categorias

#### Tecnologia:
- Componentes Material-UI
- Biblioteca Recharts para visualizações
- Dados em tempo real via `useLiveQuery` do Dexie

### 6. Relatórios e Exportação

- Download em massa de documentos por categoria
- Geração de arquivos ZIP
- Filtros por período e categoria
- Relatórios consolidados

---

## Banco de Dados

O sistema utiliza **dois bancos IndexedDB** separados:

### 1. SistemaFuncionarios (db.js)

**Versão**: 6

#### Tabelas:

**funcionarios**
```
++id, nome, cpf, cargo, departamento
```

**documentos**
```
++id, funcionarioId, categoria, nomeArquivo, dataUpload, mes, ano, dataInicio, dataFim
```

**documentosEmpresa**
```
++id, funcionarioId, categoriaEmpresa, nomeArquivo, dataUpload, mes, ano, fixado
```

**solicitacoesViagem**
```
++id, solicitanteId, viajanteId, origem, destino, dataIda, horarioIdaInicio, 
horarioIdaFim, dataVolta, horarioVoltaInicio, horarioVoltaFim, justificativa, 
observacao, status, dataSolicitacao, motivoRecusa
```

### 2. SistemaCentrusAuth (authDb.js)

**Versão**: 2

#### Tabelas:

**usuarios**
```
++id, email, nome, senha, tipo, ativo, dataCriacao
```

**sessoes**
```
++id, usuarioId, token, dataExpiracao
```

**permissoes**
```
++id, nome
```

**usuarioPermissoes**
```
++id, usuarioId, permissaoId
```

---

## Segurança

### Pontos Fortes:
- Hash de senhas usando SHA-256
- Tokens de sessão únicos e com expiração
- Controle granular de permissões
- Validação de sessão em cada acesso
- Armazenamento local (sem exposição de dados em servidor)

### Considerações:
⚠️ **Importante**: Este sistema foi projetado para uso local/interno. Para produção:
- Implementar autenticação backend com JWT
- Usar bcrypt ou Argon2 para hash de senhas
- Adicionar HTTPS obrigatório
- Implementar rate limiting
- Adicionar autenticação de dois fatores (2FA)
- Migrar para banco de dados servidor

---

## Componentes Principais

### App.js
Componente raiz que gerencia:
- Estado de autenticação
- Navegação entre páginas
- Controle de rotas protegidas
- Tema Material-UI

### Header.js
Barra de navegação com:
- Menu de páginas
- Informações do usuário
- Botão de logout
- Navegação condicional baseada em permissões

### ProtectedRoute.js
Higher-Order Component para proteção de rotas:
- Verifica autenticação
- Valida permissões específicas
- Redireciona para login se necessário

### Dashboard.js
Painel principal com métricas e visualizações em tempo real

### GerenciarUsuarios.js
Interface completa para administração de usuários:
- Criar novos usuários
- Editar permissões
- Ativar/desativar usuários
- Alterar senhas

---

## Instalação e Execução

### Pré-requisitos
- Node.js 14 ou superior
- npm ou yarn

### Passos para Instalação

1. **Clonar o repositório**
```bash
git clone https://github.com/monnikys/sistema-centrus.git
cd sistema-centrus
```

2. **Instalar dependências**
```bash
npm install
```

3. **Executar o projeto**
```bash
npm start
```

4. **Acessar a aplicação**
```
http://localhost:3000
```

### Credenciais de Acesso Inicial
- **Email**: admin@centrus.com
- **Senha**: admin123

---

## Pontos de Melhoria Sugeridos

### 1. Backend e API
- Migrar para arquitetura cliente-servidor
- Implementar API RESTful com Node.js/Express
- Usar banco de dados relacional (PostgreSQL) ou NoSQL (MongoDB)

### 2. Segurança
- Implementar autenticação JWT
- Usar bcrypt para hash de senhas
- Adicionar HTTPS
- Implementar 2FA
- Adicionar logs de auditoria

### 3. Funcionalidades
- Sistema de notificações
- Histórico de alterações
- Backup automático
- Busca avançada com filtros
- Exportação para Excel/CSV
- Assinatura digital de documentos

### 4. UI/UX
- Modo escuro
- Responsividade mobile aprimorada
- Acessibilidade (WCAG)
- Internacionalização (i18n)

### 5. Performance
- Lazy loading de componentes
- Paginação de listas
- Cache de dados
- Otimização de imagens

### 6. Testes
- Testes unitários (Jest)
- Testes de integração
- Testes E2E (Cypress)
- Cobertura de código

### 7. DevOps
- CI/CD pipeline
- Docker containerization
- Ambiente de staging
- Monitoramento e logging

---

## Conclusão

O **Sistema Centrus** é uma aplicação bem estruturada e funcional para gerenciamento interno de funcionários e documentos. Utiliza tecnologias modernas do ecossistema React e oferece uma interface intuitiva com Material-UI. O sistema de permissões granulares e o dashboard analítico são destaques positivos.

Para uso em produção, recomenda-se fortemente a implementação de um backend robusto, melhorias de segurança e migração do armazenamento local para um banco de dados servidor com autenticação adequada.

---

**Análise realizada em**: 17 de outubro de 2025  
**Versão do projeto**: 1.0.0  
**Repositório**: https://github.com/monnikys/sistema-centrus

