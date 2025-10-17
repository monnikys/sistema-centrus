// src/components/Header.js
import React from 'react'
import { LayoutDashboard, Users, Plane, Building2, Download, UserPlus, UserCog, LogOut } from 'lucide-react'

function Header({ usuario, onLogout, paginaAtual, onMudarPagina }) {
  // Componente de cabeçalho/sidebar com navegação

  return (
    <aside className="app-sidebar">
      {/* Logo e título */}
      <div className="sidebar-header">
        <h1>Sistema Centrus</h1>
      </div>

      {/* Menu de navegação */}
      <nav className="sidebar-menu">
        <button
          className={paginaAtual === 'dashboard' ? 'menu-item-active' : 'menu-item'}
          onClick={() => onMudarPagina('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          className={paginaAtual === 'funcionarios' ? 'menu-item-active' : 'menu-item'}
          onClick={() => onMudarPagina('funcionarios')}
        >
          <Users size={20} />
          <span>Funcionários</span>
        </button>

        {/* Separador visual */}
        <div className="menu-divider"></div>
        <div className="menu-section-title">Módulos</div>

        <button
          className={paginaAtual === 'solicitacao-viagem' ? 'menu-item-active' : 'menu-item'}
          onClick={() => onMudarPagina('solicitacao-viagem')}
        >
          <Plane size={20} />
          <span>Solicitação Viagem</span>
        </button>

        <button
          className={paginaAtual === 'docs-empresa' ? 'menu-item-active' : 'menu-item'}
          onClick={() => onMudarPagina('docs-empresa')}
        >
          <Building2 size={20} />
          <span>Docs Empresa</span>
        </button>

        <button
          className={paginaAtual === 'download-massa' ? 'menu-item-active' : 'menu-item'}
          onClick={() => onMudarPagina('download-massa')}
        >
          <Download size={20} />
          <span>Download em Massa</span>
        </button>

        <button
          className={paginaAtual === 'novo-funcionario' ? 'menu-item-active' : 'menu-item'}
          onClick={() => onMudarPagina('novo-funcionario')}
        >
          <UserPlus size={20} />
          <span>Novo Funcionário</span>
        </button>

        {/* Mostrar opção de gerenciar usuários apenas para admin */}
        {usuario && usuario.tipo === 'admin' && (
          <>
            <div className="menu-divider"></div>
            <div className="menu-section-title">Administração</div>
            
            <button
              className={paginaAtual === 'usuarios' ? 'menu-item-active' : 'menu-item'}
              onClick={() => onMudarPagina('usuarios')}
            >
              <UserCog size={20} />
              <span>Gerenciar Usuários</span>
            </button>
          </>
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
            <span className="user-role">{usuario?.tipo === 'admin' ? 'Administrador' : 'Usuário'}</span>
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