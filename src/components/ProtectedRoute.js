// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { AuthService } from '../authDb';
import { Shield, AlertCircle } from 'lucide-react';
import './styles/ProtectedRoute.css';

const ProtectedRoute = ({ children, requererAdmin = false, paginaId = null }) => {
  // Componente para proteger rotas baseado em permissões
  const [autenticado, setAutenticado] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [temPermissao, setTemPermissao] = useState(false);

  useEffect(() => {
    verificarAutenticacao();
  }, []);

  const verificarAutenticacao = async () => {
    try {
      const estaAuth = await AuthService.estaAutenticado();
      
      if (!estaAuth) {
        setAutenticado(false);
        setVerificando(false);
        return;
      }

      const usuarioAtual = await AuthService.obterUsuarioAtual();
      
      if (!usuarioAtual) {
        setAutenticado(false);
        setVerificando(false);
        return;
      }

      setUsuario(usuarioAtual);

      // Se requer admin, verificar se o usuário é admin
      if (requererAdmin && usuarioAtual.tipo !== 'admin') {
        setAutenticado(false);
        setTemPermissao(false);
        setVerificando(false);
        return;
      }

      // Se tem paginaId, verificar permissão específica
      if (paginaId && usuarioAtual.tipo !== 'admin') {
        const permissoesUsuario = usuarioAtual.permissoes || [];
        const possuiPermissao = permissoesUsuario.includes(paginaId);
        
        if (!possuiPermissao) {
          console.log('❌ Acesso negado:', usuarioAtual.nome, 'tentou acessar', paginaId);
          setAutenticado(true);
          setTemPermissao(false);
          setVerificando(false);
          return;
        }
        
        console.log('✅ Acesso permitido:', usuarioAtual.nome, 'acessou', paginaId);
      }

      setAutenticado(true);
      setTemPermissao(true);
      setVerificando(false);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAutenticado(false);
      setVerificando(false);
    }
  };

  if (verificando) {
    return (
      <div className="verificando-auth">
        <div className="spinner-grande"></div>
        <p>Verificando permissões...</p>
      </div>
    );
  }

  if (!autenticado) {
    return (
      <div className="acesso-negado">
        <div className="acesso-negado-card">
          <AlertCircle size={64} color="#ffc107" />
          <h2>Autenticação Necessária</h2>
          <p>Você precisa fazer login para acessar esta página.</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-voltar"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  if (autenticado && !temPermissao) {
    return (
      <div className="acesso-negado">
        <div className="acesso-negado-card">
          <Shield size={64} color="#dc3545" />
          <h2>Acesso Negado</h2>
          {requererAdmin ? (
            <>
              <p>Esta área é exclusiva para administradores.</p>
              <p className="usuario-info">
                Você está logado como: <strong>{usuario?.nome}</strong> ({usuario?.tipo})
              </p>
            </>
          ) : (
            <>
              <p>Você não tem permissão para acessar esta página.</p>
              <p className="usuario-info">
                Entre em contato com um administrador para solicitar acesso.
              </p>
            </>
          )}
          <button 
            onClick={() => window.history.back()}
            className="btn-voltar"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;