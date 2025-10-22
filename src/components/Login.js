import React, { useState } from 'react';
import { LogIn, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../authDb';
import './styles/Login.css'; 

const Login = ({ onLoginSucesso }) => { // Adicionado o parâmetro onLoginSucesso
  const [email, setEmail] = useState(''); 
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => { // Adicionado o parâmetro e
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (!email || !senha) { // Verifica se os campos de email e senha foram preenchidos
      setErro('Por favor, preencha todos os campos');
      setCarregando(false);
      return;
    }

    try { // Tenta fazer o login
      const resultado = await AuthService.login(email, senha); // Chama a função de login

      if (resultado.sucesso) { // Se o login foi bem-sucedido
        onLoginSucesso(resultado.usuario);
      } else { // Se o login falhou
        setErro(resultado.erro);
      }
    } catch (error) { // Caso ocorra algum erro
      setErro('Erro ao fazer login. Tente novamente.');
    } finally { // Sempre executado
      setCarregando(false);
    }
  };

  return (
    <div className="login-container"> {/* Container principal */}
      <div className="login-background"> {/* Fundo */}
        <div className="login-shapes"> {/* Formas de fundo */}
          <div className="shape shape-1"></div> {/* Forma 1 */}
          <div className="shape shape-2"></div> {/* Forma 2 */}
          <div className="shape shape-3"></div> {/* Forma 3 */}
        </div>
      </div>

      <div className="login-card"> {/* Cartão de login */}
        <div className="login-header"> {/* Cabecalho do cartão */}
          <div className="login-logo"> {/* Logo do cartão */}
            <LogIn size={40} />
          </div>
          <h1>Sistema Centrus</h1>
          <p>Gerenciamento de Documentos</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form"> {/* Formulário de login */}
          {erro && (
            <div className="login-erro"> {/* Mensagem de erro */}
              <AlertCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          <div className="form-group"> {/* Campo de email */}
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

          <div className="form-group"> {/* Campo de senha */}
            <label htmlFor="senha">
              <Lock size={18} />
              Senha
            </label>
            <div className="senha-input-container"> {/* Container para o campo de senha e o botão de visibilidade */}
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
                className="toggle-senha" // Botão para alternar a visibilidade da senha
                onClick={() => setMostrarSenha(!mostrarSenha)}
                tabIndex="-1"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-login" // Botão de login
            disabled={carregando}
          >
            {carregando ? (
              <>
                <span className="spinner"></span> {/* Indicador de carregamento */}
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

        <div className="login-footer"> {/* Rodapé do cartão */}
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