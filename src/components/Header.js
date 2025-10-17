// src/components/Header.js - EXEMPLO DE REFERÊNCIA
// Use este código como referência para adicionar o Dashboard ao seu Header existente
import React from 'react'
import { LogOut, Users, FileText, BarChart3 } from 'lucide-react'

function Header({ usuario, onLogout, paginaAtual, onMudarPagina }) {
  // Componente do cabeçalho da aplicação
  
  return (
    <header className="app-header"> {/* Cabeçalho principal */}
      <div className="header-content"> {/* Container do conteúdo do cabeçalho */}
        <div className="header-left"> {/* Lado esquerdo - Logo e título */}
          <h1>Sistema Centrus</h1> {/* Título da aplicação */}
        </div>

        <nav className="header-menu"> {/* Menu de navegação */}
          
          {/* NOVO: Botão Dashboard */}
          <button
            onClick={() => onMudarPagina('dashboard')} // Função para mudar para a página dashboard
            className={paginaAtual === 'dashboard' ? 'menu-item menu-item-active' : 'menu-item'} // Classe condicional
            title="Dashboard" // Tooltip
          >
            <BarChart3 size={20} /> {/* Ícone de gráfico/dashboard */}
            <span>Dashboard</span> {/* Texto do menu */}
          </button>

          {/* Botão Funcionários */}
          <button
            onClick={() => onMudarPagina('funcionarios')} // Função para mudar para a página de funcionários
            className={paginaAtual === 'funcionarios' ? 'menu-item menu-item-active' : 'menu-item'} // Classe condicional
            title="Funcionários" // Tooltip
          >
            <Users size={20} /> {/* Ícone de usuários */}
            <span>Funcionários</span> {/* Texto do menu */}
          </button>

          {/* Botão Usuários (apenas para admin) */}
          {usuario?.isAdmin && ( // Renderizar apenas se o usuário for admin
            <button
              onClick={() => onMudarPagina('usuarios')} // Função para mudar para a página de usuários
              className={paginaAtual === 'usuarios' ? 'menu-item menu-item-active' : 'menu-item'} // Classe condicional
              title="Gerenciar Usuários" // Tooltip
            >
              <FileText size={20} /> {/* Ícone de documento/configuração */}
              <span>Usuários</span> {/* Texto do menu */}
            </button>
          )}
        </nav>

        <div className="header-right"> {/* Lado direito - Informações do usuário */}
          <div className="user-info"> {/* Informações do usuário */}
            <span className="user-name">{usuario?.nome}</span> {/* Nome do usuário */}
            <span className="user-role">{usuario?.isAdmin ? 'Admin' : 'Usuário'}</span> {/* Tipo de usuário */}
          </div>
          
          <button 
            onClick={onLogout} // Função para fazer logout
            className="btn-logout" // Classe do botão de logout
            title="Sair" // Tooltip
          >
            <LogOut size={20} /> {/* Ícone de logout */}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header // Exporta o componente Header