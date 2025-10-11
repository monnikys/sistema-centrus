// src/components/Login.js
import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../authDb';
import './styles/Login.css'; 

const Login = ({ onLoginSucesso }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (!email || !senha) {
      setErro('Por favor, preencha todos os campos');
      setCarregando(false);
      return;
    }

    try {
      const resultado = await AuthService.login(email, senha);

      if (resultado.sucesso) {
        onLoginSucesso(resultado.usuario);
      } else {
        setErro(resultado.erro);
      }
    } catch (error) {
      setErro('Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={40} />
          </div>
          <h1>Sistema Centrus</h1>
          <p>Gerenciamento de Documentos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {erro && (
            <div className="login-erro">
              <AlertCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <User size={18} />
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              disabled={carregando}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">
              <Lock size={18} />
              Senha
            </label>
            <div className="senha-input-container">
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                disabled={carregando}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex="-1"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login"
            disabled={carregando}
          >
            {carregando ? (
              <>
                <span className="spinner"></span>
                Entrando...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <strong>Credenciais padrão:</strong><br />
            Email: admin@centrus.com<br />
            Senha: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;