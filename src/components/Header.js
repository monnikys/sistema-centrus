// src/components/Header.js
import React, { useState } from 'react';
import { 
  LogOut, User, Shield, Users, FileText, 
  Menu, X, ChevronDown, Key
} from 'lucide-react';
import { AuthService } from '../authDb';
import AlterarSenha from './AlterarSenha';
import './styles/Header.css';

const Header = ({ usuario, onLogout, paginaAtual, onMudarPagina }) => { // onLogout, onMudarPagina
  const [menuAberto, setMenuAberto] = useState(false); // Estado para controlar se o menu está aberto
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false); // Estado para controlar se o menu de usuários está aberto
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false); // Estado para controlar se o modal de alteração de senha está aberto

  const handleLogout = async () => { // Função para lidar com logout
    if (window.confirm('Deseja realmente sair?')) { // Confirmação
      await AuthService.logout(); // Chamar função de logout
      onLogout();
    }
  };

  const abrirModalSenha = () => { // Função para abrir o modal de alteração de senha
    setModalSenhaAberto(true);
    setMenuUsuarioAberto(false);
    setMenuAberto(false);
  };

  const menuItems = [ // Itens do menu
    { 
      id: 'funcionarios', 
      label: 'Funcionários', 
      icon: FileText, 
      admin: false 
    },
    { 
      id: 'usuarios', 
      label: 'Gerenciar Usuários', 
      icon: Users, 
      admin: true 
    }
  ];

  const menuItemsVisiveis = menuItems.filter(item => // Filtrar itens visíveis com base na permissão do usuário
    !item.admin || usuario.tipo === 'admin' // Se o item requer admin e o usuário for admin, mostrar
  );

  return (
    <>
      <header className="app-header"> {/* Cabeçalho */}
        <div className="header-container"> {/* Container do cabeçalho */}
          <div className="header-left"> {/* Parte esquerda do cabeçalho */}
            <div className="logo"> {/* Logo do cabeçalho */}
              <FileText size={28} />
              <span className="logo-text">Sistema Centrus</span> {/* Texto do logo */}
            </div>
          </div>

          {/* Menu Desktop */}
          <nav className="header-nav desktop-nav">
            {menuItemsVisiveis.map(item => ( // Mapear itens visíveis com base na permissão do usuário
              <button
                key={item.id} // Chave do item
                className={`nav-item ${paginaAtual === item.id ? 'ativo' : ''}`} // Classe para indicar item ativo
                onClick={() => onMudarPagina(item.id)} // Função para lidar com mudança de páginas
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Informações do Usuário */}
          <div className="header-right"> {/* Parte direita do cabeçalho */}
            <div className="usuario-info-header"> {/* Informações do usuário */}
              <div 
                className="usuario-badge" // Botão de usuário 
                onClick={() => setMenuUsuarioAberto(!menuUsuarioAberto)}
              >
                <div className="usuario-avatar-header"> {/* Avatar do usuário */}
                  {usuario.tipo === 'admin' ? <Shield size={18} /> : <User size={18} />} {/* Icone de admin ou usuário */}
                </div>
                <div className="usuario-dados"> {/* Dados do usuário */}
                  <span className="usuario-nome">{usuario.nome}</span> {/* Nome do usuário */}
                  <span className="usuario-tipo"> {/* Tipo do usuário */}
                    {usuario.tipo === 'admin' ? 'Administrador' : 'Usuário'} {/* Texto de admin ou usuário */}
                  </span>
                </div>
                <ChevronDown size={18} className={`chevron ${menuUsuarioAberto ? 'rotacionado' : ''}`} /> {/* Icone de seta para baixo */}
              </div>

              {menuUsuarioAberto && ( // Menu de usuários
                <div className="dropdown-menu"> {/* Menu de usuários */}
                  <div className="dropdown-header"> {/* Cabecalho do menu de usuários */}
                    <strong>{usuario.nome}</strong> 
                    <span>{usuario.email}</span>
                  </div>
                  <button className="dropdown-item" onClick={abrirModalSenha}> {/* Botão de alteração de senha */}
                    <Key size={16} />
                    Alterar Senha
                  </button>
                  <button className="dropdown-item logout" onClick={handleLogout}> {/* Botão de saída */}
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>

            {/* Menu Mobile */}
            <button 
              className="menu-toggle" // Botão de menu mobile 
              onClick={() => setMenuAberto(!menuAberto)} // Função para lidar com abertura e fechamento do menu
            >
              {menuAberto ? <X size={24} /> : <Menu size={24} />} {/* Icone de menu ou X */}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {menuAberto && ( // Se o menu mobile estiver aberto
          <div className="mobile-menu"> {/* Navegação mobile */}
            {menuItemsVisiveis.map(item => ( // Mapear itens visíveis com base na permissão do usuário
              <button
                key={item.id}
                className={`mobile-nav-item ${paginaAtual === item.id ? 'ativo' : ''}`} // Classe para indicar item ativo}
                onClick={() => {
                  onMudarPagina(item.id);
                  setMenuAberto(false);
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <div className="mobile-divider"></div> {/* Divisor no menu de navegação mobile */}
            <button className="mobile-nav-item" onClick={abrirModalSenha}> {/* Botão de alteração de senha */}
              <Key size={20} />
              Alterar Senha
            </button>
            <button className="mobile-nav-item logout" onClick={handleLogout}> {/* Botão de saída */}
              <LogOut size={20} />
              Sair
            </button>
          </div>
        )}
      </header>

      {/* Modal de Alteração de Senha */}
      {modalSenhaAberto && (
        <AlterarSenha 
          usuario={usuario}
          onFechar={() => setModalSenhaAberto(false)}
        />
      )}
    </>
  );
};

export default Header; // Exporta o cabeçalho