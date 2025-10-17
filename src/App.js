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
import DashboardMUI from './components/Dashboard'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#5e35b1' },
    secondary: { main: '#fb8c00' },
  },
})

function App() {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [telaAtual, setTelaAtual] = useState('lista')
  const [paginaAtual, setPaginaAtual] = useState('dashboard')
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null)

  const funcionarios = useLiveQuery(() => db.funcionarios.toArray(), [])

  useEffect(() => {
    console.log('🚀 App.js: Iniciando aplicação...')
    inicializar()
  }, [])

  const inicializar = async () => {
    try {
      console.log('⚙️ Inicializando banco de autenticação...')
      await inicializarAuth()
      console.log('✅ Banco de autenticação inicializado')

      const estaAuth = await AuthService.estaAutenticado()
      console.log('🔐 Está autenticado?', estaAuth)

      if (estaAuth) {
        const usuarioAtual = await AuthService.obterUsuarioAtual()
        console.log('👤 Usuário autenticado:', usuarioAtual)
        console.log('🔑 Tipo:', usuarioAtual?.tipo)
        console.log('📋 Permissões:', usuarioAtual?.permissoes)
        setUsuario(usuarioAtual)
      } else {
        console.log('❌ Nenhum usuário autenticado')
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error)
    } finally {
      setCarregando(false)
      console.log('✅ Inicialização concluída')
    }
  }

  const handleLoginSucesso = async (usuarioLogado) => {
    console.log('🎉 Login bem-sucedido!')
    console.log('👤 Usuário logado:', usuarioLogado)
    
    const usuarioCompleto = await AuthService.obterUsuarioAtual()
    console.log('🔄 Usuário recarregado do banco:', usuarioCompleto)
    console.log('📋 Permissões carregadas:', usuarioCompleto?.permissoes)
    
    setUsuario(usuarioCompleto)
  }

  const handleLogout = async () => {
    console.log('👋 Fazendo logout...')
    await AuthService.logout()
    setUsuario(null)
    setPaginaAtual('dashboard')
    setTelaAtual('lista')
    console.log('✅ Logout concluído')
  }

  const handleMudarPagina = (pagina) => {
    console.log('📄 Mudando página para:', pagina)
    setPaginaAtual(pagina)
    setTelaAtual('lista')
    setFuncionarioSelecionado(null)
  }

  const handleNovoFuncionario = () => {
    setFuncionarioSelecionado(null)
    setTelaAtual('cadastro')
  }

  const handleEditarFuncionario = (funcionario) => {
    setFuncionarioSelecionado(funcionario)
    setTelaAtual('cadastro')
  }

  const handleGerenciarDocumentos = (funcionario) => {
    setFuncionarioSelecionado(funcionario)
    setTelaAtual('documentos')
  }

  const handleVoltar = () => {
    setFuncionarioSelecionado(null)
    setTelaAtual('lista')
  }

  useEffect(() => {
    console.log('🔄 Estado do usuário mudou:', usuario)
    if (usuario) {
      console.log('  📋 Permissões atuais:', usuario.permissoes)
    }
  }, [usuario])

  if (carregando) {
    return (
      <div className="carregando-app">
        <div className="spinner-app"></div>
        <p>Carregando sistema...</p>
      </div>
    )
  }

  if (!usuario) {
    console.log('🔓 Renderizando tela de login...')
    return <Login onLoginSucesso={handleLoginSucesso} />
  }

  console.log('🔒 Renderizando sistema autenticado para:', usuario.nome)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app">
        <Header
          usuario={usuario}
          onLogout={handleLogout}
          paginaAtual={paginaAtual}
          onMudarPagina={handleMudarPagina}
        />

        <main className="app-main">
          {/* Dashboard - sempre acessível */}
          {paginaAtual === 'dashboard' && (
            <ProtectedRoute>
              <DashboardMUI />
            </ProtectedRoute>
          )}

          {/* MODIFICADO: Solicitação de Viagem - agora usa permissões separadas */}
          {/* O controle de permissões criar_viagens e aprovar_viagens é feito dentro do componente */}
          {paginaAtual === 'solicitacao-viagem' && (
            <ProtectedRoute>
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
              {telaAtual === 'lista' && (
                <ListaFuncionarios
                  funcionarios={funcionarios || []}
                  onEditar={handleEditarFuncionario}
                  onGerenciarDocumentos={handleGerenciarDocumentos}
                />
              )}
              {telaAtual === 'cadastro' && (
                <CadastroFuncionario
                  funcionario={funcionarioSelecionado}
                  onVoltar={handleVoltar}
                />
              )}
              {telaAtual === 'documentos' && (
                <GerenciarDocumentos
                  funcionario={funcionarioSelecionado}
                  onVoltar={handleVoltar}
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

export default App

