// src/components/Header.js
import React, { useState, useEffect } from 'react'
import Notificacoes from './Notificacoes'
import {
  LayoutDashboard,
  Users,
  Plane,
  Building2,
  Download,
  UserPlus,
  UserCog,
  LogOut,
} from 'lucide-react'

// Definição de todas as páginas com suas permissões
const PAGINAS_SISTEMA = [
  {
    id: 'dashboard',
    nome: 'Dashboard',
    icone: LayoutDashboard,
    permissaoId: null, // Dashboard sempre visível para todos
    categoria: null,
  },
  {
    id: 'funcionarios',
    nome: 'Funcionários',
    icone: Users,
    permissaoId: 'lista_funcionarios',
    categoria: null,
  },
  {
    id: 'novo-funcionario',
    nome: 'Novo Funcionário',
    icone: UserPlus,
    permissaoId: 'cadastro_funcionarios',
    categoria: 'modulos',
  },
  {
    id: 'solicitacao-viagem',
    nome: 'Solicitação Viagem',
    icone: Plane,
    permissaoId: 'solicitacao_viagem',
    categoria: 'modulos',
  },
  {
    id: 'docs-empresa',
    nome: 'Docs Empresa',
    icone: Building2,
    permissaoId: 'documentos_empresa',
    categoria: 'modulos',
  },
  {
    id: 'download-massa',
    nome: 'Download em Massa',
    icone: Download,
    permissaoId: 'relatorios',
    categoria: 'modulos',
  },
  {
    id: 'usuarios',
    nome: 'Gerenciar Usuários',
    icone: UserCog,
    permissaoId: 'gerenciar_usuarios',
    categoria: 'admin',
  },
]

function Header({ usuario, onLogout, paginaAtual, onMudarPagina }) {
  // Componente de cabeçalho/sidebar com navegação
  const [paginasPermitidas, setPaginasPermitidas] = useState([]) // Páginas que o usuário pode acessar

  useEffect(() => {
    // Carregar as páginas permitidas quando o usuário mudar
    console.log('🔄 Header: useEffect disparado')
    console.log('👤 Usuário recebido:', usuario)
    carregarPaginasPermitidas()
  }, [usuario]) // Dependência: usuario

  const carregarPaginasPermitidas = () => {
    // Função para filtrar as páginas com base nas permissões do usuário
    console.log('🔍 Iniciando carregamento de páginas permitidas...')

    if (!usuario) {
      console.log('❌ Nenhum usuário logado')
      setPaginasPermitidas([])
      return
    }

    console.log('📊 Dados do usuário:')
    console.log('  - Nome:', usuario.nome)
    console.log('  - Tipo:', usuario.tipo)
    console.log('  - Permissões:', usuario.permissoes)

    // Se for admin, mostrar todas as páginas
    if (usuario.tipo === 'admin') {
      setPaginasPermitidas(PAGINAS_SISTEMA)
      console.log('👑 Admin: Todas as páginas liberadas')
      console.log('  - Total de páginas:', PAGINAS_SISTEMA.length)
      return
    }

    // Se for usuário comum, filtrar pelas permissões
    const permissoesUsuario = usuario.permissoes || []
    console.log('🔑 Permissões do usuário:', permissoesUsuario)

    const paginasFiltradas = PAGINAS_SISTEMA.filter((pagina) => {
      // Dashboard sempre visível
      if (pagina.permissaoId === null) {
        console.log('  ✅', pagina.nome, '- Sempre visível (Dashboard)')
        return true
      }

      // Verificar se o usuário tem a permissão para esta página
      const temPermissao = permissoesUsuario.includes(pagina.permissaoId)
      console.log(
        '  ' + (temPermissao ? '✅' : '❌'),
        pagina.nome,
        '- permissaoId:',
        pagina.permissaoId
      )
      return temPermissao
    })

    setPaginasPermitidas(paginasFiltradas)
    console.log('✅ Páginas filtradas:', paginasFiltradas.length, 'páginas')
    console.log(
      '📋 Lista de páginas permitidas:',
      paginasFiltradas.map((p) => p.nome)
    )
  }

  // Separar páginas por categoria
  const paginasPrincipais = paginasPermitidas.filter(
    (p) => p.categoria === null
  )
  const paginasModulos = paginasPermitidas.filter(
    (p) => p.categoria === 'modulos'
  )
  const paginasAdmin = paginasPermitidas.filter((p) => p.categoria === 'admin')

  console.log('🗂️ Páginas separadas por categoria:')
  console.log('  - Principais:', paginasPrincipais.length)
  console.log('  - Módulos:', paginasModulos.length)
  console.log('  - Admin:', paginasAdmin.length)

  return (
    <aside className="app-sidebar">
      {/* Logo e título */}
      <div className="sidebar-header">
        <h1>Sistema Centrus</h1>
        {/* DEBUG: Mostrar informações do usuário */}
        <small
          style={{
            color: '#666',
            fontSize: '11px',
            marginTop: '5px',
            display: 'block',
          }}
        >
          {usuario?.tipo === 'admin'
            ? '👑 Admin'
            : `👤 ${paginasPermitidas.length} páginas`}
        </small>
      </div>

      {/* Menu de navegação */}
      <nav className="sidebar-menu">
        {/* Páginas principais (Dashboard e Funcionários) */}
        {paginasPrincipais.map((pagina) => {
          const Icone = pagina.icone
          return (
            <button
              key={pagina.id}
              className={
                paginaAtual === pagina.id ? 'menu-item-active' : 'menu-item'
              }
              onClick={() => onMudarPagina(pagina.id)}
            >
              <Icone size={20} />
              <span>{pagina.nome}</span>
            </button>
          )
        })}

        {/* Módulos - mostrar apenas se houver páginas de módulos permitidas */}
        {paginasModulos.length > 0 && (
          <>
            <div className="menu-divider"></div>
            <div className="menu-section-title">Módulos</div>

            {paginasModulos.map((pagina) => {
              const Icone = pagina.icone
              return (
                <button
                  key={pagina.id}
                  className={
                    paginaAtual === pagina.id ? 'menu-item-active' : 'menu-item'
                  }
                  onClick={() => onMudarPagina(pagina.id)}
                >
                  <Icone size={20} />
                  <span>{pagina.nome}</span>
                </button>
              )
            })}
          </>
        )}

        {/* Administração - mostrar apenas se houver páginas admin permitidas */}
        {paginasAdmin.length > 0 && (
          <>
            <div className="menu-divider"></div>
            <div className="menu-section-title">Administração</div>

            {paginasAdmin.map((pagina) => {
              const Icone = pagina.icone
              return (
                <button
                  key={pagina.id}
                  className={
                    paginaAtual === pagina.id ? 'menu-item-active' : 'menu-item'
                  }
                  onClick={() => onMudarPagina(pagina.id)}
                >
                  <Icone size={20} />
                  <span>{pagina.nome}</span>
                </button>
              )
            })}
          </>
        )}

        {/* DEBUG: Mostrar se não há páginas */}
        {paginasPermitidas.length === 0 && (
          <div
            style={{
              padding: '20px',
              color: '#999',
              textAlign: 'center',
              fontSize: '12px',
            }}
          >
            Nenhuma página disponível
          </div>
        )}
      </nav>

      {/* Informações do usuário e logout */}
      <div className="sidebar-footer">
        <div className="user-info-sidebar">
          <div className="user-avatar">
            {usuario?.nome?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{usuario?.nome || 'Usuário'}</span>
            <span className="user-role">
              {usuario?.tipo === 'admin' ? 'Administrador' : 'Usuário'}
            </span>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout} title="Sair">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  )
}

export default Header
