// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { AuthService } from '../authDb';
import { Shield, AlertCircle } from 'lucide-react';
import './styles/ProtectedRoute.css';

const ProtectedRoute = ({ children, requererAdmin = false }) => {
  const [autenticado, setAutenticado] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

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

      // Se requer admin, verificar se o usuário é admin
      if (requererAdmin && usuarioAtual.tipo !== 'admin') {
        setAutenticado(false);
        setUsuario(usuarioAtual);
        setVerificando(false);
        return;
      }

      setUsuario(usuarioAtual);
      setAutenticado(true);
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
          {requererAdmin && usuario ? (
            <>
              <Shield size={64} color="#dc3545" />
              <h2>Acesso Restrito</h2>
              <p>Esta área é exclusiva para administradores.</p>
              <p className="usuario-info">
                Você está logado como: <strong>{usuario.nome}</strong> ({usuario.tipo})
              </p>
            </>
          ) : (
            <>
              <AlertCircle size={64} color="#ffc107" />
              <h2>Autenticação Necessária</h2>
              <p>Você precisa fazer login para acessar esta página.</p>
            </>
          )}
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

  return <>{children}</>;
};

export default ProtectedRoute;