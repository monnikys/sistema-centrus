// src/components/Header.js
import React, { useState } from 'react';
import { 
  LogOut, User, Shield, Users, FileText, 
  Menu, X, ChevronDown, Key
} from 'lucide-react';
import { AuthService } from '../authDb';
import AlterarSenha from './AlterarSenha';
import './styles/Header.css';

const Header = ({ usuario, onLogout, paginaAtual, onMudarPagina }) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await AuthService.logout();
      onLogout();
    }
  };

  const abrirModalSenha = () => {
    setModalSenhaAberto(true);
    setMenuUsuarioAberto(false);
    setMenuAberto(false);
  };

  const menuItems = [
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

  const menuItemsVisiveis = menuItems.filter(item => 
    !item.admin || usuario.tipo === 'admin'
  );

  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <FileText size={28} />
              <span className="logo-text">Sistema Centrus</span>
            </div>
          </div>

          {/* Menu Desktop */}
          <nav className="header-nav desktop-nav">
            {menuItemsVisiveis.map(item => (
              <button
                key={item.id}
                className={`nav-item ${paginaAtual === item.id ? 'ativo' : ''}`}
                onClick={() => onMudarPagina(item.id)}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Informações do Usuário */}
          <div className="header-right">
            <div className="usuario-info-header">
              <div 
                className="usuario-badge"
                onClick={() => setMenuUsuarioAberto(!menuUsuarioAberto)}
              >
                <div className="usuario-avatar-header">
                  {usuario.tipo === 'admin' ? <Shield size={18} /> : <User size={18} />}
                </div>
                <div className="usuario-dados">
                  <span className="usuario-nome">{usuario.nome}</span>
                  <span className="usuario-tipo">
                    {usuario.tipo === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
                <ChevronDown size={18} className={`chevron ${menuUsuarioAberto ? 'rotacionado' : ''}`} />
              </div>

              {menuUsuarioAberto && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{usuario.nome}</strong>
                    <span>{usuario.email}</span>
                  </div>
                  <button className="dropdown-item" onClick={abrirModalSenha}>
                    <Key size={16} />
                    Alterar Senha
                  </button>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>

            {/* Menu Mobile */}
            <button 
              className="menu-toggle"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              {menuAberto ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {menuAberto && (
          <div className="mobile-menu">
            {menuItemsVisiveis.map(item => (
              <button
                key={item.id}
                className={`mobile-nav-item ${paginaAtual === item.id ? 'ativo' : ''}`}
                onClick={() => {
                  onMudarPagina(item.id);
                  setMenuAberto(false);
                }}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
            <div className="mobile-divider"></div>
            <button className="mobile-nav-item" onClick={abrirModalSenha}>
              <Key size={20} />
              Alterar Senha
            </button>
            <button className="mobile-nav-item logout" onClick={handleLogout}>
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

export default Header;