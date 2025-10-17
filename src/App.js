// src/App.js
import React, { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import Login from './components/Login'
import Header from './components/Header'
import CadastroFuncionario from './components/CadastroFuncionario'
import ListaFuncionarios from './components/ListaFuncionarios'
import GerenciarDocumentos from './components/GerenciarDocumentos'
import RelatorioDocumentos from './components/RelatorioDocumentos'
import DocumentosEmpresa from './components/DocumentosEmpresa'
import SolicitacaoViagem from './components/SolicitacaoViagem'
import GerenciarUsuarios from './components/GerenciarUsuarios'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthService, inicializarAuth } from './authDb'
import './App.css'
// NOVO: Importações do Material-UI e DashboardMUI
import DashboardMUI from './components/Dashboard'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

// NOVO: Criar tema Material-UI
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5e35b1' },
    secondary: { main: '#fb8c00' },
  },
})

function App() {
  // Componente principal do aplicativo
  const [usuario, setUsuario] = useState(null) // Estado para armazenar o usuário autenticado
  const [carregando, setCarregando] = useState(true) // Estado para indicar se o sistema está carregando
  const [telaAtual, setTelaAtual] = useState('lista') // Estado para controlar a tela atual (lista, cadastro, documentos, etc.)
  const [paginaAtual, setPaginaAtual] = useState('dashboard') // Estado para controlar a página atual (dashboard, funcionarios, usuarios) - INICIA NO DASHBOARD
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null) // Estado para armazenar o funcionário selecionado para edição ou gerenciamento de documentos

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), []) // Hook para buscar funcionários do banco de dados

  useEffect(() => {
    // Efeito para inicializar o sistema na montagem do componente
    console.log('🚀 App.js: Iniciando aplicação...')
    inicializar() // Chamar função de inicialização
  }, []) // Executar apenas uma vez na montagem

  const inicializar = async () => {
    // Função para inicializar o sistema
    try {
      console.log('⚙️ Inicializando banco de autenticação...')
      // Tentar inicializar o sistema
      // Inicializar banco de autenticação
      await inicializarAuth() // Chamar função de inicialização do AuthService
      console.log('✅ Banco de autenticação inicializado')

      // Verificar se já está autenticado
      const estaAuth = await AuthService.estaAutenticado()
      console.log('🔐 Está autenticado?', estaAuth)

      if (estaAuth) {
        // Se está autenticado
        const usuarioAtual = await AuthService.obterUsuarioAtual() // Obter dados do usuário atual
        console.log('👤 Usuário autenticado:', usuarioAtual)
        console.log('🔑 Tipo:', usuarioAtual?.tipo)
        console.log('📋 Permissões:', usuarioAtual?.permissoes)
        setUsuario(usuarioAtual) // Atualizar estado do usuário
      } else {
        console.log('❌ Nenhum usuário autenticado')
      }
    } catch (error) {
      // Capturar erros
      console.error('❌ Erro ao inicializar:', error) // Logar erro no console
    } finally {
      // Sempre executar
      setCarregando(false) // Indicar que o carregamento terminou
      console.log('✅ Inicialização concluída')
    }
  }

  const handleLoginSucesso = async (usuarioLogado) => {
    // Função chamada ao fazer login com sucesso
    console.log('🎉 Login bem-sucedido!')
    console.log('👤 Usuário logado:', usuarioLogado)
    
    // IMPORTANTE: Recarregar o usuário do banco para garantir que tem as permissões
    const usuarioCompleto = await AuthService.obterUsuarioAtual()
    console.log('🔄 Usuário recarregado do banco:', usuarioCompleto)
    console.log('📋 Permissões carregadas:', usuarioCompleto?.permissoes)
    
    setUsuario(usuarioCompleto) // Atualizar estado do usuário com dados completos
  }

  const handleLogout = async () => {
    // Função para fazer logout
    console.log('👋 Fazendo logout...')
    await AuthService.logout() // Fazer logout no AuthService
    setUsuario(null) // Limpar estado do usuário
    setPaginaAtual('dashboard') // Voltar para o dashboard
    setTelaAtual('lista') // Voltar para a tela de lista
    console.log('✅ Logout concluído')
  }

  const handleMudarPagina = (pagina) => {
    // Função para mudar a página atual
    console.log('📄 Mudando página para:', pagina)
    setPaginaAtual(pagina) // Atualizar estado da página
    setTelaAtual('lista') // Voltar para a tela de lista
    setFuncionarioSelecionado(null) // Limpar funcionário selecionado
  }

  const handleNovoFuncionario = () => {
    // Função para iniciar o cadastro de um novo funcionário
    setFuncionarioSelecionado(null) // Limpar funcionário selecionado
    setTelaAtual('cadastro') // Mudar para a tela de cadastro
  }

  const handleEditarFuncionario = (funcionario) => {
    // Função para editar um funcionário existente
    setFuncionarioSelecionado(funcionario) // Definir funcionário selecionado
    setTelaAtual('cadastro') // Mudar para a tela de cadastro
  }

  const handleGerenciarDocumentos = (funcionario) => {
    // Função para gerenciar documentos de um funcionário
    setFuncionarioSelecionado(funcionario) // Definir funcionário selecionado
    setTelaAtual('documentos') // Mudar para a tela de gerenciamento de documentos
  }

  const handleVoltar = () => {
    // Função para voltar para a lista de funcionários
    setFuncionarioSelecionado(null) // Limpar funcionário selecionado
    setTelaAtual('lista') // Mudar para a tela de lista
  }

  // DEBUG: Log do usuário sempre que mudar
  useEffect(() => {
    console.log('🔄 Estado do usuário mudou:', usuario)
    if (usuario) {
      console.log('  📋 Permissões atuais:', usuario.permissoes)
    }
  }, [usuario])

  if (carregando) {
    // Se o sistema está carregando, mostrar tela de carregamento
    return (
      // Retornar JSX de carregamento
      <div className="carregando-app">
        <div className="spinner-app"></div>
        <p>Carregando sistema...</p>
      </div>
    ) // Fim do retorno JSX
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!usuario) {
    console.log('🔓 Renderizando tela de login...')
    return <Login onLoginSucesso={handleLoginSucesso} /> // Renderiza o componente de Login
  }

  // Sistema autenticado
  console.log('🔒 Renderizando sistema autenticado para:', usuario.nome)
  return (
    // NOVO: Envolver tudo com ThemeProvider e CssBaseline
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Retornar JSX do sistema autenticado */}
      <div className="app">
        <Header
          usuario={usuario}
          onLogout={handleLogout}
          paginaAtual={paginaAtual}
          onMudarPagina={handleMudarPagina}
        />

        <main className="app-main">
          {' '}
          {/* Área principal do aplicativo */}
          {/* Dashboard - sempre acessível */}
          {paginaAtual === 'dashboard' && ( // Se a página atual é dashboard
            <ProtectedRoute>
              {' '}
              {/*Rota protegida para usuários autenticados*/}
              <DashboardMUI /> {/*Renderiza o Dashboard com Material-UI*/}
            </ProtectedRoute>
          )}

          {/* Solicitação de Viagem - requer permissão */}
          {paginaAtual === 'solicitacao-viagem' && (
            <ProtectedRoute paginaId="solicitacao_viagem">
              <SolicitacaoViagem
                onVoltar={() => {
                  setPaginaAtual('dashboard')
                  setTelaAtual('lista')
                }}
              />
            </ProtectedRoute>
          )}

          {/* Documentos da Empresa - requer permissão */}
          {paginaAtual === 'docs-empresa' && (
            <ProtectedRoute paginaId="documentos_empresa">
              <DocumentosEmpresa
                onVoltar={() => {
                  setPaginaAtual('dashboard')
                  setTelaAtual('lista')
                }}
              />
            </ProtectedRoute>
          )}

          {/* Download em Massa (Relatórios) - requer permissão */}
          {paginaAtual === 'download-massa' && (
            <ProtectedRoute paginaId="relatorios">
              <RelatorioDocumentos
                onVoltar={() => {
                  setPaginaAtual('dashboard')
                  setTelaAtual('lista')
                }}
              />
            </ProtectedRoute>
          )}

          {/* Novo Funcionário - requer permissão de cadastro */}
          {paginaAtual === 'novo-funcionario' && (
            <ProtectedRoute paginaId="cadastro_funcionarios">
              <CadastroFuncionario
                funcionario={null}
                onVoltar={() => {
                  setPaginaAtual('funcionarios')
                  setTelaAtual('lista')
                }}
              />
            </ProtectedRoute>
          )}

          {/* Funcionários - requer permissão de visualização */}
          {paginaAtual === 'funcionarios' && (
            <ProtectedRoute paginaId="lista_funcionarios">
              {telaAtual === 'lista' && ( // Se a tela atual é a lista de funcionários
                <ListaFuncionarios // Renderiza a lista de funcionários
                  funcionarios={funcionarios || []} // Passa a lista de funcionários (ou array vazio se nulo)
                  onEditar={handleEditarFuncionario} // Função para editar funcionário
                  onGerenciarDocumentos={handleGerenciarDocumentos} // Função para gerenciar documentos
                />
              )}
              {telaAtual === 'cadastro' && ( // Se a tela atual é de cadastro/edição de funcionário
                <CadastroFuncionario
                  funcionario={funcionarioSelecionado} // Passa o funcionário selecionado (ou null para novo)
                  onVoltar={handleVoltar} // Função para voltar para a lista
                />
              )}
              {telaAtual === 'documentos' && ( // Se a tela atual é de gerenciamento de documentos
                <GerenciarDocumentos
                  funcionario={funcionarioSelecionado} // Passa o funcionário selecionado
                  onVoltar={handleVoltar} // Função para voltar para a lista
                />
              )}
            </ProtectedRoute>
          )}

          {/* Gerenciar Usuários - requer ser admin OU ter permissão específica */}
          {paginaAtual === 'usuarios' && (
            <ProtectedRoute paginaId="gerenciar_usuarios">
              <GerenciarUsuarios usuarioAtual={usuario} />
            </ProtectedRoute>
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App // Exporta o componente App